// api/ai.js
import { AIProviderManager } from '../src/lib/aiProviders.js';

const aiManager = new AIProviderManager();

export default async function handler(req, res) {
  // CORS headers
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { prompt, model } = body;

    let text, files;
    if (typeof prompt === 'string') {
      text = prompt;
      files = [];
    } else if (prompt && typeof prompt === 'object' && typeof prompt.text === 'string') {
      text = prompt.text;
      files = Array.isArray(prompt.files) ? prompt.files : [];
    } else {
      return res.status(400).json({
        error: 'Invalid prompt. Must be a string or an object with a text field.',
      });
    }

    const SUPPORTED_MODELS = [
      'gemini',
      'groq',
      'claude',
      'openrouter',
      'huggingface',
      'together',
      'nvidia',
      'mistral',
      'cerebras',
    ];

    if (model && !SUPPORTED_MODELS.includes(model)) {
      return res.status(400).json({
        error: `Invalid model. Supported models: ${SUPPORTED_MODELS.join(', ')}`,
      });
    }

    const aiResponse = await aiManager.getAIResponse(
      { text, files },
      model,
      { response_format: 'json' }
    );

    const parsedResponse = JSON.parse(aiResponse.message);

    return res.status(200).json({
      response: parsedResponse,
      provider: aiResponse.provider,
      model: aiResponse.model,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message,
        });
      }
      if (error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('invalid key')) {
        return res.status(401).json({
          error: 'Authentication failed. Please check API keys.',
          details: error.message,
        });
      }
    }

    return res.status(500).json({
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
