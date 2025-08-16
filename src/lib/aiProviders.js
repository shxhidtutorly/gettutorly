// aiProviders.js
console.log('📦 Loading aiProviders.js...');

class AIProviderManager {
  constructor() {
    console.log('🔧 Initializing AI Provider Manager...');

    // Order of preference for provider fallback
    this.providerOrder = [
      'together',
      'gemini',
      'groq',
      'claude',
      'openrouter',
      'ministral',
      'cerebras',
      'nvidia',
      'huggingface'
    ];

    // Map of environment var names to provider keys
    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      claude: this.getKeysFromEnv('CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      huggingface: this.getKeysFromEnv('HUGGINGFACE_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
      ministral: this.getKeysFromEnv('MINISTRAL_API_KEY'),
      nvidia: this.getKeysFromEnv('NVIDA_API_KEY'), // note: env name kept as supplied by user (NVIDA)
      cerebras: this.getKeysFromEnv('CEREBRAS_API_KEY'),
    };

    // Provider max context/token capacity defaults (can be overridden with env vars MAX_TOKENS_{PROVIDER})
    // Values are conservative defaults; if you need exact numbers replace with env vars.
    this.defaultProviderMaxTokens = {
      together: 8193,
      gemini: 8192,
      groq: 16384,
      claude: 9000,
      openrouter: 32768,
      ministral: 8192,
      cerebras: 65536,
      nvidia: 65536,
      huggingface: 8192
    };

    // Load effective max tokens (allow override via env var name MAX_TOKENS_{PROVIDER})
    this.providerMaxTokens = {};
    Object.keys(this.defaultProviderMaxTokens).forEach((prov) => {
      const envName = `MAX_TOKENS_${prov.toUpperCase()}`;
      const envVal = process.env[envName];
      this.providerMaxTokens[prov] = envVal ? parseInt(envVal, 10) : this.defaultProviderMaxTokens[prov];
    });

    Object.entries(this.apiKeys).forEach(([provider, keys]) => {
      console.log(`🔑 ${provider}: ${keys.length} keys available`);
    });
    console.log('ℹ️ Provider max tokens:', this.providerMaxTokens);
  }

  getKeysFromEnv(envVar) {
    const keys = process.env[envVar];
    if (!keys) {
      console.log(`⚠️ No keys found for ${envVar}`);
      return [];
    }
    return keys.split(',').map(k => k.trim()).filter(Boolean);
  }

  /* ----------------------------
     Utilities: token estimation & error checks
     ---------------------------- */

  // Very simple token estimator: fallback when no tokenizer available.
  // Approximate: 1 token ~ 4 characters (rough estimate). Adjust multiplier if you want.
  estimateTokens(text) {
    if (!text) return 0;
    if (typeof text !== 'string') text = String(text);
    return Math.ceil(text.length / 4);
  }

  getProviderMaxTokens(provider, model) {
    // Allow specific per-model overrides if needed in the future.
    return this.providerMaxTokens[provider] || 8192;
  }

  // Compute safe max tokens to request given provider limit and prompt size.
  getSafeMaxOutputTokens(provider, promptText, desiredMax) {
    const providerLimit = this.getProviderMaxTokens(provider);
    const promptTokens = this.estimateTokens(promptText);
    const safe = Math.max(16, Math.min(desiredMax, providerLimit - promptTokens - 16)); // leave a buffer
    return safe;
  }

  isTokenLimitError(err) {
    if (!err) return false;
    const msg = (err.message || '').toLowerCase();
    // Common token error markers
    return (
      msg.includes('tokens') && msg.includes('must be') ||
      msg.includes('max_tokens') && msg.includes('exceeded') ||
      msg.includes('input validation error') && msg.includes('tokens') ||
      msg.includes('max_tokens') && msg.includes('must be') ||
      msg.includes('max tokens') ||
      msg.includes('max_output_tokens') ||
      msg.includes('max_output_tokens') ||
      msg.includes('max_new_tokens') ||
      msg.includes('finishreason') && msg.includes('max_tokens')
    );
  }

