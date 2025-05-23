
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Parse request body as JSON
    const body = request.body;
    let prompt: string;

    // Handle different body formats
    if (typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body);
        prompt = parsedBody.prompt;
      } catch (parseError) {
        console.error('Error parsing request body as JSON:', parseError);
        return response.status(400).json({ message: 'Invalid JSON in request body' });
      }
    } else if (body && typeof body === 'object') {
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
    
    // For now, just return a simple response
    return response.status(200).json({ result: `Received prompt: ${prompt}` });
  } catch (error) {
    console.error('Error processing request:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}
