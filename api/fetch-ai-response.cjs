
// API handler for fetch-ai-response endpoint
export default async function handler(req, res) {
  console.log('=== API HANDLER START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);

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
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: `Method ${req.method} Not Allowed`,
      message: 'This endpoint only accepts POST requests',
      success: false 
    });
  }

  try {
    console.log('Body:', req.body);
    const { prompt, message } = req.body;
    const userInput = prompt || message;

    if (!userInput || typeof userInput !== 'string') {
      console.log('Invalid input:', userInput);
      return res.status(400).json({ 
        error: 'Missing or invalid prompt/message',
        message: 'Please provide a valid prompt or message',
        success: false 
      });
    }

    // Simple echo response for testing
    const reply = `AI Response: ${userInput}`;

    console.log('Sending successful response:', reply);
    return res.status(200).json({ 
      result: reply,
      message: reply,
      success: true 
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      success: false
    });
  }
}
