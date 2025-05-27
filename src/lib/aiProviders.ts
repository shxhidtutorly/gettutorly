
// AI Provider Management with automatic key rotation and model routing
export class AIProviderManager {
  private apiKeys: Record<string, string[]>;
  
  constructor() {
    // Load API keys from environment variables
    // Multiple keys per provider for automatic rotation
    this.apiKeys = {
      gemini: this.getKeysFromEnv('VITE_GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('VITE_GROQ_API_KEY'),
      claude: this.getKeysFromEnv('VITE_CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('VITE_OPENROUTER_API_KEY'),
      huggingface: this.getKeysFromEnv('VITE_HUGGINGFACE_API_KEY'),
      together: this.getKeysFromEnv('VITE_TOGETHER_API_KEY'),
    };
  }

  /**
   * Extract API keys from environment variables
   * Supports both single keys and comma-separated multiple keys
   */
  private getKeysFromEnv(envVar: string): string[] {
    const keys = process.env[envVar];
    if (!keys) return [];
    
    // Split by comma and trim whitespace, filter out empty strings
    return keys.split(',').map(key => key.trim()).filter(key => key.length > 0);
  }

  /**
   * Main method to get AI response with automatic provider routing and key rotation
   */
  async getAIResponse(prompt: string, model: string): Promise<{
    message: string;
    provider: string;
    model: string;
  }> {
    const provider = this.getProviderForModel(model);
    const keys = this.apiKeys[provider];
    
    if (!keys || keys.length === 0) {
      throw new Error(`No API keys found for provider: ${provider}`);
    }

    // Try each API key until one works (automatic key rotation)
    let lastError: Error | null = null;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        console.log(`Attempting ${provider} with key ${i + 1}/${keys.length}`);
        
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
        
        // Continue to next key if this one failed
        continue;
      }
    }
    
    // All keys failed
    throw new Error(`All API keys failed for ${provider}. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Map model names to their corresponding providers
   */
  private getProviderForModel(model: string): string {
    const modelProviderMap: Record<string, string> = {
      'gemini': 'gemini',
      'groq': 'groq',
      'claude': 'claude',
      'openrouter': 'openrouter',
      'huggingface': 'huggingface',
      'together': 'together'
    };
    
    return modelProviderMap[model] || model;
  }

  /**
   * Call the specific AI provider with error handling and retry logic
   */
  private async callProvider(provider: string, prompt: string, apiKey: string, model: string): Promise<string> {
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

  /**
   * Google Gemini API integration
   */
  private async callGemini(prompt: string, apiKey: string): Promise<string> {
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

  /**
   * Groq API integration
   */
  private async callGroq(prompt: string, apiKey: string): Promise<string> {
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

  /**
   * Anthropic Claude API integration
   */
  private async callClaude(prompt: string, apiKey: string): Promise<string> {
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

  /**
   * OpenRouter API integration
   */
  private async callOpenRouter(prompt: string, apiKey: string, model: string): Promise<string> {
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

  /**
   * Hugging Face Inference API integration
   */
  private async callHuggingFace(prompt: string, apiKey: string): Promise<string> {
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

  /**
   * Together.ai API integration
   */
  private async callTogether(prompt: string, apiKey: string): Promise<string> {
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
