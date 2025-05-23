export default async function handler(req, res) {
  // CORS
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
    const { prompt } = req.body; // Vercel automatically parses JSON
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid prompt' });
    }
    
    const reply = `Hello! You sent: "${prompt}"`;
    return res.status(200).json({ result: reply });
    
  } catch (error) {
    console.error('Function crashed:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message || 'Unknown error',
    });
  }
}
