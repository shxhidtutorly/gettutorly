// api/summarize.js - Used by Tutorly AI to generate smart study summaries ✨📚
export default async function handler(req, res) {
  console.log(`📘 Tutorly Summarizer called: ${req.method} ${req.url}`);

  // CORS Setup
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }

    console.log(`📚 Text received for summarization: ${text.length} characters`);

    // Define API providers Tutorly can use
    const apiProviders = [
      {
        name: 'Groq',
        key: process.env.GROQ_API_KEY,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        headers: {},
        format: 'openai'
      },
      // Add more providers if needed
    ];

    const availableProviders = apiProviders.filter(p => p.key && p.key.length > 10);
    if (availableProviders.length === 0) {
      return res.status(500).json({
        error: 'No valid API keys configured for Tutorly summarization'
      });
    }

    // Core summary function
    async function callProvider(provider) {
      const maxChars = 12000;
      const truncatedText = text.slice(0, maxChars);

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
        ...provider.headers
      };

      const requestBody = {
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are Tutorly, an AI study assistant that provides clear and concise summaries to help students understand key concepts quickly.'
          },
          {
            role: 'user',
            content: `Summarize the following study material:\n\n${truncatedText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      };

      console.log(`📡 Calling ${provider.name} at ${provider.url}...`);

      const response = await fetch(provider.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${error?.error?.message || error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content;

      if (!summary) {
        throw new Error(`No summary returned from ${provider.name}`);
      }

      return {
        summary: summary.trim(),
        provider: provider.name,
        model: provider.model
      };
    }

    // Try all providers in order
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

    return res.status(503).json({
      error: 'All providers failed to generate summary'
    });

  } catch (err) {
    console.error('🔥 Unexpected error in Tutorly Summarizer:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

