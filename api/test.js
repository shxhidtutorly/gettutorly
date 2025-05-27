// api/test.js
export default function handler(req, res) {
  console.log('=== TEST API ROUTE ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Test API is working!',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  }
  
  if (req.method === 'POST') {
    return res.status(200).json({ 
      message: 'Test API POST is working!',
      body: req.body,
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
  }
  
  return res.status(405).json({ 
    error: `Method ${req.method} not allowed`,
    allowed: ['GET', 'POST', 'OPTIONS']
  });
}