  removeMarkdownFormatting(text) {
    if (typeof text !== 'string') {
      return String(text);
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
    // model can be either provider or explicit model string
    const requestedProvider = this.getProviderForModel(model);
    // Build fallback list: requested first, then providerOrder (without duplicates)
    const fallbackProviders = [requestedProvider, ...this.providerOrder.filter(p => p !== requestedProvider)];

    // convert prompt to a string for token estimation (preserve files as separate)
    let promptTextForEstimate = '';
    if (typeof prompt === 'string') {
      promptTextForEstimate = prompt;
    } else if (prompt && typeof prompt === 'object' && prompt.text) {
      promptTextForEstimate = prompt.text;
    } else {
      promptTextForEstimate = JSON.stringify(prompt || '');
    }

    // Desired maximum output tokens default (you set max tokens on top-level)
    const desiredMaxOutput = options.maxOutputTokens || 40000; // your earlier 40k
    // Attempt providers in order
    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        console.log(`ℹ️ Skipping ${provider}: No API keys available.`);
        continue;
      }

      // For each provider try each key in rotation
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        // We'll attempt a sequence of decreasing max_token values for robustness
        const attemptMaxList = [
          this.getSafeMaxOutputTokens(provider, promptTextForEstimate, desiredMaxOutput),
          Math.max(16, Math.floor(desiredMaxOutput / 2)),
          Math.max(16, Math.floor(desiredMaxOutput / 4)),
          128,
          32
        ].filter((v, idx, arr) => v > 0 && arr.indexOf(v) === idx); // unique and >0

        let lastError = null;

        for (const attemptMax of attemptMaxList) {
          try {
            console.log(`Attempting ${provider} (key ${i + 1}/${keys.length}) with max_tokens=${attemptMax}...`);
            const response = await this.callProvider(provider, prompt, key, model, { maxTokens: attemptMax });
            console.log(`✅ Successfully received response from ${provider} (key ${i + 1}).`);
            return { message: response, provider, model, usedKeyIndex: i, usedMaxTokens: attemptMax };
          } catch (error) {
            lastError = error;
            console.log(`❌ Failed with ${provider} key ${i + 1} (max_tokens=${attemptMax}): ${error.message}`);
            // if it's a token-limit error, try next reduced attemptMax; if not, break to try next key/provider
            if (!this.isTokenLimitError(error)) {
              console.log('ℹ️ Error not related to token limits - moving to next key/provider.');
              break;
            } else {
              console.log('⚠️ Token-limit related error — will retry with smaller max_tokens if attempts remain.');
            }
          }
        } // end attemptMaxList loop

        // if all attemptMaxList exhausted and lastError was token-limit -> try next provider/key
        if (lastError) {
          // continue to next key/provider
          continue;
        }
      } // end keys loop

