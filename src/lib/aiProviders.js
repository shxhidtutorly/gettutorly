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

  async getAIResponse(prompt, model) {
    const requestedProvider = this.getProviderForModel(model);
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

      console.log(`⚠️ All keys failed for provider: ${provider}, trying next provider...`);
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

  async callGemini(prompt, apiKey) {
  const isMultimodal = typeof prompt !== 'string' || prompt.includesMedia;

  const modelsToTry = isMultimodal
    ? ['gemini-1.5-pro-latest']
    : ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];

  const buildParts = (input) => {
    if (typeof input === 'string') return [{ text: input }];
    const parts = [];
    if (input.text) parts.push({ text: input.text });
    if (input.image) parts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.base64 } });
    if (input.audio) parts.push({ inlineData: { mimeType: input.audio.mimeType, data: input.audio.base64 } });
    if (input.document) parts.push({ inlineData: { mimeType: input.document.mimeType, data: input.document.base64 } });
    return parts;
  };

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: buildParts(prompt) }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 1000
          }
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        console.warn(`⚠️ Gemini ${model} error:`, data.error?.message || response.statusText);
        continue;
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
    } catch (err) {
      console.error(`❌ Exception using Gemini model ${model}:`, err);
    }
  }

  throw new Error('All Gemini model attempts failed.');
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

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
