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
      groq: 32768, // Llama3.1 on Groq has a larger context
      claude: 200000, // Sonnet 3.5 has a very large context
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
            const response = await this.callProvider(provider, prompt, key, model, { maxTokens: attemptMax });
            return { message: response, provider, model, usedKeyIndex: i, usedMaxTokens: attemptMax };
          } catch (error) {
            lastError = error;
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
    // This function maps a specific model name to its provider.
    // It's designed to be robust if the user passes a provider name directly as a model.
    const modelProviderMap = {
      // Gemini
      'gemini-1.5-flash-latest': 'gemini',
      'gemini-1.5-pro-latest': 'gemini',

      // Groq
      'llama3-8b-8192': 'groq',
      'llama-3.1-8b-instant': 'groq',
      'mixtral-8x7b-32768': 'groq',

      // Together
      'meta-llama/Llama-3-70b-chat-hf': 'together',
      'meta-llama/Llama-3.1-8B-Instruct-Turbo': 'together',

      // Claude
      'claude-3-5-sonnet-20240620': 'claude',
      'claude-3-opus-20240229': 'claude',

      // OpenRouter
      'mistralai/mistral-7b-instruct:free': 'openrouter',
      'google/gemma-7b-it:free': 'openrouter',

      // Mistral
      'open-mistral-nemo-2407': 'mistral',
      'mistral-large-latest': 'mistral',

      // Cerebras
      'cerebras/Cerebras-GPT-13B': 'cerebras',

      // Nvidia
      'meta/llama3-70b-instruct': 'nvidia',
      'nvidia/nemotron-4-340b-instruct': 'nvidia',
    };
    // If a direct model match is found, return its provider.
    // Otherwise, assume the 'model' string is actually the provider name itself.
    return modelProviderMap[model] || model;
  }


  /* ----------------------------
     callProvider dispatcher (supports optional { maxTokens })
     ---------------------------- */
  async callProvider(provider, prompt, apiKey, model, options = {}) {
    let finalPromptForAPI = prompt;
    if (typeof prompt === 'object' && prompt !== null) {
      if (provider !== 'gemini') {
        if (prompt.text !== undefined) {
          finalPromptForAPI = prompt.text;
        } else {
          console.warn(`⚠️ Unexpected object prompt format for ${provider}. Converting to string.`);
          finalPromptForAPI = JSON.stringify(prompt);
        }
      }
    } else if (typeof prompt !== 'string') {
      console.warn(`⚠️ Non-string/non-object prompt (${typeof prompt}) provided to ${provider}. Converting to string.`);
      finalPromptForAPI = String(prompt);
    }

    switch (provider) {
      case 'gemini':
        if (typeof finalPromptForAPI === 'string') {
          return await this.callGemini({ text: finalPromptForAPI }, apiKey, options);
        }
        return await this.callGemini(finalPromptForAPI, apiKey, options);
      case 'groq':
        return await this.callGroq(finalPromptForAPI, apiKey, options);
      case 'claude':
        return await this.callClaude(finalPromptForAPI, apiKey, options);
      case 'openrouter':
        return await this.callOpenRouter(finalPromptForAPI, apiKey, model, options);
      case 'together':
        return await this.callTogether(finalPromptForAPI, apiKey, options);
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

  // Gemini (Generative Language API)
  async callGemini(promptObj, apiKey, options = {}) {
    const parts = [];
    if (promptObj.text) parts.push({ text: promptObj.text });
    if (promptObj.files) {
      for (const file of promptObj.files) {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.base64
          }
        });
      }
    }

    const requestedMax = options.maxTokens || 8190;
    const safeMax = Math.min(requestedMax, this.getProviderMaxTokens('gemini'));
    const model = (promptObj.files && promptObj.files.length > 0) ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest';

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: safeMax
      }
    };

    const url = `${process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/'}${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      console.error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`, data);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    let geminiTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!geminiTextResponse) {
      console.warn('⚠️ Gemini returned no text content. Full response data:', JSON.stringify(data, null, 2));
      if (data.candidates?.[0]?.finishReason && String(data.candidates[0].finishReason).toUpperCase().includes('MAX')) {
        throw new Error('Gemini finished due to MAX_TOKENS');
      }
      return 'No response from Gemini (see server logs for details).';
    }

    geminiTextResponse = this.removeMarkdownFormatting(geminiTextResponse);
    return geminiTextResponse;
  }

  // Groq
  async callGroq(prompt, apiKey, options = {}) {
    const max_tokens = options.maxTokens || 8000;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('groq'));

    const response = await fetch(process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: options.temperature ?? 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    let groqResponse = data.choices?.[0]?.message?.content || 'No response from Groq';
    groqResponse = this.removeMarkdownFormatting(groqResponse);
    return groqResponse;
  }

  // Claude
  async callClaude(prompt, apiKey, options = {}) {
    const max_tokens = options.maxTokens || 4096;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('claude'));

    const response = await fetch(process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey, // Anthropic uses x-api-key header
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620',
        max_tokens: safeMax, // Correct parameter for Messages API
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    let claudeResponse = data?.content?.[0]?.text || 'No response from Claude';
    claudeResponse = this.removeMarkdownFormatting(claudeResponse);
    return claudeResponse;
  }

  // OpenRouter
  async callOpenRouter(prompt, apiKey, model, options = {}) {
    const max_tokens = options.maxTokens || 8000;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('openrouter'));

    const response = await fetch(process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gettutorly.com', // Replace with your site
        'X-Title': 'Tutorly AI' // Replace with your app name
      },
      body: JSON.stringify({
        model: model || process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: options.temperature ?? 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    let openRouterResponse = data.choices?.[0]?.message?.content || 'No response from OpenRouter';
    openRouterResponse = this.removeMarkdownFormatting(openRouterResponse);
    return openRouterResponse;
  }

  // Together.ai
  async callTogether(prompt, apiKey, options = {}) {
    const max_tokens = options.maxTokens || 7000;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('together'));

    const response = await fetch(process.env.TOGETHER_API_URL || 'https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.TOGETHER_MODEL || 'meta-llama/Llama-3-70b-chat-hf',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: options.temperature ?? 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    const message = data.choices?.[0]?.message?.content;
    return this.removeMarkdownFormatting(message || '');
  }

  // Mistral
  async callMistral(prompt, apiKey, model, options = {}) {
    const base = process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1';
    const finalModel = model || process.env.MISTRAL_MODEL || 'open-mistral-nemo-2407';
    const url = `${base}/chat/completions`;

    const body = {
      model: finalModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(`Mistral API error: ${resp.status} - ${data?.error?.message || JSON.stringify(data)}`);
    }

    const text = data?.choices?.[0]?.message?.content || '';
    return this.removeMarkdownFormatting(text);
  }

  // Cerebras
  async callCerebras(prompt, apiKey, model, options = {}) {
    const base = process.env.CEREBRAS_API_BASE || 'https://api.cerebras.net/v1';
    const finalModel = model || process.env.CEREBRAS_MODEL || 'cerebras/Cerebras-GPT-13B';
    const url = `${base}/chat/completions`;

    const body = {
      model: finalModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2048
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(`Cerebras HTTP ${resp.status} - ${JSON.stringify(data)}`);
    }

    const text = data?.choices?.[0]?.message?.content || '';
    return this.removeMarkdownFormatting(text);
  }

  // Nvidia
  async callNvidia(prompt, apiKey, model, options = {}) {
    const base = process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const finalModel = model || process.env.NVIDIA_MODEL || 'meta/llama3-70b-instruct';
    const url = `${base}/chat/completions`;

    const body = {
      model: finalModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 8000
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(`NVIDIA NIM HTTP ${resp.status} - ${JSON.stringify(data)}`);
    }

    const text = data?.choices?.[0]?.message?.content || '';
    return this.removeMarkdownFormatting(text);
  }
}

export { AIProviderManager };
