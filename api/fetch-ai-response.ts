
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  console.log('API function called with method:', request.method);
  console.log('Request headers:', request.headers);
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    console.log('Method not allowed:', request.method);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Raw request body:', request.body);
    console.log('Request body type:', typeof request.body);
    
    // Parse request body as JSON
    const body = request.body;
    let prompt: string;

    // Handle different body formats
    if (typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body);
        console.log('Parsed body from string:', parsedBody);
        prompt = parsedBody.prompt;
      } catch (parseError) {
        console.error('Error parsing request body as JSON:', parseError);
        return response.status(400).json({ message: 'Invalid JSON in request body' });
      }
    } else if (body && typeof body === 'object') {
      console.log('Body is already an object:', body);
      prompt = body.prompt;
    } else {
      console.error('Invalid request body format:', body);
      return response.status(400).json({ message: 'Invalid request body format' });
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.error('Missing or invalid prompt:', prompt);
      return response.status(400).json({ message: 'Missing prompt' });
    }

    console.log('Processing prompt:', prompt.substring(0, 50) + '...');
    
    // For now, just return a simple response with the prompt
    const result = `Hello! I received your message: "${prompt}". This is a test response from the AI API.`;
    
    console.log('Returning result:', result.substring(0, 50) + '...');
    return response.status(200).json({ result });
  } catch (error) {
    console.error('Unexpected error processing request:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return response.status(500).json({ 
      message: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
