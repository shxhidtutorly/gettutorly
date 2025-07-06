import { AIProviderManager } from '../src/lib/aiProviders.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'gemini' } = req.body;

    // Validate prompt (string or object with text)
    const isValidPrompt =
      typeof prompt === 'string' ||
      (typeof prompt === 'object' && typeof prompt.text === 'string');

    if (!isValidPrompt) {
      return res.status(400).json({ 
        error: 'Invalid prompt. Must be a string or object with a "text" field.' 
      });
    }

    if (
      model &&
      !['gemini', 'groq', 'claude', 'openrouter', 'huggingface', 'together'].includes(model)
    ) {
      return res.status(400).json({
        error: 'Invalid model. Supported models: gemini, groq, claude, openrouter, huggingface, together',
      });
    }

    const aiManager = new AIProviderManager();
const text = typeof prompt === 'string' ? prompt : prompt.text;
const aiResponse = await aiManager.getAIResponse(text, model);

    return res.status(200).json({
      response: aiResponse.message,
      provider: aiResponse.provider,
      model: aiResponse.model,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ error: 'Rate limit exceeded.', details: error.message });
      }
      if (error.message.includes('unauthorized') || error.message.includes('invalid key')) {
        return res.status(401).json({ error: 'Authentication failed.', details: error.message });
      }
    }

    return res.status(500).json({
      error: 'Internal server error.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
