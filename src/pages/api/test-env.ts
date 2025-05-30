// Create this file at: src/pages/api/test-env.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow all methods for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const openRouterKeys = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('openrouter') || 
    key.toLowerCase().includes('open_router') ||
    key.toLowerCase().includes('api')
  );

  const allEnvKeys = Object.keys(process.env).slice(0, 20); // First 20 keys

  return res.status(200).json({
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    },
    openRouterKeys: openRouterKeys,
    sampleEnvKeys: allEnvKeys,
    hasOpenRouterKey: !!(
      process.env.OPENROUTER_KEY || 
      process.env.OPENROUTER_API_KEY || 
      process.env.NEXT_PUBLIC_OPENROUTER_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    ),
    keyLengths: {
      OPENROUTER_KEY: process.env.OPENROUTER_KEY?.length || 0,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.length || 0,
      NEXT_PUBLIC_OPENROUTER_KEY: process.env.NEXT_PUBLIC_OPENROUTER_KEY?.length || 0,
      NEXT_PUBLIC_OPENROUTER_API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.length || 0
    }
  });
}
