// Create this file at: src/pages/api/test-env.ts (or app/api/test-env/route.ts for App Router)

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientSideKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY;
  const serverSideKey = process.env.OPENROUTER_KEY;
  
  // Get all environment variables for debugging
  const allEnvVars = Object.keys(process.env);
  const nextPublicVars = allEnvVars.filter(key => key.startsWith('NEXT_PUBLIC_'));
  const openRouterVars = allEnvVars.filter(key => key.includes('OPENROUTER'));
  
  res.status(200).json({
    clientSideKeyExists: !!clientSideKey,
    clientSideKeyLength: clientSideKey?.length || 0,
    serverSideKeyExists: !!serverSideKey,
    serverSideKeyLength: serverSideKey?.length || 0,
    allNextPublicVars: nextPublicVars,
    allOpenRouterVars: openRouterVars,
    totalEnvVars: allEnvVars.length,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
}
