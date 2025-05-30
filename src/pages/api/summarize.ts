// Create this file at: src/pages/api/summarize.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Try multiple possible environment variable names
  const apiKey = process.env.OPENROUTER_KEY || 
                 process.env.OPENROUTER_API_KEY || 
                 process.env.NEXT_PUBLIC_OPENROUTER_KEY ||
                 process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  console.log("=== SERVER-SIDE ENV DEBUG ===");
  console.log("Available env vars:", Object.keys(process.env).filter(key => 
    key.includes('OPENROUTER') || key.includes('API')
  ));
  console.log("API Key found:", !!apiKey);
  console.log("API Key length:", apiKey?.length || 0);

  if (!apiKey) {
    const availableKeys = Object.keys(process.env).filter(key => 
      key.includes('OPENROUTER') || key.includes('API')
    );
    return res.status(500).json({ 
      error: 'OpenRouter API key is missing',
      availableKeys: availableKeys,
      debug: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      }
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://gettutorly.com",
        "X-Title": "Tutorly",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes documents."
          },
          {
            role: "user",
            content: `Summarize this document:\n\n${text}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenRouter API error:", data);
      return res.status(response.status).json({ 
        error: data.error?.message || "Failed to fetch summary",
        details: data
      });
    }

    const summary = data.choices?.[0]?.message?.content || "No summary generated.";
    res.status(200).json({ summary });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
