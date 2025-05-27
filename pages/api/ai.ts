
import type { NextApiRequest, NextApiResponse } from 'next';
import { AIProviderManager } from '../../src/lib/aiProviders';

interface AIRequest {
  prompt: string;
  model: 'gemini' | 'groq' | 'claude' | 'openrouter' | 'huggingface' | 'together';
}

interface AIResponse {
  message: string;
  provider?: string;
  model?: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIResponse | ErrorResponse>
) {
  console.log('=== AI API ROUTE START ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { prompt, model }: AIRequest = req.body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      console.log('❌ Invalid prompt:', prompt);
      return res.status(400).json({ 
        error: 'Invalid or missing prompt. Please provide a valid string.' 
      });
    }

    if (!model || !['gemini', 'groq', 'claude', 'openrouter', 'huggingface', 'together'].includes(model)) {
      console.log('❌ Invalid model:', model);
      return res.status(400).json({ 
        error: 'Invalid or missing model. Supported models: gemini, groq, claude, openrouter, huggingface, together' 
      });
    }

    console.log('✅ Valid request - Prompt:', prompt.substring(0, 50) + '...', 'Model:', model);

    // Initialize AI Provider Manager
    const aiManager = new AIProviderManager();
    
    // Get response from the specified AI provider with automatic key rotation
    console.log('🤖 Calling AI Provider Manager...');
    const response = await aiManager.getAIResponse(prompt, model);
    
    console.log('✅ AI Response received:', response.message.substring(0, 100) + '...');
    console.log('=== AI API ROUTE SUCCESS ===');
    
    return res.status(200).json({
      message: response.message,
      provider: response.provider,
      model: response.model
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
