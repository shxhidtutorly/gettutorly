
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== TEST API ROUTE ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  if (req.method === 'POST') {
    return res.status(200).json({ 
      message: 'Test API route working!',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  }
  
  return res.status(200).json({ 
    message: 'Test API route is alive!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
