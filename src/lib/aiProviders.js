console.log('📦 Loading aiProviders.js...');

class AIProviderManager {
  constructor() {
    console.log('🔧 Initializing AI Provider Manager...');
    this.providerOrder = ['together', 'gemini', 'groq', 'claude', 'openrouter', 'huggingface'];
    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      claude: this.getKeysFromEnv('CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      huggingface: this.getKeysFromEnv('HUGGINGFACE_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
    };

    Object.entries(this.apiKeys).forEach(([provider, keys]) => {
      console.log(`🔑 ${provider}: ${keys.length} keys available`);
    });
  }

  getKeysFromEnv(envVar) {
    const keys = process.env[envVar];
    if (!keys) {
      console.log(`⚠️ No keys found for ${envVar}`);
      return [];
    }
    return keys.split(',').map(key => key.trim()).filter(Boolean);
  }

  // FIXED: Added missing curly braces for the method body
  async getAIResponse(prompt, model) {
    const requestedProvider = this.getProviderForModel(model);
    const fallbackProviders = [requestedProvider, ...this.providerOrder.filter(p => p !== requestedProvider)];

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) continue;

      for (let i = 0; i < keys.length; i++) {
        try {
          const response = await this.callProvider(provider, prompt, keys[i], model);
          return { message: response, provider, model };
        } catch (error) {
          console.log(`❌ Failed with ${provider} key ${i + 1}:`, error.message);
        }
      }
    }

    throw new Error(`All API keys failed for all providers.`);
  }


  getProviderForModel(model) {
    const modelProviderMap = {
      gemini: 'gemini',
      groq: 'groq',
      claude: 'claude',
      openrouter: 'openrouter',
      huggingface: 'huggingface',
      together: 'together'
    };
    return modelProviderMap[model] || model;
  }

  async callProvider(provider, prompt, apiKey, model) {
    switch (provider) {
      case 'gemini':
        // If prompt is a string, convert it to the expected object format for Gemini
        if (typeof prompt === 'string') {
          return await this.callGemini({ text: prompt }, apiKey);
        }
        return await this.callGemini(prompt, apiKey);
      case 'groq':
        // Ensure prompt is a string for Groq
        if (typeof prompt !== 'string') {
          throw new Error('Groq API expects a string prompt.');
        }
        return await this.callGroq(prompt, apiKey);
      case 'claude':
        // Ensure prompt is a string for Claude
        if (typeof prompt !== 'string') {
          throw new Error('Claude API expects a string prompt.');
        }
        return await this.callClaude(prompt, apiKey);
      case 'openrouter':
        // Ensure prompt is a string for OpenRouter
        if (typeof prompt !== 'string') {
          throw new Error('OpenRouter API expects a string prompt.');
        }
        return await this.callOpenRouter(prompt, apiKey, model);
      case 'huggingface':
        // Ensure prompt is a string for HuggingFace
        if (typeof prompt !== 'string') {
          throw new Error('Hugging Face API expects a string prompt.');
        }
        return await this.callHuggingFace(prompt, apiKey);
      case 'together':
        // Ensure prompt is a string for Together
        if (typeof prompt !== 'string') {
          throw new Error('Together API expects a string prompt.');
        }
        return await this.callTogether(prompt, apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // FIXED: Corrected the fetch call syntax (options object was malformed)
  // Also updated prompt to expect an object { text, files }
  async callGemini(prompt, apiKey) {
    const parts = [];

    if (prompt.text) parts.push({ text: prompt.text });

    if (prompt.files) {
      for (const file of prompt.files) {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.base64
          }
        });
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1800
        }
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
    console.error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`, data);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
  }

  const geminiTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!geminiTextResponse) {
    console.warn('⚠️ Gemini returned no text content. Full response data:', JSON.stringify(data, null, 2));
    // Check for specific reasons from Gemini's response structure
    if (data.promptFeedback?.blockReason) {
      console.warn(`Gemini blocked response due to: ${data.promptFeedback.blockReason}`);
      // Possible block reasons: "SAFETY", "OTHER"
    }
    if (data.candidates?.[0]?.finishReason) {
      console.warn(`Gemini finished with reason: ${data.candidates[0].finishReason}`);
      // Possible finish reasons: "STOP", "MAX_TOKENS", "SAFETY", "RECITATION", "OTHER"
    }
    // Return a more informative message if you want to display it on the frontend
    return 'No response from Gemini (check server logs for details).';
  }

  return geminiTextResponse;
}

  async callGroq(prompt, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    return data.choices?.[0]?.message?.content || 'No response from Groq';
  }

  async callClaude(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    // --- ADDED LOGGING HERE ---
  if (!response.ok || data.error) {
    console.error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`, data); // Log full error data
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
  }

  const geminiTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!geminiTextResponse) {
    console.warn('⚠️ Gemini returned no text content. Full response data:', JSON.stringify(data, null, 2));
    // Check for specific reasons from Gemini, e.g., safety ratings
    if (data.promptFeedback?.blockReason) {
      console.warn(`Gemini blocked response due to: ${data.promptFeedback.blockReason}`);
    }
    if (data.candidates?.[0]?.finishReason) {
      console.warn(`Gemini finished with reason: ${data.candidates[0].finishReason}`);
    }
    return 'No response from Gemini (see server logs for details).'; // Add hint for debugging
  }

  return geminiTextResponse;
}

  async callOpenRouter(prompt, apiKey, model) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.vercel.app',
        'X-Title': 'AI Provider Manager'
      },
      body: JSON.stringify({
        // Consider making this model dynamic based on the 'model' parameter passed in,
        // or ensure it's a model you intend to use with OpenRouter.
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    return data.choices?.[0]?.message?.content || 'No response from OpenRouter';
  }

  async callHuggingFace(prompt, apiKey) {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 900,
          temperature: 0.3
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    return Array.isArray(data) ? data[0]?.generated_text || 'No response from Hugging Face' : data.generated_text || 'No response from Hugging Face';
  }

  async callTogether(prompt, apiKey) {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Consider making this model dynamic based on the 'model' parameter passed in,
        // or ensure it's a model you intend to use with Together.ai.
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.3
      })
    });

    const data = await response.json();

    console.log('📥 Together API full response:', JSON.stringify(data, null, 2));
    const message = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason || 'unknown';
    console.log(`📌 Together finish reason: ${finishReason}`);

    if (!message || message.length < 20) {
      console.warn('⚠️ Short or missing response from Together:', message);
    }

    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    return message || 'No response from Together.ai';
  }
}

export { AIProviderManager };
console.log('✅ AIProviderManager exported successfully');
