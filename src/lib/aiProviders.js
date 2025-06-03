// src/lib/aiProviders.js
console.log('📦 Loading aiProviders.js...');

class AIProviderManager {
  constructor() {
    console.log('🔧 Initializing AI Provider Manager...');
    // Providers are ordered for fallback: together first, then others
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
    const keyArray = keys.split(',').map(key => key.trim()).filter(key => key.length > 0);
    console.log(`📋 Found ${keyArray.length} keys for ${envVar}`);
    return keyArray;
  }

  // MODEL FALLBACK LOGIC HERE
  async getAIResponse(prompt, model) {
    const requestedProvider = this.getProviderForModel(model);
    // Fallback order: requested provider first, then others
    const fallbackProviders = [requestedProvider, ...this.providerOrder.filter(p => p !== requestedProvider)];

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        console.log(`⚠️ No keys for provider: ${provider}, skipping...`);
        continue;
      }
      let lastError = null;
      for (let i = 0; i < keys.length; i++) {
        try {
          console.log(`🔄 Attempting ${provider} with key ${i + 1}/${keys.length}`);
          // No "2-3 sentences" constraint!
          const response = await this.callProvider(provider, prompt, keys[i], model);
          console.log(`✅ Success with ${provider} key ${i + 1}`);
          return {
            message: response,
            provider,
            model
          };
        } catch (error) {
          console.log(`❌ Failed with ${provider} key ${i + 1}:`, error instanceof Error ? error.message : error);
          lastError = error instanceof Error ? error : new Error(String(error));
          continue;
        }
      }
      // If all keys for this provider fail, try next provider in order.
      console.log(`⚠️ All keys failed for provider: ${provider}, trying next provider...`);
    }
    throw new Error(`All API keys failed for all providers.`);
  }

  getProviderForModel(model) {
    const modelProviderMap = {
      'gemini': 'gemini',
      'groq': 'groq',
      'claude': 'claude',
      'openrouter': 'openrouter',
      'huggingface': 'huggingface',
      'together': 'together'
    };
    return modelProviderMap[model] || model;
  }

  async callProvider(provider, prompt, apiKey, model) {
    switch (provider) {
      case 'gemini':
        return await this.callGemini(prompt, apiKey);
      case 'groq':
        return await this.callGroq(prompt, apiKey);
      case 'claude':
        return await this.callClaude(prompt, apiKey);
      case 'openrouter':
        return await this.callOpenRouter(prompt, apiKey, model);
      case 'huggingface':
        return await this.callHuggingFace(prompt, apiKey);
      case 'together':
        return await this.callTogether(prompt, apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async callGemini(prompt, apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 800, // Increased for better output
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Gemini API Error Response: ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
  }

  async callGroq(prompt, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Groq API Error Response: ${errorText}`);
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
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

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Claude API Error Response: ${errorText}`);
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'No response from Claude';
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
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenRouter API Error Response: ${errorText}`);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
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
          max_new_tokens: 400, // Less for HuggingFace (API limits)
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Hugging Face API Error Response: ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data[0]?.generated_text || 'No response from Hugging Face';
    }
    return data.generated_text || 'No response from Hugging Face';
  }

  async callTogether(prompt, apiKey) {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-2-70b-chat-hf',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096, // Maximum for Together
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Together.ai API Error Response: ${errorText}`);
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response from Together.ai';
  }
}

export { AIProviderManager };
console.log('✅ AIProviderManager exported successfully');
