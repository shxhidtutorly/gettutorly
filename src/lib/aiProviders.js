class AIProviderManager {
  constructor() {
    // RE-ORDERED: Prioritize fast, free, and reliable providers first.
    this.providerOrder = [
      'groq',
      'gemini',
      'openrouter',
      'together',
      'claude',
      'mistral',
      'nvidia',
    ];

    // Map of environment var names to provider keys
    // FIX: Corrected typos for MISTRAL and NVIDIA env vars.
    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      claude: this.getKeysFromEnv('CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
      mistral: this.getKeysFromEnv('MISTRAL_API_KEY'),
      nvidia: this.getKeysFromEnv('NVIDIA_API_KEY'),
    };

    // Provider max context/token capacity defaults
    // FIX: Removed the defunct 'cerebras' provider.
    this.defaultProviderMaxTokens = {
      together: 8192,
      gemini: 8192,
      groq: 32768,
      claude: 200000,
      openrouter: 128000,
      mistral: 32768,
      nvidia: 32768,
    };

    // Load effective max tokens (allow override via env var name MAX_TOKENS_{PROVIDER})
    this.providerMaxTokens = {};
    Object.keys(this.defaultProviderMaxTokens).forEach((prov) => {
      const envName = `MAX_TOKENS_${prov.toUpperCase()}`;
      const envVal = process.env[envName];
      this.providerMaxTokens[prov] = envVal ? parseInt(envVal, 10) : this.defaultProviderMaxTokens[prov];
    });

    // NEW: Default models for each provider. This is crucial for the fixed fallback logic.
    this.defaultModels = {
      groq: 'llama-3.1-8b-instant',
      gemini: 'gemini-1.5-flash-latest',
      openrouter: 'mistralai/mistral-7b-instruct:free',
      together: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      claude: 'claude-3-5-sonnet-20240620',
      mistral: 'open-mixtral-8x7b',
      nvidia: 'meta/llama3-8b-instruct',
    };
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

  async getAIResponse(prompt, requestedModel, options = {}) {
    const requestedProvider = this.getProviderForModel(requestedModel) || this.providerOrder[0];
    const uniqueProviders = new Set([requestedProvider, ...this.providerOrder]);
    const fallbackProviders = Array.from(uniqueProviders);

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

      // *** MAJOR FIX START ***
      // Determine the correct model to use for this specific provider attempt.
      // If the originally requested model belongs to this provider, use it.
      // Otherwise, use this provider's designated default model.
      let modelForThisAttempt = requestedModel;
      if (this.getProviderForModel(modelForThisAttempt) !== provider) {
        modelForThisAttempt = this.defaultModels[provider];
      }

      if (!modelForThisAttempt) {
        console.error(`No default model configured for provider: ${provider}. Skipping.`);
        continue;
      }
      // *** MAJOR FIX END ***

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const attemptMaxList = [
          this.getSafeMaxOutputTokens(provider, promptTextForEstimate, desiredMaxOutput),
          Math.max(16, Math.floor(desiredMaxOutput / 2)),
          Math.max(16, Math.floor(desiredMaxOutput / 4)),
          128,
          32,
        ].filter((v, idx, arr) => v > 0 && arr.indexOf(v) === idx);

        let lastError = null;

        for (const attemptMax of attemptMaxList) {
          try {
            console.log(`Attempting provider: ${provider} with model: ${modelForThisAttempt}`);
            const response = await this.callProvider(provider, prompt, key, modelForThisAttempt, { maxTokens: attemptMax });
            return { message: response, provider, model: modelForThisAttempt, usedKeyIndex: i, usedMaxTokens: attemptMax };
          } catch (error) {
            lastError = error;
            console.error(`Error with ${provider} (model: ${modelForThisAttempt}, key ${i+1}): ${error.message}`);
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
    // UPDATED: Modern, valid models. Removed Cerebras. Added more options.
    const modelProviderMap = {
      // Gemini
      'gemini-1.5-flash-latest': 'gemini',
      'gemini-1.5-pro-latest': 'gemini',
      // Groq
      'llama3-8b-8192': 'groq',
      'llama-3.1-8b-instant': 'groq',
      'llama-3.1-70b-versatile': 'groq',
      'mixtral-8x7b-32768': 'groq',
      // OpenRouter (Free models)
      'mistralai/mistral-7b-instruct:free': 'openrouter',
      'google/gemma-7b-it:free': 'openrouter',
      'nousresearch/nous-hermes-2-mixtral-8x7b-dpo': 'openrouter',
      // Together
      'meta-llama/Llama-3-70b-chat-hf': 'together',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': 'together',
      'mistralai/Mixtral-8x7B-Instruct-v0.1': 'together',
      // Claude
      'claude-3-5-sonnet-20240620': 'claude',
      'claude-3-opus-20240229': 'claude',
      'claude-3-haiku-20240307': 'claude',
      // Mistral
      'open-mistral-7b': 'mistral',
      'open-mixtral-8x7b': 'mistral',
      'mistral-small-latest': 'mistral',
      'mistral-large-latest': 'mistral',
      // Nvidia
      'meta/llama3-8b-instruct': 'nvidia',
      'meta/llama3-70b-instruct': 'nvidia',
    };
    return modelProviderMap[model] || model; // Fallback to model name as provider
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
          return this.callGemini({ text: finalPromptForAPI }, apiKey, model, options);
        }
        return this.callGemini(finalPromptForAPI, apiKey, model, options);
      case 'groq':
        return this.callGroq(finalPromptForAPI, apiKey, model, options);
      case 'claude':
        return this.callClaude(finalPromptForAPI, apiKey, model, options);
      case 'openrouter':
        return this.callOpenRouter(finalPromptForAPI, apiKey, model, options);
      case 'together':
        return this.callTogether(finalPromptForAPI, apiKey, model, options);
      case 'mistral':
        return this.callMistral(finalPromptForAPI, apiKey, model, options);
      case 'nvidia':
        return this.callNvidia(finalPromptForAPI, apiKey, model, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /* ----------------------------
     Provider-specific implementations
     ---------------------------- */

  // Gemini
  // FIX: Pass 'model' parameter for consistency, though internal logic overrides it.
  async callGemini(promptObj, apiKey, model, options = {}) {
    const parts = [];
    if (promptObj.text) parts.push({ text: promptObj.text });
    if (promptObj.files) {
      for (const file of promptObj.files) {
        parts.push({ inlineData: { mimeType: file.type, data: file.base64 } });
      }
    }
    // Logic to auto-select Pro model for vision is good, retained.
    const finalModel = (promptObj.files && promptObj.files.length > 0) ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens || 8190,
      },
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(`Gemini API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse && data.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error('Gemini finished due to MAX_TOKENS');
    return this.removeMarkdownFormatting(textResponse || '');
  }

  // Generic function for OpenAI-compatible APIs
  async callOpenAICompatible(apiUrl, apiKey, model, prompt, options, providerName) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.3,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`${providerName} API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data.choices?.[0]?.message?.content || '');
  }

  // Groq
  async callGroq(prompt, apiKey, model, options = {}) {
    return this.callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', apiKey, model, prompt, options, 'Groq');
  }

  // Claude
  async callClaude(prompt, apiKey, model, options = {}) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: model,
        max_tokens: options.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Claude API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    return this.removeMarkdownFormatting(data.content?.[0]?.text || '');
  }

  // OpenRouter
  async callOpenRouter(prompt, apiKey, model, options = {}) {
    return this.callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', apiKey, model, prompt, options, 'OpenRouter');
  }

  // Together.ai
  async callTogether(prompt, apiKey, model, options = {}) {
    // Note: Together.ai now uses a v1 endpoint similar to OpenAI
    return this.callOpenAICompatible('https://api.together.xyz/v1/chat/completions', apiKey, model, prompt, options, 'Together.ai');
  }

  // Mistral
  async callMistral(prompt, apiKey, model, options = {}) {
    return this.callOpenAICompatible('https://api.mistral.ai/v1/chat/completions', apiKey, model, prompt, options, 'Mistral');
  }

  // Nvidia
  async callNvidia(prompt, apiKey, model, options = {}) {
    return this.callOpenAICompatible('https://integrate.api.nvidia.com/v1/chat/completions', apiKey, model, prompt, options, 'NVIDIA NIM');
  }
}

export { AIProviderManager };
