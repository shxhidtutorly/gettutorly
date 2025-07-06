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

  // --- START: ADD removeMarkdownFormatting METHOD HERE ---
  removeMarkdownFormatting(text) {
    // Ensure text is a string before processing
    if (typeof text !== 'string') {
        return String(text); // Convert to string if it's not already
    }

    // Remove bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '$1$2');

    // Remove italics (*text* or _text_)
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '$1$2');

    // Remove headings (# Heading)
    text = text.replace(/^#+\s*(.*)$/gm, '$1');

    // Remove code blocks (```code```)
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove inline code (`code`)
    text = text.replace(/`(.*?)`/g, '$1');

    // Remove bullet points/list markers (* item, - item, + item) - keep the text
    text = text.replace(/^[\*\-\+]\s*(.*)$/gm, '$1');

    // Remove numbered lists (1. item, 2. item) - keep the text
    text = text.replace(/^\d+\.\s*(.*)$/gm, '$1');

    // Remove blockquotes (> quote) - keep the text
    text = text.replace(/^>\s*(.*)$/gm, '$1');

    // Remove horizontal rules (---, ***, ___)
    text = text.replace(/^[-\*\_]{3,}\s*$/gm, '');

    // Trim leading/trailing whitespace from each line
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Replace multiple consecutive newlines with a maximum of two newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text;
  }
  // --- END: ADD removeMarkdownFormatting METHOD HERE ---


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
          maxOutputTokens: 1800 // Make sure this is the updated value (e.g., 2048 or 4096)
        }
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`, data);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let geminiTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text; // Use 'let' to allow reassigning

    if (!geminiTextResponse) {
      console.warn('⚠️ Gemini returned no text content. Full response data:', JSON.stringify(data, null, 2));
      if (data.promptFeedback?.blockReason) {
        console.warn(`Gemini blocked response due to: ${data.promptFeedback.blockReason}`);
      }
      if (data.candidates?.[0]?.finishReason) {
        console.warn(`Gemini finished with reason: ${data.candidates[0].finishReason}`);
      }
      return 'No response from Gemini (see server logs for details).';
    }

    // --- APPLY MARKDOWN REMOVAL HERE FOR GEMINI ---
    geminiTextResponse = this.removeMarkdownFormatting(geminiTextResponse);

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

    let groqResponse = data.choices?.[0]?.message?.content || 'No response from Groq';
    // --- APPLY MARKDOWN REMOVAL HERE FOR GROQ ---
    groqResponse = this.removeMarkdownFormatting(groqResponse);
    return groqResponse;
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

    const data = await response.json(); // You were missing this line
    // --- This block was incorrectly copied from Gemini, replacing with correct Claude error handling ---
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let claudeResponse = data.content?.[0]?.text || 'No response from Claude';
    // --- APPLY MARKDOWN REMOVAL HERE FOR CLAUDE ---
    claudeResponse = this.removeMarkdownFormatting(claudeResponse);
    return claudeResponse;
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

    let openRouterResponse = data.choices?.[0]?.message?.content || 'No response from OpenRouter';
    // --- APPLY MARKDOWN REMOVAL HERE FOR OPENROUTER ---
    openRouterResponse = this.removeMarkdownFormatting(openRouterResponse);
    return openRouterResponse;
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

    let huggingFaceResponse = Array.isArray(data) ? data[0]?.generated_text || 'No response from Hugging Face' : data.generated_text || 'No response from Hugging Face';
    // --- APPLY MARKDOWN REMOVAL HERE FOR HUGGINGFACE ---
    huggingFaceResponse = this.removeMarkdownFormatting(huggingFaceResponse);
    return huggingFaceResponse;
  }

  async callTogether(prompt, apiKey) {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', { // Changed to /v1/chat/completions for consistency with other chat models
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', // Use a chat-optimized model if possible
        model: 'meta-llama/Llama-3-8b-chat-hf', // Common chat model on Together.ai
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.3
      })
    });

    const data = await response.json();

    console.log('📥 Together API full response:', JSON.stringify(data, null, 2));
    let message = data.choices?.[0]?.message?.content; // For chat completions, content is in message.content
    const finishReason = data.choices?.[0]?.finish_reason || 'unknown';
    console.log(`📌 Together finish reason: ${finishReason}`);

    if (!message || message.length < 20) {
      console.warn('⚠️ Short or missing response from Together:', message);
    }

    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    // --- APPLY MARKDOWN REMOVAL HERE FOR TOGETHER ---
    message = this.removeMarkdownFormatting(message || ''); // Ensure it's a string, even if null/undefined
    return message;
  }
}

export { AIProviderManager };
console.log('✅ AIProviderManager exported successfully');
