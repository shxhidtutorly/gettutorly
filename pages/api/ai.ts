
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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model }: AIRequest = req.body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing prompt. Please provide a valid string.' 
      });
    }

    if (!model || !['gemini', 'groq', 'claude', 'openrouter', 'huggingface', 'together'].includes(model)) {
      return res.status(400).json({ 
        error: 'Invalid or missing model. Supported models: gemini, groq, claude, openrouter, huggingface, together' 
      });
    }

    // Initialize AI Provider Manager
    const aiManager = new AIProviderManager();
    
    // Get response from the specified AI provider with automatic key rotation
    const response = await aiManager.getAIResponse(prompt, model);
    
    return res.status(200).json({
      message: response.message,
      provider: response.provider,
      model: response.model
    });

  } catch (error) {
    console.error('AI API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message 
        });
      }
      
      if (error.message.includes('unauthorized') || error.message.includes('invalid key')) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please check API keys.',
          details: error.message 
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
