import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== API FUNCTION START ===');
  console.log('Method:', req.method);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // ⛑️ Read and parse raw body manually (required in Vercel)
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString('utf-8');
    const data = JSON.parse(rawBody);

    console.log('Parsed body:', data);

    const { prompt } = data;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid prompt' });
    }

    // ✅ Send test response
    const result = `Hello! I received your message: "${prompt}". This is a test response from the API function.`;
    return res.status(200).json({ result });

  } catch (error) {
    console.error('API FUNCTION ERROR:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
