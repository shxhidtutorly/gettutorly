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
      groq: 'llama-3.1-8b-instant', // Changed to a more reliable Groq model
      gemini: 'gemini-1.5-flash-latest',
      openrouter: 'google/gemma-2-9b-it:free', // Changed to a reliable free model
      together: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      mistral: 'open-mixtral-8x7b',
      nvidia: 'meta/llama3-8b-instruct',
    };
  }

  getKeysFromEnv(envVar) {
    const keys = process.env[envVar];
    return keys ? keys.split(',').map(k => k.trim()).filter(Boolean) : [];
  }

  // --- Utilities: Error Classification ---

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

  // --- MAJOR FIX: New function to determine if an error should trigger a fallback ---
  isRetryableError(err) {
    return this.isTokenLimitError(err) || this.isInvalidContentError(err);
  }

  // --- Main Entrypoint with new, robust fallback logic ---
  async getAIResponse(prompt, requestedModel, options = {}) {
    // Default to 'text', but allow 'json' to be specified
    const responseFormat = options.response_format || 'text';
    const desiredMaxOutput = options.maxOutputTokens || 8000;

    const requestedProvider = this.getProviderForModel(requestedModel) || this.providerOrder[0];
    const fallbackProviders = Array.from(new Set([requestedProvider, ...this.providerOrder]));

    let lastError = null;

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        continue; // Skip providers with no keys
      }

      // Determine the correct model for this attempt
      let modelForThisAttempt = (this.getProviderForModel(requestedModel) === provider) 
        ? requestedModel 
        : this.defaultModels[provider];

      if (!modelForThisAttempt) {
        console.warn(`No default model for provider: ${provider}. Skipping.`);
        continue;
      }

      // Try each key for the current provider
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

          // --- MAJOR FIX: Validate JSON response *inside* the loop ---
          if (responseFormat === 'json') {
            try {
              // Test if the response is valid JSON
              JSON.parse(responseText); 
            } catch (jsonError) {
              // If parsing fails, it's an incomplete response. Throw to trigger fallback.
              throw new Error(`Provider returned incomplete/invalid JSON.`);
            }
          }
          
          // If we get here, the response is valid. Return it.
          console.log(`✅ Success with provider: ${provider}`);
          return { 
            message: responseText, 
            provider, 
            model: modelForThisAttempt 
          };

        } catch (error) {
          lastError = error;
          console.error(`Error with ${provider} (model: ${modelForThisAttempt}): ${error.message}`);
          
          // --- MAJOR FIX: Check if the error is retryable ---
          // If it's not a token or content error (e.g., invalid API key),
          // stop trying with this provider and move to the next.
          if (!this.isRetryableError(error)) {
            break; // Break from the key loop for this provider
          }
          // If it IS retryable, the loop will continue to the next key or provider.
        }
      }
    }

    console.error("All providers and keys failed.");
    throw lastError || new Error('All API providers failed. Please check your API keys and network connection.');
  }


  getProviderForModel(model) {
    const modelProviderMap = {
      'gemini-1.5-flash-latest': 'gemini', 'gemini-1.5-pro-latest': 'gemini',
      'llama-3.1-8b-instant': 'groq', 'llama-3.1-70b-versatile': 'groq', 'mixtral-8x7b-32768': 'groq',
      'google/gemma-2-9b-it:free': 'openrouter', 'mistralai/mistral-7b-instruct:free': 'openrouter',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': 'together', 'mistralai/Mixtral-8x7B-Instruct-v0.1': 'together',
      'open-mixtral-8x7b': 'mistral', 'mistral-small-latest': 'mistral',
      'meta/llama3-8b-instruct': 'nvidia', 'meta/llama3-70b-instruct': 'nvidia',
    };
    return modelProviderMap[model] || model;
  }

  async callProvider(provider, prompt, apiKey, model, options = {}) {
    // This is a simplified dispatcher now. The main logic is in getAIResponse.
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

  // --- Provider-specific Implementations ---

  async callGemini(prompt, apiKey, model, options = {}) {
    const finalModel = (prompt.files && prompt.files.length > 0) ? 'gemini-1.5-pro-latest' : model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        // --- MAJOR FIX: Tell Gemini to output JSON when requested ---
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
    
    return textResponse; // Return raw text, no formatting removal
  }

  async callOpenAICompatible(apiUrl, apiKey, model, prompt, options, providerName) {
    const body = {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens,
      temperature: options.temperature ?? 0.3,
    };

    // --- MAJOR FIX: Tell OpenAI-compatible APIs to output JSON when requested ---
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
    
    return textResponse; // Return raw text, no formatting removal
  }
}

export { AIProviderManager };
