// api/ai.js
import { AIProviderManager } from '../src/lib/aiProviders.js';

export default async function handler(req, res) {
  console.log('=== AI API ROUTE START ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
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
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { prompt, model = 'gemini' } = req.body;
    
    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      console.log('❌ Invalid prompt:', prompt);
      return res.status(400).json({ 
        error: 'Prompt is required and must be a string' 
      });
    }
    
    if (model && !['gemini', 'groq', 'claude', 'openrouter', 'huggingface', 'together'].includes(model)) {
      console.log('❌ Invalid model:', model);
      return res.status(400).json({ 
        error: 'Invalid model. Supported models: gemini, groq, claude, openrouter, huggingface, together' 
      });
    }
    
    console.log('✅ Valid request - Prompt:', prompt.substring(0, 50) + '...', 'Model:', model);
    
    // Initialize AI Provider Manager
    const aiManager = new AIProviderManager();
    
    // Get response from the specified AI provider with automatic key rotation
    console.log('🤖 Calling AI Provider Manager...');
    const aiResponse = await aiManager.getAIResponse(prompt, model);
    
    console.log('✅ AI Response received:', aiResponse.message.substring(0, 100) + '...');
    console.log('=== AI API ROUTE SUCCESS ===');
    
    return res.status(200).json({
      response: aiResponse.message,
      provider: aiResponse.provider,
      model: aiResponse.model
    });
    
  } catch (error) {
    console.error('=== AI API ROUTE ERROR ===');
    console.error('Error details:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.log('❌ Rate limit error');
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message 
        });
      }
      
      if (error.message.includes('unauthorized') || error.message.includes('invalid key')) {
        console.log('❌ Auth error');
        return res.status(401).json({ 
          error: 'Authentication failed. Please check API keys.',
          details: error.message 
        });
      }
    }
    
    console.log('❌ General error');
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
