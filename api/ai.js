// api/ai.js
console.log('🚀 Starting AI API import...');

import { AIProviderManager } from '../src/lib/aiProviders.js';

console.log('✅ AI API import successful');

const aiManager = new AIProviderManager();

export default async function handler(req, res) {
  console.log('=== AI API ROUTE START ===');
  console.log('Method:', req.method);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // ✅ allow Authorization header too
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Body may arrive as string in some runtimes
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    console.log('Request body:', JSON.stringify(body, null, 2));

    // ===== Mindmap mode (fixes your 400) =====
    if (body.mode === 'mindmap') {
      const { topic, language = 'en', model = 'gemini' } = body;
      if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "topic" for mindmap mode' });
      }

      const promptText = `
Generate a concise mind map as JSON for the topic: "${topic}".
Language: ${language}.
Return ONLY valid JSON (no markdown, no code fences) following EXACTLY this schema:
{
  "title": "string",
  "children": [
    { "title": "string", "children": [] }
  ]
}
Keep it 3 levels deep max, 5–7 primary children.
`;

      console.log('🤖 Calling AI for mindmap...');
      const aiResponse = await aiManager.getAIResponse({ text: promptText }, model, { maxOutputTokens: 2000 });

      let jsonText = aiResponse.message?.trim() || '';

      // strip common wrappers if the model ignored instructions
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        console.error('❌ AI did not return valid JSON:', jsonText.slice(0, 500));
        return res.status(500).json({ error: 'AI did not return valid JSON', raw: jsonText });
      }

      console.log('✅ Mindmap JSON generated');
      // Return the JSON directly so your frontend’s processAIData(data) works
      return res.status(200).json(parsed);
    }

    // ===== Default chat/completion path (kept intact) =====
    const { prompt, model = 'gemini' } = body;

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
      console.log('❌ Invalid model:', model);
      return res.status(400).json({
        error: `Invalid model. Supported models: ${SUPPORTED_MODELS.join(', ')}`,
      });
    }

    const loggableText = typeof text === 'string' ? text.substring(0, 50) + '...' : '[Non-string Prompt]';
    console.log('✅ Valid request - Prompt:', loggableText, 'Model:', model);

    console.log('🔧 Creating AIProviderManager instance... (already created)');
    console.log('🤖 Calling AI Provider Manager...');
    const aiResponse = await aiManager.getAIResponse({ text, files }, model);

    console.log('✅ AI Response received:', (aiResponse.message || '').substring(0, 100) + '...');
    console.log('=== AI API ROUTE SUCCESS ===');

    return res.status(200).json({
      response: aiResponse.message,
      provider: aiResponse.provider,
      model: aiResponse.model,
    });

  } catch (error) {
    console.error('=== AI API ROUTE ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);

    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        console.log('❌ Rate limit error');
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message,
        });
      }
      if (error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('invalid key')) {
        console.log('❌ Auth error');
        return res.status(401).json({
          error: 'Authentication failed. Please check API keys.',
          details: error.message,
        });
      }
    }

    console.log('❌ General error');
    return res.status(500).json({
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
