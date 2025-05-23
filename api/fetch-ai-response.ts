export default async function handler(req, res) {
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
    console.log('Request body:', req.body);
    
    const { prompt, message } = req.body;
    const userInput = prompt || message;
    
    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid prompt/message' });
    }
    
    // Simple echo response for testing
    const reply = `Echo: ${userInput}`;
    
    return res.status(200).json({ 
      result: reply,
      success: true 
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
}
