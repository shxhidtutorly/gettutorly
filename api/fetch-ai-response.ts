
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== API FUNCTION START ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Get prompt from request body
    const { prompt } = req.body || {};
    
    console.log('Extracted prompt:', prompt);
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.log('Invalid prompt provided');
      return res.status(400).json({ message: 'Missing prompt' });
    }

    console.log('Processing prompt successfully');
    
    // For now, return a simple test response to verify the API works
    const result = `Hello! I received your message: "${prompt}". This is a test response from the API function.`;
    
    console.log('Returning result:', result);
    return res.status(200).json({ result });
    
  } catch (error) {
    console.error('=== API FUNCTION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Raw error:', error);
    
    return res.status(500).json({ 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check Vercel function logs for more information'
    });
  }
}
