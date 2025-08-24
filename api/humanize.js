// api/humanize.js - Tutorly AI Humanizer endpoint
// This endpoint transforms AI-generated content into natural, human-like writing.
// REFACTORED FOR ROBUSTNESS, MAINTAINABILITY, AND PERFORMANCE.

// --- UTILITIES (Defined once at module scope) ---

/**
 * A conservative heuristic for estimating token count (1 token ≈ 4 chars).
 * @param {string} text The text to estimate.
 * @returns {number} The estimated number of tokens.
 */
const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(String(text).length / 4);
};

/**
 * Safely parses a string into a JSON object.
 * @param {string | object} content The content to parse.
 * @returns {object | null} The parsed object or null if parsing fails.
 */
const parseJsonResponse = (content) => {
  try {
    // If the model wraps the JSON in markdown code fences, strip them out.
    const jsonString = content.replace(/^```json\n|```$/g, '').trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Failed to parse content as JSON:', content);
    return null;
  }
};


// --- CORE API CALLER (Centralized logic for all fetch requests) ---

/**
 * A resilient function to call any API endpoint with a timeout and robust error handling.
 * @param {string} url The API endpoint URL.
 * @param {object} options The options for the fetch request (method, headers, body).
 * @param {number} [timeout=30000] The timeout in milliseconds.
 * @returns {Promise<object>} The JSON response from the API.
 */
async function callApi(url, options, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text(); // Read error as text to avoid JSON parse errors
      throw new Error(`API Error: ${response.status} ${response.statusText} - Body: ${errorBody}`);
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API request timed out.');
    }
    throw error;
  }
}


// --- PROVIDER IMPLEMENTATIONS (Modular and reusable) ---

/**
 * Handles calls for any OpenAI-compatible API.
 * @param {string} providerName The name of the provider (e.g., 'Groq').
 * @param {string} apiKey The API key.
 * @param {string} model The model name.
 * @param {string} systemPrompt The system prompt.
 * @param {string} userPrompt The user prompt.
 * @returns {Promise<object|null>} The parsed result or null on failure.
 */
async function callOpenAICompatible(providerName, apiKey, model, systemPrompt, userPrompt) {
  const endpoints = {
    OpenRouter: 'https://openrouter.ai/api/v1/chat/completions',
    Groq: 'https://api.groq.com/openai/v1/chat/completions',
    TogetherAI: 'https://api.together.xyz/v1/chat/completions',
    OpenAI: 'https://api.openai.com/v1/chat/completions',
  };

  const data = await callApi(endpoints[providerName], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty or invalid content from ${providerName}`);
  
  return parseJsonResponse(content);
}

/**
 * Handles calls for the Anthropic (Claude) API.
 * @param {string} apiKey The API key.
 * @param {string} model The model name.
 * @param {string} systemPrompt The system prompt.
 * @param {string} userPrompt The user prompt.
 * @returns {Promise<object|null>} The parsed result or null on failure.
 */
async function callAnthropic(apiKey, model, systemPrompt, userPrompt) {
  const data = await callApi('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.3,
      max_tokens: 2000
    })
  });
  
  const content = data.content?.[0]?.text;
  if (!content) throw new Error('Empty or invalid content from Anthropic');

  return parseJsonResponse(content);
}


// --- API ENDPOINT HANDLER ---

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*'); // Restrict in production
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { text, language = 'English', tone = 'Neutral' } = body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }
    
    console.log(`🧠 Tutorly AI Humanizer called. Input tokens: ~${estimateTokens(text)}`);

    const systemPrompt = `You are an expert copy editor. Rewrite the user's text to be clear, concise, and human-like, following all rules.
Rules: Use active voice, short sentences, and simple language. Address the reader directly with "you". Avoid jargon, clichés, passive voice, semicolons, and filler words like "very", "really", "just".
Your final output MUST BE a single, valid JSON object with three fields: "rewrittenText" (string), "score" (integer from 1-100 indicating how well you followed the rules), and "explanation" (a brief string explaining the score). Do not include any text outside of this JSON object.`;
    
    const userPrompt = `Please rewrite the following text in ${language} with a ${tone.toLowerCase()} tone:\n\n---\n\n${text}`;

    // --- DYNAMIC PROVIDER CONFIGURATION ---
    const providerConfig = [
      {
        name: 'OpenRouter',
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free',
        enabled: !!process.env.OPENROUTER_API_KEY,
        func: (config) => callOpenAICompatible(config.name, config.apiKey, config.model, systemPrompt, userPrompt)
      },
      {
        name: 'Groq',
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || 'llama3-70b-8192',
        enabled: !!process.env.GROQ_API_KEY,
        func: (config) => callOpenAICompatible(config.name, config.apiKey, config.model, systemPrompt, userPrompt)
      },
      {
        name: 'TogetherAI',
        apiKey: process.env.TOGETHER_API_KEY,
        model: process.env.TOGETHER_MODEL || 'lgai/exaone-3-5-32b-instruct',
        enabled: !!process.env.TOGETHER_API_KEY,
        func: (config) => callOpenAICompatible(config.name, config.apiKey, config.model, systemPrompt, userPrompt)
      },
      {
        name: 'OpenAI',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        enabled: !!process.env.OPENAI_API_KEY,
        func: (config) => callOpenAICompatible(config.name, config.apiKey, config.model, systemPrompt, userPrompt)
      },
      {
        name: 'Anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
        enabled: !!process.env.ANTHROPIC_API_KEY,
        func: (config) => callAnthropic(config.apiKey, config.model, systemPrompt, userPrompt)
      }
    ];
    
    const availableProviders = providerConfig.filter(p => p.enabled);

    if (availableProviders.length === 0) {
      return res.status(503).json({ error: 'No AI providers are configured. Please set API keys.' });
    }

    let result = null;
    let lastError = null;

    for (const provider of availableProviders) {
      try {
        console.log(`Attempting provider: ${provider.name}...`);
        result = await provider.func(provider);
        if (result && result.rewrittenText) {
          console.log(`✅ Success with provider: ${provider.name}`);
          break; // Success, exit the loop
        }
      } catch (err) {
        console.error(`Provider ${provider.name} failed: ${err.message}`);
        lastError = err;
      }
    }

    if (!result) {
      console.error('All available providers failed.');
      return res.status(502).json({
        error: 'Failed to process text with all available AI providers.',
        details: lastError?.message || 'Unknown provider error.'
      });
    }
    
    // Final validation of the successful result
    if (!result.rewrittenText || !result.score || !result.explanation) {
         return res.status(500).json({ error: 'AI provider returned an incomplete JSON object.' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error(`Humanizer main error: ${error.message}`);
    return res.status(500).json({
      error: 'An internal server error occurred.',
      details: error.message
    });
  }
}
