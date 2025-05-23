// pages/api/fetch-ai-response.js

export default async function handler(req, res) {
  console.log('=== API HANDLER START ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { prompt, message } = req.body;
    const userInput = prompt || message;

    if (!userInput || typeof userInput !== 'string') {
      console.log('Invalid input:', userInput);
      return res.status(400).json({ 
        message: 'Missing or invalid prompt/message',
        success: false 
      });
    }

    const reply = `Echo: ${userInput}`;

    console.log('Sending response:', reply);
    return res.status(200).json({ 
      result: reply,
      success: true 
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
      success: false
    });
  }
}
