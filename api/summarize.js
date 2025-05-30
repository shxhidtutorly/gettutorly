// api/summarize.js - Used by Tutorly AI to generate smart study summaries ✨📚
export default async function handler(req, res) {
  console.log(`📘 Tutorly Summarizer called: ${req.method} ${req.url}`);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }

    console.log(`📚 Text received for summarization: ${text.length} characters`);
    const maxChars = 12000;
    const truncatedText = text.slice(0, maxChars);

    const systemPrompt = 'You are Tutorly, an AI study assistant that provides clear and concise summaries to help students understand key concepts quickly.';
    const userPrompt = `Summarize the following study material:\n\n${truncatedText}`;

    const apiProviders = [
      {
        name: 'Groq',
        key: process.env.GROQ_API_KEY,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'mixtral-8x7b-32768',
        format: 'openai'
      },
      {
        name: 'OpenRouter',
        key: process.env.OPENROUTER_KEY,
        url: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'mistralai/mixtral-8x7b',
        format: 'openai'
      },
      {
        name: 'Claude',
        key: process.env.CLAUDE_API_KEY,
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307',
        format: 'anthropic'
      },
      {
        name: 'Together',
        key: process.env.TOGETHER_API_KEY,
        url: 'https://api.together.xyz/v1/chat/completions',
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        format: 'openai'
      },
      {
        name: 'HuggingFace',
        key: process.env.HUGGINGFACE_API_KEY,
        url: 'https://api-inference.huggingface.co/models/google/flan-t5-large',
        format: 'hf'
      },
      {
        name: 'Gemini',
        key: process.env.GEMINI_API_KEY,
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        format: 'gemini'
      }
    ];

    const availableProviders = apiProviders.filter(p => p.key && p.key.length > 10);
    if (availableProviders.length === 0) {
      return res.status(500).json({ error: 'No valid API keys configured for Tutorly summarization' });
    }

    async function callProvider(provider) {
      console.log(`📡 Calling ${provider.name}...`);

      let headers = {};
      let body = {};
      switch (provider.format) {
        case 'openai':
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.key}`
          };
          body = {
            model: provider.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1000
          };
          break;

        case 'anthropic':
          headers = {
            'Content-Type': 'application/json',
            'x-api-key': provider.key,
            'anthropic-version': '2023-06-01'
          };
          body = {
            model: provider.model,
            messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }],
            temperature: 0.3,
            max_tokens: 1000
          };
          break;

        case 'hf':
          headers = {
            'Authorization': `Bearer ${provider.key}`,
            'Content-Type': 'application/json'
          };
          body = { inputs: userPrompt };
          break;

        case 'gemini':
          headers = {
            'Content-Type': 'application/json'
          };
          body = {
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000
            }
          };
          provider.url += `?key=${provider.key}`;
          break;
      }

      const response = await fetch(provider.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${err?.error?.message || err.message || 'Unknown error'}`);
      }

      const data = await response.json();
      let summary = '';

      switch (provider.format) {
        case 'openai':
        case 'together':
          summary = data.choices?.[0]?.message?.content;
          break;
        case 'anthropic':
          summary = data.content?.[0]?.text || data?.content;
          break;
        case 'hf':
          summary = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
          break;
        case 'gemini':
          summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          break;
      }

      if (!summary) {
        throw new Error(`No summary returned from ${provider.name}`);
      }

      return {
        summary: summary.trim(),
        provider: provider.name,
        model: provider.model || 'N/A'
      };
    }

    for (const provider of availableProviders) {
      try {
        const result = await callProvider(provider);
        console.log(`✅ Summary from ${result.provider}`);
        return res.status(200).json({
          summary: result.summary,
          metadata: {
            provider: result.provider,
            model: result.model,
            inputLength: text.length,
            outputLength: result.summary.length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err) {
        console.warn(`⚠️ ${provider.name} failed:`, err.message);
      }
    }

    return res.status(503).json({ error: 'All providers failed to generate summary' });

  } catch (err) {
    console.error('🔥 Unexpected error in Tutorly Summarizer:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}


