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

    // Add instruction to keep responses concise
    const optimizedPrompt = `${prompt}\n\nPlease provide a concise, focused response (2-3 sentences maximum).`;

    let lastError = null;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        console.log(`🔄 Attempting ${provider} with key ${i + 1}/${keys.length}`);
        
        const response = await this.callProvider(provider, optimizedPrompt, keys[i], model);
        
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower for more focused responses
          topK: 20,         // Reduced for more predictable output
          topP: 0.8,        // Reduced for more focused responses
          maxOutputTokens: 200, // REDUCED: was 1000, now 200
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
        max_tokens: 200,      // REDUCED: was 1000, now 200
        temperature: 0.3      // Lower for more focused responses
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
        max_tokens: 200,    // REDUCED: was 1000, now 200
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3    // Lower for more focused responses
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
        max_tokens: 200,    // REDUCED: was 1000, now 200
        temperature: 0.3    // Lower for more focused responses
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
          max_new_tokens: 200,  // REDUCED: was 1000, now 200
          temperature: 0.3      // Lower for more focused responses
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
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,    // REDUCED: was 1000, now 200
        temperature: 0.3    // Lower for more focused responses
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

// Export the class
export { AIProviderManager };

console.log('✅ AIProviderManager exported successfully');
