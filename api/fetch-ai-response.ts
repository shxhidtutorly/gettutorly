
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Parse the request body to get the prompt
    const { prompt } = request.body;

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return response.status(400).json({ message: 'Missing prompt' });
    }

    // Return a simple response with the prompt
    return response.status(200).json({ result: `Received prompt: ${prompt}` });
  } catch (error) {
    console.error('Error processing request:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}
