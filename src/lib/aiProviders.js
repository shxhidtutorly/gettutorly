class AIProviderManager {
  constructor() {
    // Order of preference for provider fallback
    this.providerOrder = [
      'together',
      'gemini',
      'groq',
      'claude',
      'openrouter',
      'mistral',
      'cerebras',
      'nvidia'
    ];

    // Map of environment var names to provider keys
    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      claude: this.getKeysFromEnv('CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
      mistral: this.getKeysFromEnv('MISTRAL_API_KEY').concat(this.getKeysFromEnv('MINISTRAL_API_KEY')),
      nvidia: this.getKeysFromEnv('NVIDIA_API_KEY').concat(this.getKeysFromEnv('NVIDA_API_KEY')),
      cerebras: this.getKeysFromEnv('CEREBRAS_API_KEY'),
    };

    // Provider max context/token capacity defaults
    this.defaultProviderMaxTokens = {
      together: 8192,
      gemini: 8192,
      groq: 32768,
      claude: 200000,
      openrouter: 128000,
      mistral: 32768,
      cerebras: 8192,
      nvidia: 32768
    };

    // Load effective max tokens (allow override via env var name MAX_TOKENS_{PROVIDER})
    this.providerMaxTokens = {};
    Object.keys(this.defaultProviderMaxTokens).forEach((prov) => {
      const envName = `MAX_TOKENS_${prov.toUpperCase()}`;
      const envVal = process.env[envName];
      this.providerMaxTokens[prov] = envVal ? parseInt(envVal, 10) : this.defaultProviderMaxTokens[prov];
    });
  }

  getKeysFromEnv(envVar) {
    const keys = process.env[envVar];
    if (!keys) {
      return [];
    }
    return keys.split(',').map(k => k.trim()).filter(Boolean);
  }

  /* ----------------------------
     Utilities: token estimation & error checks
     ---------------------------- */

  estimateTokens(text) {
    if (!text) return 0;
    if (typeof text !== 'string') text = String(text);
    return Math.ceil(text.length / 4);
  }

  getProviderMaxTokens(provider) {
    return this.providerMaxTokens[provider] || 8192;
  }

  getSafeMaxOutputTokens(provider, promptText, desiredMax) {
    const providerLimit = this.getProviderMaxTokens(provider);
    const promptTokens = this.estimateTokens(promptText);
    const safe = Math.max(16, Math.min(desiredMax, providerLimit - promptTokens - 16));
    return safe;
  }

  isTokenLimitError(err) {
    if (!err) return false;
    const msg = (err.message || String(err)).toLowerCase();
    return (
      (msg.includes('tokens') && msg.includes('must')) ||
      msg.includes('max_tokens') && (msg.includes('exceed') || msg.includes('must be')) ||
      msg.includes('max_new_tokens') ||
      msg.includes('max_output_tokens') ||
      msg.includes('finishreason') && msg.includes('max') ||
      msg.includes('max tokens') ||
      msg.includes('input validation error') ||
      msg.includes('context_length_exceeded')
    );
  }

  removeMarkdownFormatting(text) {
    if (typeof text !== 'string') {
      return String(text || '');
    }
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '$1$2');
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '$1$2');
    text = text.replace(/^#+\s*(.*)$/gm, '$1');
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`(.*?)`/g, '$1');
    text = text.replace(/^[\*\-\+]\s*(.*)$/gm, '$1');
    text = text.replace(/^\d+\.\s*(.*)$/gm, '$1');
    text = text.replace(/^>\s*(.*)$/gm, '$1');
    text = text.replace(/^[-\*\_]{3,}\s*$/gm, '');
    text = text.split('\n').map(line => line.trim()).join('\n');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text;
  }

  /* ----------------------------
     Main entrypoint: getAIResponse with fallback + retries
     ---------------------------- */

  async getAIResponse(prompt, model, options = {}) {
    const requestedProvider = this.getProviderForModel(model);
    const fallbackProviders = [requestedProvider, ...this.providerOrder.filter(p => p !== requestedProvider)];

    let promptTextForEstimate = '';
    if (typeof prompt === 'string') {
      promptTextForEstimate = prompt;
    } else if (prompt && typeof prompt === 'object' && prompt.text) {
      promptTextForEstimate = prompt.text;
    } else {
      promptTextForEstimate = JSON.stringify(prompt || '');
    }

    const desiredMaxOutput = options.maxOutputTokens || 8000;

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        continue;
      }

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const attemptMaxList = [
          this.getSafeMaxOutputTokens(provider, promptTextForEstimate, desiredMaxOutput),
          Math.max(16, Math.floor(desiredMaxOutput / 2)),
          Math.max(16, Math.floor(desiredMaxOutput / 4)),
          128,
          32
        ].filter((v, idx, arr) => v > 0 && arr.indexOf(v) === idx);

        let lastError = null;

        for (const attemptMax of attemptMaxList) {
          try {
            // Pass the original model preference so provider functions can use it if it's specific
            const response = await this.callProvider(provider, prompt, key, model, { maxTokens: attemptMax });
            return { message: response, provider, model, usedKeyIndex: i, usedMaxTokens: attemptMax };
          } catch (error) {
            lastError = error;
            console.error(`Error with ${provider} (key ${i+1}): ${error.message}`);
            if (!this.isTokenLimitError(error)) {
              break;
            }
          }
        }
        if (lastError) {
          continue;
        }
      }
    }

    throw new Error('All API keys failed for all providers. Please check your API keys and network connection.');
  }

  /* ----------------------------
     Model -> provider mapping
     ---------------------------- */
  getProviderForModel(model) {
    const modelProviderMap = {
      // Gemini
      'gemini-1.5-flash-latest': 'gemini',
      'gemini-1.5-pro-latest': 'gemini',
      // Groq
      'llama3-8b-8192': 'groq',
      'llama-3.1-8b-instant': 'groq',
      // Together
      'meta-llama/Llama-3-70b-chat-hf': 'together',
      // Claude
      'claude-3-5-sonnet-20240620': 'claude',
      // OpenRouter
      'mistralai/mistral-7b-instruct:free': 'openrouter',
      // Mistral
      'mistral-large-latest': 'mistral',
      // Cerebras
      'gpt-oss-120b': 'cerebras',
      // Nvidia
      'meta/llama3-70b-instruct': 'nvidia',
    };
    return modelProviderMap[model] || model;
  }


  /* ----------------------------
     callProvider dispatcher
     ---------------------------- */
  async callProvider(provider, prompt, apiKey, model, options = {}) {
    let finalPromptForAPI = prompt;
    if (typeof prompt === 'object' && prompt !== null) {
      if (provider !== 'gemini') {
        if (prompt.text !== undefined) {
          finalPromptForAPI = prompt.text;
        } else {
          finalPromptForAPI = JSON.stringify(prompt);
        }
      }
    } else if (typeof prompt !== 'string') {
      finalPromptForAPI = String(prompt);
    }

    switch (provider) {
      case 'gemini':
        if (typeof finalPromptForAPI === 'string') {
          return await this.callGemini({ text: finalPromptForAPI }, apiKey, options);
        }
        return await this.callGemini(finalPromptForAPI, apiKey, options);
      case 'groq':
        return await this.callGroq(finalPromptForAPI, apiKey, model, options);
      case 'claude':
        return await this.callClaude(finalPromptForAPI, apiKey, model, options);
      case 'openrouter':
        return await this.callOpenRouter(finalPromptForAPI, apiKey, model, options);
      case 'together':
        return await this.callTogether(finalPromptForAPI, apiKey, model, options);
      case 'mistral':
        return await this.callMistral(finalPromptForAPI, apiKey, model, options);
      case 'cerebras':
        return await this.callCerebras(finalPromptForAPI, apiKey, model, options);
      case 'nvidia':
        return await this.callNvidia(finalPromptForAPI, apiKey, model, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /* ----------------------------
     Provider-specific implementations
     ---------------------------- */

  // Gemini
  async callGemini(promptObj, apiKey, options = {}) {
    const parts = [];
    if (promptObj.text) parts.push({ text: promptObj.text });
    if (promptObj.files) {
      for (const file of promptObj.files) {
        parts.push({ inlineData: { mimeType: file.type, data: file.base64 } });
      }
    }
    const model = (promptObj.files && promptObj.files.length > 0) ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens || 8190
      }
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(`Gemini API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse && data.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error('Gemini finished due to MAX_TOKENS');
    return this.removeMarkdownFormatting(textResponse || '');
  }

  // Groq
  async callGroq(prompt, apiKey, model, options = {}) {
    const finalModel = this.getProviderForModel(model) === 'groq' ? (process.env.GROQ_MODEL || 'llama3-8b-8192') : model;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: finalModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.3
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Groq API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data.choices?.[0]?.message?.content || '');
  }

  // Claude
  async callClaude(prompt, apiKey, model, options = {}) {
    const finalModel = this.getProviderForModel(model) === 'claude' ? (process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620') : model;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: finalModel,
        max_tokens: options.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Claude API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data.content?.[0]?.text || '');
  }

  // OpenRouter
  async callOpenRouter(prompt, apiKey, model, options = {}) {
    const finalModel = this.getProviderForModel(model) === 'openrouter' ? (process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free') : model;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: finalModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.3
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`OpenRouter API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data.choices?.[0]?.message?.content || '');
  }

  // Together.ai
  async callTogether(prompt, apiKey, model, options = {}) {
    const finalModel = this.getProviderForModel(model) === 'together' ? (process.env.TOGETHER_MODEL || 'meta-llama/Llama-3-70b-chat-hf') : model;
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: finalModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.3
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Together.ai API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data.choices?.[0]?.message?.content || '');
  }

  // Mistral
  async callMistral(prompt, apiKey, model, options = {}) {
    // Use a valid, dated model name from the official docs
    const finalModel = this.getProviderForModel(model) === 'mistral'
        ? (process.env.MISTRAL_MODEL || 'mistral-medium-2508')
        : model;
    const url = 'https://api.mistral.ai/v1/chat/completions';
    const body = {
        model: finalModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens
    };
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
        throw new Error(`Mistral API error: ${resp.status} - ${data?.error?.message || JSON.stringify(data)}`);
    }
    return this.removeMarkdownFormatting(data?.choices?.[0]?.message?.content || '');
}

  // Cerebras
  async callCerebras(prompt, apiKey, model, options = {}) {
    // FIX: Use a valid default model from official docs.
    const finalModel = this.getProviderForModel(model) === 'cerebras' ? (process.env.CEREBRAS_MODEL || 'gpt-oss-120b') : model;
    const url = 'https://api.cerebras.net/v1/chat/completions';
    const body = {
      model: finalModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens
    };
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body) });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) throw new Error(`Cerebras HTTP ${resp.status} - ${JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data?.choices?.[0]?.message?.content || '');
  }

  // Nvidia
  async callNvidia(prompt, apiKey, model, options = {}) {
    // FIX: Use a valid default model from official docs.
    const finalModel = this.getProviderForModel(model) === 'nvidia' ? (process.env.NVIDIA_MODEL || 'meta/llama3-70b-instruct') : model;
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const body = {
      model: finalModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens
    };
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body) });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) throw new Error(`NVIDIA NIM HTTP ${resp.status} - ${JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data?.choices?.[0]?.message?.content || '');
  }
}

export { AIProviderManager };
