// src/lib/aiProviders.js
console.log('📦 Loading aiProviders.js...');

class AIProviderManager {
  constructor() {
    console.log('🔧 Initializing AI Provider Manager...');
    
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

  async getAIResponse(prompt, model) {
    const provider = this.getProviderForModel(model);
    const keys = this.apiKeys[provider];
    
    console.log(`🎯 Using provider: ${provider} for model: ${model}`);
    
    if (!keys || keys.length === 0) {
      throw new Error(`No API keys found for provider: ${provider}`);
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
    
    throw new Error(`All API keys failed for ${provider}. Last error: ${lastError?.message || 'Unknown error'}`);
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
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
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'No response from Claude';
  }

  async callOpenRouter(prompt, apiKey, model) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response from OpenRouter';
  }

  async callHuggingFace(prompt, apiKey) {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || data.generated_text || 'No response from Hugging Face';
  }

  async callTogether(prompt, apiKey) {
    const response = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'togethercomputer/llama-2-70b-chat',
        prompt: prompt,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.output?.choices?.[0]?.text || data.choices?.[0]?.text || 'No response from Together.ai';
  }
}

// Export the class
export { AIProviderManager };

console.log('✅ AIProviderManager exported successfully');
