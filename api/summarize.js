// api/summarize.js - Tutorly summarizer (NVIDIA / Mistral / Cerebras + existing providers)
// NOTE: This version DOES NOT call Hugging Face. It tries providers in fallback order
// and retries with smaller max tokens when token-limit errors occur.
// Put this file in your API route and set the required env vars (keys & optional endpoints/models).

export default async function handler(req, res) {
  console.log(`📘 Tutorly Summarizer called: ${req.method} ${req.url}`);

  // CORS + JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const safeParseBody = (b) => {
    try { return typeof b === 'string' ? JSON.parse(b) : b; } catch (e) { return b; }
  };

  const estimateTokens = (text) => {
    // conservative heuristic: 1 token ≈ 4 chars
    if (!text) return 0;
    return Math.ceil(String(text).length / 4);
  };

  const isTokenLimitError = (msg) => {
    if (!msg) return false;
    const m = String(msg).toLowerCase();
    return (
      (m.includes('tokens') && m.includes('must')) ||
      (m.includes('max_tokens') && (m.includes('exceed') || m.includes('must be'))) ||
      m.includes('max_new_tokens') ||
      m.includes('max_output_tokens') ||
      (m.includes('finishreason') && m.includes('max')) ||
      m.includes('max tokens') ||
      m.includes('input validation error')
    );
  };

  const getEnv = (name) => process.env[name] || '';

  try {
    const body = safeParseBody(req.body);
    const { text } = body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }

    const originalLength = text.length;
    const maxChars = parseInt(process.env.TUTORLY_MAX_INPUT_CHARS || '12000', 10);
    const truncatedText = text.slice(0, maxChars);
    console.log(`📚 Received for summarization: original ${originalLength} chars, truncated ${truncatedText.length} chars (max ${maxChars})`);

    const systemPrompt = 'You are Tutorly, an AI study assistant that provides clear and concise summaries to help students understand key concepts quickly.';
    const userPrompt = `Summarize the following study material:\n\n${truncatedText}`;
    const promptForEstimate = `${systemPrompt}\n\n${userPrompt}`;
    const promptTokens = estimateTokens(promptForEstimate);

    // Providers (fallback order). No Hugging Face here.
    const apiProviders = [
      {
        name: 'Together',
        key: getEnv('TOGETHER_API_KEY'),
        url: getEnv('TOGETHER_API_URL') || 'https://api.together.xyz/v1/chat/completions',
        model: getEnv('TOGETHER_MODEL') || 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        format: 'openai',
        defaultMax: 5000,
        maxContext: parseInt(getEnv('MAX_TOKENS_TOGETHER') || '8193', 10)
      },
      {
        name: 'OpenRouter',
        key: getEnv('OPENROUTER_KEY'),
        url: getEnv('OPENROUTER_API_URL') || 'https://openrouter.ai/api/v1/chat/completions',
        model: getEnv('OPENROUTER_MODEL') || 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        format: 'openai',
        defaultMax: 6000,
        maxContext: parseInt(getEnv('MAX_TOKENS_OPENROUTER') || '32768', 10)
      },
      {
        name: 'Claude',
        key: getEnv('CLAUDE_API_KEY'),
        url: getEnv('CLAUDE_API_URL') || 'https://api.anthropic.com/v1/messages',
        model: getEnv('CLAUDE_MODEL') || 'claude-3-haiku-20240307',
        format: 'anthropic',
        defaultMax: 800,
        maxContext: parseInt(getEnv('MAX_TOKENS_CLAUDE') || '9000', 10)
      },
      {
        name: 'Groq',
        key: getEnv('GROQ_API_KEY'),
        url: getEnv('GROQ_API_URL') || 'https://api.groq.com/openai/v1/chat/completions',
        model: getEnv('GROQ_MODEL') || 'gemma2-9b-it',
        format: 'openai',
        defaultMax: 4000,
        maxContext: parseInt(getEnv('MAX_TOKENS_GROQ') || '8192', 10)
      },
      // New direct providers (Mistral, Cerebras, NVIDIA). Ensure keys & endpoints are set in env.
      {
        name: 'Mistral',
        key: getEnv('MISTRAL_API_KEY') || getEnv('MINISTRAL_API_KEY'),
        url: getEnv('MISTRAL_API_URL') || 'https://api.mistral.ai/v1/chat/completions',
        model: getEnv('MISTRAL_MODEL') || 'mistral-large',
        format: 'mistral',
        defaultMax: 2000,
        maxContext: parseInt(getEnv('MAX_TOKENS_MISTRAL') || '8192', 10)
      },
      {
        name: 'Cerebras',
        key: getEnv('CEREBRAS_API_KEY'),
        url: getEnv('CEREBRAS_API_URL') || 'https://api.cerebras.net/v1/chat/completions',
        model: getEnv('CEREBRAS_MODEL') || 'cerebras-gpt-120b',
        format: 'cerebras',
        defaultMax: 4000,
        maxContext: parseInt(getEnv('MAX_TOKENS_CEREBRAS') || '65536', 10)
      },
      {
        name: 'NVIDIA',
        key: getEnv('NVIDIA_API_KEY') || getEnv('NVIDA_API_KEY'),
        url: getEnv('NVIDIA_API_URL') || 'https://api.nvidia.com/v1/chat/completions',
        model: getEnv('NVIDIA_MODEL') || 'nvidia-nim',
        format: 'nvidia',
        defaultMax: 4000,
        maxContext: parseInt(getEnv('MAX_TOKENS_NVIDIA') || '65536', 10)
      },
      {
        name: 'Gemini',
        key: getEnv('GEMINI_API_KEY'),
        url: getEnv('GEMINI_API_URL') || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        model: getEnv('GEMINI_MODEL') || 'gemini-2.5-flash',
        format: 'gemini',
        defaultMax: 1800,
        maxContext: parseInt(getEnv('MAX_TOKENS_GEMINI') || '8192', 10)
      }
    ];

    // Keep only providers with a usable key
    const availableProviders = apiProviders.filter(p => !!p.key && p.key.length > 5);
    if (availableProviders.length === 0) {
      console.error('❌ No valid API keys configured for Tutorly summarization');
      return res.status(500).json({ error: 'No valid API keys configured for Tutorly summarization' });
    }

    // helper to create decreasing attempts of max tokens for a provider
    const createAttemptList = (provider, desired = parseInt(getEnv('TUTORLY_DESIRED_MAX_TOKENS') || '40000', 10)) => {
      const providerLimit = provider.maxContext || provider.defaultMax || 8192;
      const safeTop = Math.max(16, Math.min(providerLimit - promptTokens - 32, desired));
      const list = [
        Math.max(16, safeTop),
        Math.max(16, Math.floor(safeTop / 2)),
        Math.max(16, Math.floor(safeTop / 4)),
        512, 256, 128, 32
      ];
      return [...new Set(list)].filter(n => n > 0).sort((a, b) => b - a);
    };

    // call provider with retries and decreasing max_tokens on token errors
    async function tryProviderWithRetries(provider) {
      const attempts = createAttemptList(provider);
      let lastError = null;

      for (const attemptMaxTokens of attempts) {
        try {
          console.log(`📡 ${provider.name} attempt with maxTokens=${attemptMaxTokens}`);

          let url = provider.url;
          let headers = {};
          let body = null;
          const temperature = parseFloat(getEnv('TUTORLY_TEMPERATURE') || '0.3');

          switch (provider.format) {
            case 'openai':
              headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` };
              body = {
                model: provider.model,
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
                temperature,
                max_tokens: attemptMaxTokens
              };
              break;

            case 'anthropic':
              headers = { 'Content-Type': 'application/json', 'x-api-key': provider.key, 'anthropic-version': '2023-06-01' };
              body = { model: provider.model, messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }], temperature, max_tokens_to_sample: attemptMaxTokens };
              break;

            case 'gemini':
              headers = { 'Content-Type': 'application/json' };
              body = { contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }], generationConfig: { temperature, maxOutputTokens: attemptMaxTokens } };
              url = `${provider.url}?key=${provider.key}`;
              break;

            case 'mistral':
              headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` };
              body = { model: provider.model, messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }], temperature, max_tokens: attemptMaxTokens };
              break;

            case 'cerebras':
              headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` };
              body = { model: provider.model, messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }], temperature, max_tokens: attemptMaxTokens };
              break;

            case 'nvidia':
              headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` };
              body = { model: provider.model, messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }], temperature, max_tokens: attemptMaxTokens };
              break;

            default:
              throw new Error(`Unsupported provider format: ${provider.format}`);
          }

          const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
          let parsed = null;
          try { parsed = await resp.json(); } catch (e) { parsed = null; }

          if (!resp.ok) {
            const remoteMsg = (parsed && (parsed.error?.message || parsed.error || parsed.message)) || `HTTP ${resp.status}`;
            const errMsg = `API Error: ${resp.status} - ${String(remoteMsg)}`;
            console.warn(`⚠️ ${provider.name} returned HTTP ${resp.status}:`, remoteMsg);

            if (isTokenLimitError(String(remoteMsg))) {
              lastError = new Error(errMsg);
              console.log(`🔁 Token-limit detected from ${provider.name}, will retry with smaller max_tokens if attempts remain.`);
              continue; // try next smaller attempt
            }
            throw new Error(errMsg);
          }

          // extract summary depending on provider shape
          let summary = null;
          switch (provider.format) {
            case 'openai':
              summary = parsed?.choices?.[0]?.message?.content || parsed?.choices?.[0]?.text || null;
              break;
            case 'anthropic':
              summary = parsed?.content?.[0]?.text || parsed?.completion || parsed?.message || null;
              break;
            case 'gemini':
              summary = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || null;
              if (parsed?.candidates?.[0]?.finishReason && String(parsed.candidates[0].finishReason).toUpperCase().includes('MAX')) {
                lastError = new Error('Gemini finished due to MAX_TOKENS');
                console.log('🔁 Gemini returned finishReason MAX_TOKENS — retrying smaller size.');
                continue;
              }
              break;
            case 'mistral':
            case 'cerebras':
            case 'nvidia':
              // Try common shapes: OpenAI-like choices -> choices[0].message.content
              summary = parsed?.choices?.[0]?.message?.content || parsed?.result || parsed?.output?.[0]?.content || parsed?.text || null;
              break;
          }

          if (!summary) {
            const reason = parsed && (parsed.error?.message || JSON.stringify(parsed).slice(0, 300));
            if (isTokenLimitError(String(reason))) {
              lastError = new Error(`Token limit: ${String(reason)}`);
              continue;
            }
            throw new Error(`No summary returned from ${provider.name} - ${String(reason)}`);
          }

          const trimmed = (typeof summary === 'string') ? summary.trim() : JSON.stringify(summary);
          return {
            summary: trimmed,
            provider: provider.name,
            model: provider.model || 'N/A',
            usedMaxTokens: attemptMaxTokens,
            rawResponse: parsed
          };

        } catch (attemptError) {
          if (isTokenLimitError(String(attemptError?.message))) {
            lastError = attemptError;
            console.log(`⚠️ ${provider.name} token error on attempt maxTokens=${attemptMaxTokens}: ${attemptError.message}`);
            continue; // try smaller next
          }
          console.warn(`❌ ${provider.name} attempt failed (maxTokens=${attemptMaxTokens}):`, attemptError.message);
          throw attemptError;
        }
      } // attempts

      if (lastError) throw lastError;
      throw new Error(`${provider.name} failed after retries`);
    } // tryProviderWithRetries

    // iterate providers until success
    const errors = [];
    for (const provider of availableProviders) {
      try {
        console.log(`📡 Trying provider ${provider.name}`);
        const result = await tryProviderWithRetries(provider);
        console.log(`✅ Summary generated by ${result.provider} (model ${result.model}, usedMaxTokens=${result.usedMaxTokens})`);
        return res.status(200).json({
          summary: result.summary,
          metadata: {
            provider: result.provider,
            model: result.model,
            inputLength: truncatedText.length,
            originalInputLength: originalLength,
            outputLength: result.summary.length,
            usedMaxTokens: result.usedMaxTokens,
            timestamp: new Date().toISOString()
          }
        });
      } catch (pErr) {
        console.warn(`⚠️ ${provider.name} failed (moving to next provider):`, pErr.message);
        errors.push({ provider: provider.name, message: pErr.message });
      }
    }

    console.error('❌ All providers failed', errors);
    return res.status(503).json({ error: 'All providers failed to generate summary', providerErrors: errors });

  } catch (err) {
    console.error('🔥 Unexpected error in Tutorly Summarizer:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
