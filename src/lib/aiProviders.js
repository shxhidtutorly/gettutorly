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
      'mistral',   // correct spelling used here
      'cerebras',
      'nvidia'
    ];

    // Map of environment var names to provider keys
    // Note: accept both spelling variants of Mistral env var to be robust
    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      claude: this.getKeysFromEnv('CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
      mistral: this.getKeysFromEnv('MISTRAL_API_KEY') // if you used MINISTRAL_API_KEY upstream, add it to env as MISTRAL_API_KEY
        .concat(this.getKeysFromEnv('MINISTRAL_API_KEY')),
      nvidia: this.getKeysFromEnv('NVIDIA_API_KEY').concat(this.getKeysFromEnv('NVIDA_API_KEY')), // accept both env names
      cerebras: this.getKeysFromEnv('CEREBRAS_API_KEY'),
    };

    // Provider max context/token capacity defaults (can be overridden with env vars MAX_TOKENS_{PROVIDER})
    this.defaultProviderMaxTokens = {
      together: 8193,
      gemini: 8192,
      groq: 16384,
      claude: 9000,
      openrouter: 32768,
      mistral: 8192,
      cerebras: 65536,
      nvidia: 65536
    };

    // Load effective max tokens (allow override via env var name MAX_TOKENS_{PROVIDER})
    this.providerMaxTokens = {};
    Object.keys(this.defaultProviderMaxTokens).forEach((prov) => {
      const envName = `MAX_TOKENS_${prov.toUpperCase()}`;
      const envVal = process.env[envName];
      this.providerMaxTokens[prov] = envVal ? parseInt(envVal, 10) : this.defaultProviderMaxTokens[prov];
    });

    Object.entries(this.apiKeys).forEach(([provider, keys]) => {
      console.log(`🔑 ${provider}: ${Array.isArray(keys) ? keys.length : 0} keys available`);
    });
    console.log('ℹ️ Provider max tokens:', this.providerMaxTokens);
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
      msg.includes('input validation error')
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

    const desiredMaxOutput = options.maxOutputTokens || 40000;

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        console.log(`ℹ️ Skipping ${provider}: No API keys available.`);
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
            console.log(`Attempting ${provider} (key ${i + 1}/${keys.length}) with max_tokens=${attemptMax}...`);
            const response = await this.callProvider(provider, prompt, key, model, { maxTokens: attemptMax });
            console.log(`✅ Successfully received response from ${provider} (key ${i + 1}).`);
            return { message: response, provider, model, usedKeyIndex: i, usedMaxTokens: attemptMax };
          } catch (error) {
            lastError = error;
            console.log(`❌ Failed with ${provider} key ${i + 1} (max_tokens=${attemptMax}): ${error.message}`);
            if (!this.isTokenLimitError(error)) {
              console.log('ℹ️ Error not related to token limits - moving to next key/provider.');
              break;
            } else {
              console.log('⚠️ Token-limit related error — will retry with smaller max_tokens if attempts remain.');
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
      'gemini': 'gemini',
      'gemini-2.5-flash': 'gemini',
      'llama-3.1-8b-instant': 'groq',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free': 'together',
      'claude-3-5-sonnet-20241022': 'claude',
      'deepseek/deepseek-r1-0528-qwen3-8b:free': 'openrouter',
      'microsoft/DialoGPT-medium': 'groq',
      // New models/providers - accept both names users might send
      'ministral-8b-2410': 'mistral',
      'mistral-8b': 'mistral',
      'gpt-oss-120b': 'cerebras',
      'nvidia-nim': 'nvidia',
      'nvidia': 'nvidia',
      'mistral': 'mistral',
      'cerebras': 'cerebras',
      'together': 'together',
      'openrouter': 'openrouter'
    };
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

    const requestedMax = options.maxTokens || 1800;
    const safeMax = Math.min(requestedMax, this.getProviderMaxTokens('gemini'));

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: safeMax
      }
    };

    const url = `${process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'}?key=${apiKey}`;

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
    const max_tokens = options.maxTokens || 4000;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('groq'));

    const response = await fetch(process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
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
    const max_tokens = options.maxTokens || 800;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('claude'));

    const response = await fetch(process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens_to_sample: safeMax,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3
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

    const response = await fetch(process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gettutorly.com',
        'X-Title': 'AI Provider Manager'
      },
      body: JSON.stringify({
        model: model || process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528-qwen3-8b:free',
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
    const max_tokens = options.maxTokens || 5006;
    const safeMax = Math.min(max_tokens, this.getProviderMaxTokens('together'));

    const response = await fetch(process.env.TOGETHER_API_URL || 'https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: safeMax,
        temperature: options.temperature ?? 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${data.error?.message || JSON.stringify(data)}`);
    }

    console.log('📥 Together API full response:', JSON.stringify(data, null, 2));
    const message = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason || 'unknown';
    console.log(`📌 Together finish reason: ${finishReason}`);

    if (!message || message.length < 20) {
      console.warn('⚠️ Short or missing response from Together:', message);
    }

    return this.removeMarkdownFormatting(message || '');
  }

  
     
async function callMistral(prompt, apiKey, options={}) {
  // env: MISTRAL_API_URL (e.g. https://api.mistral.ai/v1)
  // env: MISTRAL_MODEL (e.g. 'mistral-large' or exact id from your account)
  const base = process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1';
  const model = options.model || process.env.MISTRAL_MODEL || 'mistral-large';
  const url = `${base}/chat/completions`; // /chat/completions is Mistral chat endpoint

  const body = {
    model,
    messages: [
      { role: 'system', content: options.system || 'You are an assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1024
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    // helpful debug: list models if invalid-model style error detected
    if (data && /model/i.test(JSON.stringify(data))) {
      throw new Error(`Mistral API error: ${resp.status} - ${JSON.stringify(data)}`);
    }
    throw new Error(`Mistral HTTP ${resp.status} - ${JSON.stringify(data)}`);
  }

  // Expect OpenAI-like 'choices' or 'output' depending on their response shape
  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.output?.[0]?.content ||
    data?.result ||
    (typeof data === 'string' ? data : JSON.stringify(data));

  return String(text);
}

  /* ----------------------------
     NEW: Cerebras (direct) - replace CEREBRAS_API_URL / CEREBRAS_MODEL in env if needed
     ---------------------------- */
  // callCerebras.js
async function callCerebras(prompt, apiKey, options={}) {
  // env: CEREBRAS_API_BASE (e.g. https://inference.cerebras.ai or https://api.cerebras.net/v1)
  // env: CEREBRAS_MODEL (e.g. 'gpt-oss-120b' or the exact model id from their API)
  const base = process.env.CEREBRAS_API_BASE || process.env.CEREBRAS_API_URL || 'https://api.cerebras.net/v1';
  const model = options.model || process.env.CEREBRAS_MODEL || 'gpt-oss-120b';
  const url = `${base}/chat/completions`; // or /v1/chat/completions depending on their instance

  const body = {
    model,
    messages: [
      { role: 'system', content: options.system || 'You are an assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1024
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

  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.result ||
    data?.output?.[0]?.content ||
    JSON.stringify(data).slice(0, 2000);

  return String(text);
}

  /* ----------------------------
     NEW: NVIDIA (direct) - replace NVIDIA_API_URL / NVIDIA_MODEL in env if needed
     ---------------------------- */
 // callNvidiaNim.js
async function callNvidiaNim(prompt, apiKey, options={}) {
  // env: NVIDIA_NIM_BASE (e.g. https://integrate.api.nvidia.com/v1 or your NIM_PROXY_BASE_URL)
  // env: NVIDIA_MODEL (model id listed in /v1/models on your NIM instance)
  const base = process.env.NVIDIA_NIM_BASE || 'https://integrate.api.nvidia.com/v1';
  const model = options.model || process.env.NVIDIA_MODEL || 'nvidia-nim-default';
  const url = `${base}/chat/completions`;

  const body = {
    model,
    messages: [
      { role: 'system', content: options.system || 'You are an assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1024
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    // If the API returns invalid model, recommend listing models (see helper below).
    throw new Error(`NIM HTTP ${resp.status} - ${JSON.stringify(data)}`);
  }

  // Example shapes: OpenAI-compatible choices
  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.result ||
    data?.output?.[0]?.content ||
    JSON.stringify(data).slice(0, 5000);

  return String(text);
}

// Helper to list models on your NIM base URL
async function nimListModels(apiKey, baseUrl = process.env.NVIDIA_NIM_BASE || 'https://integrate.api.nvidia.com/v1') {
  const resp = await fetch(`${baseUrl}/models`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!resp.ok) throw new Error(`Failed to list NIM models: ${resp.status}`);
  return await resp.json();
}
}

export { AIProviderManager };
console.log('✅ AIProviderManager exported successfully');
