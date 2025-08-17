// api/ai-unified.js
console.log('🚀 Starting Unified AI API import...');

import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

console.log('✅ Unified AI API import successful');

// Import authentication utilities
import { verifyFirebaseToken } from '../src/lib/firebase-auth-utils.js';

// Import Firebase Admin for user preferences
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

/**
 * Get user language preference from Firestore
 */
async function getUserLanguage(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.preferences?.language || 'en';
    }
    return 'en';
  } catch (error) {
    console.error('Error fetching user language:', error);
    return 'en';
  }
}

/**
 * Translate text using the translation API
 */
async function translateText(text, targetLang, sourceLang = 'en') {
  if (targetLang === 'en' || targetLang === sourceLang) {
    return text;
  }

  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'https://gettutorly.com'}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang,
        contextType: 'chat'
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Try AI providers in fallback order
 */
async function tryProviders(prompt, providers = ['gemini', 'groq', 'claude', 'openrouter']) {
  for (const provider of providers) {
    try {
      console.log(`🔄 Trying provider: ${provider}`);
      let responseText = '';

      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const genModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await genModel.generateContent(prompt);
        responseText = result.response.text();
      } 
      else if (provider === 'groq') {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        const d = await r.json();
        responseText = d.choices?.[0]?.message?.content || '';
      }
      else if (provider === 'claude') {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        const d = await r.json();
        responseText = d.content?.[0]?.text || '';
      }
      else if (provider === 'openrouter') {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        const d = await r.json();
        responseText = d.choices?.[0]?.message?.content || '';
      }

      if (responseText) {
        console.log(`✅ Success with ${provider}`);
        return { responseText, provider };
      }
    } catch (err) {
      console.error(`❌ ${provider} failed:`, err.message);
    }
  }

  throw new Error('All AI providers failed');
}

export default async function handler(req, res) {
  console.log('=== UNIFIED AI API ROUTE START ===');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let user;
  try {
    user = await verifyFirebaseToken(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }

  try {
    const { mode, topic, prompt, messages } = req.body;
    const userLanguage = await getUserLanguage(user.uid);

    // MIND MAP MODE
    if (mode === 'mindmap') {
      if (!topic) return res.status(400).json({ error: 'Topic is required' });

      const mindMapPrompt = `Create a comprehensive mind map for the topic "${topic}". 

Please respond with ONLY a valid JSON object in this exact format:
{
  "title": "Root Node Title",
  "children": [
    { "title": "Child Node 1", "children": [] }
  ]
}

Requirements:
- 4-6 main child nodes
- 2-4 sub-nodes each
- Titles 2-4 words
- Focus on key concepts, definitions, examples, applications
- VALID JSON only`;

      const { responseText, provider } = await tryProviders(mindMapPrompt);

      let mindMapData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        mindMapData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

        if (!mindMapData.title || !Array.isArray(mindMapData.children)) {
          throw new Error('Invalid structure');
        }
      } catch (err) {
        console.error('❌ JSON parse failed, fallback used');
        mindMapData = {
          title: topic,
          children: [
            { title: "Key Concepts", children: [] },
            { title: "Definitions", children: [] },
            { title: "Examples", children: [] },
            { title: "Applications", children: [] },
          ]
        };
      }

      // Translate nodes if needed
      if (userLanguage !== 'en') {
        mindMapData = await translateMindMap(mindMapData, userLanguage);
      }

      return res.status(200).json({
        response: mindMapData,
        provider,
        model: provider,
        userLanguage,
      });
    }

    // REGULAR CHAT MODE
    const inputPrompt = prompt || messages?.map(m => m.content).join('\n');
    const { responseText, provider } = await tryProviders(inputPrompt);

    let finalText = responseText;
    if (userLanguage !== 'en') {
      finalText = await translateText(responseText, userLanguage, 'en');
    }

    return res.status(200).json({
      response: finalText,
      provider,
      model: provider,
      userLanguage,
    });
  } catch (error) {
    console.error('=== UNIFIED AI API ERROR ===', error);
    return res.status(500).json({ error: 'AI processing failed', details: error.message });
  }
}

/**
 * Recursively translate mind map node titles
 */
async function translateMindMap(mindMapData, targetLanguage) {
  const translatedData = { ...mindMapData };
  if (translatedData.title) {
    translatedData.title = await translateText(translatedData.title, targetLanguage, 'en');
  }
  if (translatedData.children && Array.isArray(translatedData.children)) {
    translatedData.children = await Promise.all(
      translatedData.children.map(child => translateMindMap(child, targetLanguage))
    );
  }
  return translatedData;
}