      // try next provider
    } // end provider loop

    throw new Error('All API keys failed for all providers. Please check your API keys and network connection.');
  }

  /* ----------------------------
     Model -> provider mapping
     ---------------------------- */
  getProviderForModel(model) {
    // Map common models to their provider
    const modelProviderMap = {
      'gemini': 'gemini',
      'gemini-2.5-flash': 'gemini',
      'llama-3.1-8b-instant': 'groq',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free': 'together',
      'claude-3-5-sonnet-20241022': 'claude',
      'deepseek/deepseek-r1-0528-qwen3-8b:free': 'openrouter',
      'microsoft/DialoGPT-medium': 'huggingface',
      // New models requested
      'ministral-8b-2410': 'ministral',
      'gpt-oss-120b': 'cerebras',
      'nvidia-nim': 'nvidia',
      'together': 'together',
      'openrouter': 'openrouter',
      'huggingface': 'huggingface'
    };
    return modelProviderMap[model] || model; // treat unknown model as provider name
  }

  /* ----------------------------
     callProvider dispatcher (supports optional { maxTokens })
     ---------------------------- */
  async callProvider(provider, prompt, apiKey, model, options = {}) {
    let finalPromptForAPI = prompt;

    // Normalize prompt for non-Gemini providers: extract prompt.text if it's an object.
    if (typeof prompt === 'object' && prompt !== null) {
      if (provider !== 'gemini') {
        if (prompt.text !== undefined) {
          finalPromptForAPI = prompt.text;
        } else {
          console.warn(`⚠️ Unexpected object prompt format for ${provider}. Converting to string.`);
          finalPromptForAPI = JSON.stringify(prompt);
        }
      }
      // If provider is 'gemini', finalPromptForAPI remains the original object (supports files)
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
      case 'huggingface':
        return await this.callHuggingFace(finalPromptForAPI, apiKey, options);
      case 'together':
        return await this.callTogether(finalPromptForAPI, apiKey, options);
      case 'ministral':
        return await this.callHuggingFaceModel('mest/ministral-8b-2410', finalPromptForAPI, apiKey, options); // placeholder model path
      case 'cerebras':
        return await this.callHuggingFaceModel('cerebras/gpt-oss-120b', finalPromptForAPI, apiKey, options); // placeholder
      case 'nvidia':
        return await this.callHuggingFaceModel('nvidia/nim-model', finalPromptForAPI, apiKey, options); // placeholder
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /* ----------------------------
     Provider-specific implementations
     Each function accepts prompt (string or object), apiKey, and options { maxTokens }
     ---------------------------- */

  // Gemini (Generative Language API)
  async callGemini(promptObj, apiKey, options = {}) {
    // promptObj: { text: "...", files?: [{ type, base64 }, ...] }
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

    // use options.maxTokens to compute gemini max output tokens
    const requestedMax = options.maxTokens || 1800;
    // ensure we don't exceed provider's model cap
    const safeMax = Math.min(requestedMax, this.getProviderMaxTokens('gemini'));

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: safeMax
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
      if (data.promptFeedback?.blockReason) {
        console.warn(`Gemini blocked response due to: ${data.promptFeedback.blockReason}`);
      }
      if (data.candidates?.[0]?.finishReason) {
        console.warn(`Gemini finished with reason: ${data.candidates[0].finishReason}`);
        if (String(data.candidates[0].finishReason).toUpperCase().includes('MAX')) {
          throw new Error('Gemini finished due to MAX_TOKENS');
        }
      }
      return 'No response from Gemini (see server logs for details).';
    }

    geminiTextResponse = this.removeMarkdownFormatting(geminiTextResponse);
    return geminiTextResponse;
  }

  // Groq (OpenAI-like chat completions)
  async callGroq(prompt, apiKey, options = {}) {
    const max_tokens = options.maxTokens || 4000;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('groq'));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: 0.3
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

  // Claude (Anthropic)
  async callClaude(prompt, apiKey, options = {}) {
    const max_tokens = options.maxTokens || 800;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('claude'));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens_to_sample: safeMax,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    let claudeResponse = data?.content?.[0]?.text || data?.message || 'No response from Claude';
    claudeResponse = this.removeMarkdownFormatting(claudeResponse);
    return claudeResponse;
  }

  // OpenRouter
  async callOpenRouter(prompt, apiKey, model, options = {}) {
    const max_tokens = options.maxTokens || 6000;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('openrouter'));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gettutorly.com',
        'X-Title': 'AI Provider Manager'
      },
      body: JSON.stringify({
        model: model || 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: 0.3
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

  // Hugging Face generic (example: DialoGPT)
  async callHuggingFace(prompt, apiKey, options = {}) {
    const modelPath = 'microsoft/DialoGPT-medium';
    return this.callHuggingFaceModel(modelPath, prompt, apiKey, options);
  }

  // Generic HF model call for ministral/cerebras/nvidia etc.
  async callHuggingFaceModel(modelPath, prompt, apiKey, options = {}) {
    const hfApiKey = apiKey || (this.apiKeys.huggingface?.[0]);
    if (!hfApiKey) {
      throw new Error('No Hugging Face API key provided for this model call.');
    }

    const max_new_tokens = options.maxTokens || 900;
    const safeMax = Math.min(max_new_tokens, this.getProviderMaxTokens('huggingface'));

    const url = `https://api-inference.huggingface.co/models/${modelPath}`;
    const body = {
      inputs: prompt,
      parameters: {
        max_new_tokens: safeMax,
        temperature: 0.3
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${data.error || JSON.stringify(data)}`);
    }

    // Hugging Face response shapes vary (array or object)
    let huggingFaceResponse = null;
    if (Array.isArray(data)) {
      huggingFaceResponse = data[0]?.generated_text || JSON.stringify(data);
    } else if (data.generated_text) {
      huggingFaceResponse = data.generated_text;
    } else if (data.error) {
      throw new Error(`Hugging Face model error: ${data.error}`);
    } else {
      huggingFaceResponse = JSON.stringify(data);
    }

    huggingFaceResponse = this.removeMarkdownFormatting(huggingFaceResponse);
    return huggingFaceResponse;
  }

  // Together.ai
  async callTogether(prompt, apiKey, options = {}) {
    const max_tokens = options.maxTokens || 5006;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('together'));

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: 0.3
      })
    });

    const data = await response.json();

    console.log('📥 Together API full response:', JSON.stringify(data, null, 2));
    const message = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason || 'unknown';
    console.log(`📌 Together finish reason: ${finishReason}`);

    if (!response.ok) {
      // If the error is token-related, throw an error that will be detected by isTokenLimitError
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    if (!message || message.length < 20) {
      console.warn('⚠️ Short or missing response from Together:', message);
    }

    return this.removeMarkdownFormatting(message || '');
  }
} // end class

export { AIProviderManager };
console.log('✅ AIProviderManager exported successfully');
