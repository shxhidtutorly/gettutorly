// api/health.js
export default function handler(req, res) {
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  // Get environment info
  const availableKeys = Object.keys(process.env).filter(key => 
    key.includes('OPENROUTER') || 
    key.includes('API') || 
    key.includes('VITE')
  );

  const apiKey = process.env.OPENROUTER_KEY || 
                 process.env.OPENROUTER_API_KEY || 
                 process.env.VITE_OPENROUTER_KEY ||
                 process.env.VITE_OPENROUTER_API_KEY;

  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    platform: 'Vercel Functions',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    },
    api: {
      hasOpenRouterKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      availableKeys: availableKeys.slice(0, 10) // First 10 for safety
    },
    message: 'API health check passed!'
  };
  
  return res.status(200).json(data);
}
