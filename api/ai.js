// api/ai.js
console.log('🚀 Starting AI API import...');

import { AIProviderManager } from '../src/lib/aiProviders.js';

console.log('✅ AI API import successful');

export default async function handler(req, res) {
  console.log('=== AI API ROUTE START ===');
  console.log('Method:', req.method);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { prompt, model = 'gemini' } = req.body;

    let text, files;
    if (typeof prompt === 'string') {
      text = prompt;
      files = [];
    } else if (typeof prompt === 'object' && prompt !== null && typeof prompt.text === 'string') { // Added prompt !== null check
      text = prompt.text;
      files = Array.isArray(prompt.files) ? prompt.files : [];
    } else {
      return res.status(400).json({
        error: 'Invalid prompt. Must be a string or an object with a text field.',
      });
    }

    if (model && !['gemini', 'groq', 'claude', 'openrouter', 'huggingface', 'together'].includes(model)) {
      console.log('❌ Invalid model:', model);
      return res.status(400).json({
        error: 'Invalid model. Supported models: gemini, groq, claude, openrouter, huggingface, together',
      });
    }

    // FIX START: Access `text` property of the prompt object for logging
    // Ensure `text` is a string before calling substring
    const loggableText = typeof text === 'string' ? text.substring(0, 50) + '...' : '[Non-string Prompt]';
    console.log('✅ Valid request - Prompt:', loggableText, 'Model:', model);
    // FIX END

    // Initialize AI Provider Manager
    console.log('🔧 Creating AIProviderManager instance...');
    const aiManager = new AIProviderManager();
    console.log('✅ AIProviderManager created successfully');

    // Get response from the specified AI provider with automatic key rotation
    console.log('🤖 Calling AI Provider Manager...');
    // The `getAIResponse` method already expects an object like { text, files } when handling Gemini
    // For other models, your aiProviders.js code handles converting this object back to a string prompt
    const aiResponse = await aiManager.getAIResponse({ text, files }, model);

    console.log('✅ AI Response received:', aiResponse.message.substring(0, 100) + '...');
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

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.log('❌ Rate limit error');
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message,
        });
      }

      if (error.message.includes('unauthorized') || error.message.includes('invalid key')) {
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
