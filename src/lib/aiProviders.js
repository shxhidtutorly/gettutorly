class AIProviderManager {
  constructor() {
    this.providerOrder = [
      'groq',
      'gemini',
      'openrouter',
      'together',
      'mistral',
      'nvidia',
    ];

    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
      mistral: this.getKeysFromEnv('MISTRAL_API_KEY'),
      nvidia: this.getKeysFromEnv('NVIDIA_API_KEY'),
    };

    this.defaultModels = {
      groq: 'openai/gpt-oss-20b',
      gemini: 'gemini-1.5-flash-latest',
      openrouter: 'openai/gpt-oss-20b:free',
      together: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      mistral: 'open-mixtral-8x7b',
      nvidia: 'meta/llama3-8b-instruct',
    };
  }

  getKeysFromEnv(envVar) {
    const keys = process.env[envVar];
    if (typeof keys !== 'string') {
      return [];
    }
    return keys.split(',').map(k => k.trim()).filter(Boolean);
  }

  isTokenLimitError(err) {
    if (!err) return false;
    const msg = (err.message || String(err)).toLowerCase();
    return msg.includes('max_tokens') || msg.includes('context_length_exceeded') || (msg.includes('finishreason') && msg.includes('max'));
  }

  isInvalidContentError(err) {
    if (!err) return false;
    const msg = (err.message || String(err)).toLowerCase();
    return msg.includes('invalid json') || msg.includes('incomplete json');
  }

  isRetryableError(err) {
    return this.isTokenLimitError(err) || this.isInvalidContentError(err);
  }

  async getAIResponse(prompt, requestedModel, options = {}) {
    const responseFormat = options.response_format || 'text';
    const desiredMaxOutput = options.maxOutputTokens || 8000;

    const requestedProvider = this.getProviderForModel(requestedModel) || this.providerOrder[0];
    const fallbackProviders = Array.from(new Set([requestedProvider, ...this.providerOrder]));

    let lastError = null;

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        continue;
      }

      const modelForThisAttempt = this.defaultModels[provider];
      if (!modelForThisAttempt) {
        console.warn(`No default model for provider: ${provider}. Skipping.`);
        continue;
      }

      for (const key of keys) {
        try {
          console.log(`Attempting provider: ${provider} with model: ${modelForThisAttempt}`);

          const responseText = await this.callProvider(
            provider,
            prompt,
            key,
            modelForThisAttempt,
            { ...options, maxTokens: desiredMaxOutput }
          );

          if (responseFormat === 'json') {
            try {
              JSON.parse(responseText);
            } catch (jsonError) {
              throw new Error(`Provider returned incomplete/invalid JSON.`);
            }
          }

          console.log(`✅ Success with provider: ${provider}`);
          return {
            message: responseText,
            provider,
            model: modelForThisAttempt
          };

        } catch (error) {
          lastError = error;
          console.error(`Error with ${provider} (model: ${modelForThisAttempt}): ${error.message}`);

          if (!this.isRetryableError(error)) {
            break;
          }
        }
      }
    }

    console.error("All providers and keys failed.");
    throw lastError || new Error('All API providers failed. Please check your API keys and network connection.');
  }

  getProviderForModel(model) {
    const modelProviderMap = {
      'gemini-1.5-flash-latest': 'gemini', 'gemini-1.5-pro-latest': 'gemini',
      'openai/gpt-oss-20b': 'groq', 'llama-3.1-70b-versatile': 'groq', 'mixtral-8x7b-32768': 'groq',
      'openai/gpt-oss-20b:free': 'openrouter', 'mistralai/mistral-7b-instruct:free': 'openrouter',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': 'together', 'mistralai/Mixtral-8x7B-Instruct-v0.1': 'together',
      'open-mixtral-8x7b': 'mistral', 'mistral-small-latest': 'mistral',
      'meta/llama3-8b-instruct': 'nvidia', 'meta/llama3-70b-instruct': 'nvidia',
    };
    return modelProviderMap[model] || model;
  }

  async callProvider(provider, prompt, apiKey, model, options = {}) {
    switch (provider) {
      case 'gemini':
        return this.callGemini(prompt, apiKey, model, options);
      case 'groq':
        return this.callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', apiKey, model, prompt, options, 'Groq');
      case 'openrouter':
        return this.callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', apiKey, model, prompt, options, 'OpenRouter');
      case 'together':
        return this.callOpenAICompatible('https://api.together.xyz/v1/chat/completions', apiKey, model, prompt, options, 'Together.ai');
      case 'mistral':
        return this.callOpenAICompatible('https://api.mistral.ai/v1/chat/completions', apiKey, model, prompt, options, 'Mistral');
      case 'nvidia':
        return this.callOpenAICompatible('https://integrate.api.nvidia.com/v1/chat/completions', apiKey, model, prompt, options, 'NVIDIA');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async callGemini(prompt, apiKey, model, options = {}) {
    const parts = [{ text: prompt.text }];
    if (prompt.files && prompt.files.length > 0) {
      parts.push(...prompt.files.map(f => ({ fileData: { mimeType: f.mimeType, data: f.base64 } })));
    }
    const finalModel = (prompt.files && prompt.files.length > 0) ? 'gemini-1.5-pro-latest' : model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts }],
      generationConfig: {
        response_mime_type: options.response_format === 'json' ? "application/json" : "text/plain",
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens,
      },
    };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();

    if (!response.ok || data.error) throw new Error(`Gemini API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
    if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error('Gemini finished due to MAX_TOKENS');

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) throw new Error("Gemini returned an empty response.");

    return textResponse;
  }

  async callOpenAICompatible(apiUrl, apiKey, model, prompt, options, providerName) {
    const messages = [];
    if (prompt.files && prompt.files.length > 0) {
      const contentParts = [{ type: 'text', text: prompt.text }];
      prompt.files.forEach(f => {
        contentParts.push({ type: 'image_url', image_url: { url: `data:${f.mimeType};base64,${f.base64}` } });
      });
      messages.push({ role: 'user', content: contentParts });
    } else {
      messages.push({ role: 'user', content: prompt.text });
    }

    const body = {
      model: model,
      messages: messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature ?? 0.3,
    };

    if (options.response_format === 'json') {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`${providerName} API error: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);

    const textResponse = data.choices?.[0]?.message?.content;
    if (!textResponse) throw new Error(`${providerName} returned an empty response.`);

    return textResponse;
  }
}

export { AIProviderManager };
