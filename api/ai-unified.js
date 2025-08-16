
// api/ai-unified.js
console.log('🚀 Starting Unified AI API import...');

import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/translate`, {
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

export default async function handler(req, res) {
  console.log('=== UNIFIED AI API ROUTE START ===');
  console.log('Method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  let user;
  try {
    user = await verifyFirebaseToken(req);
    if (!user) {
      console.log('❌ Authentication failed');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }
    console.log('✅ Authenticated user:', user.uid);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
  
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { messages, model = 'gemini', prompt } = req.body;
    
    // Validate required fields - support both message array format and single prompt format
    if (!messages && !prompt) {
      console.log('❌ No messages or prompt provided');
      return res.status(400).json({ 
        error: 'Either messages array or prompt string is required' 
      });
    }
    
    if (model && !['gemini', 'groq', 'claude', 'openrouter', 'huggingface', 'together'].includes(model)) {
      console.log('❌ Invalid model:', model);
      return res.status(400).json({ 
        error: 'Invalid model. Supported models: gemini, groq, claude, openrouter, huggingface, together' 
      });
    }
    
    console.log('✅ Valid request - Model:', model);
    
    // Get user language preference
    const userLanguage = await getUserLanguage(user.uid);
    console.log('🌍 User language preference:', userLanguage);
    
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const genModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let response;
    
    if (messages) {
      // Chat format with message history
      console.log('🔄 Processing messages array format...');
      
      // Convert messages to Gemini format
      const formattedMessages = messages.map(msg => {
        if (msg.role === 'system') {
          // System messages are converted to user messages with context
          return {
            role: 'user',
            parts: [{ text: `[SYSTEM CONTEXT]: ${msg.content}` }]
          };
        }
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        };
      });
      
      // Create chat session
      const chat = genModel.startChat({
        history: formattedMessages.slice(0, -1), // All except the last message
      });
      
      // Send the last message
      const lastMessage = formattedMessages[formattedMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      response = await result.response;
      
    } else {
      // Single prompt format (backward compatibility)
      console.log('🔄 Processing single prompt format...');
      const result = await genModel.generateContent(prompt);
      response = await result.response;
    }
    
    const originalText = response.text();
    console.log('✅ AI Response received:', originalText.substring(0, 100) + '...');
    
    // Translate response if user language is not English
    let finalText = originalText;
    let wasTranslated = false;
    
    if (userLanguage !== 'en') {
      console.log('🌐 Translating response to:', userLanguage);
      try {
        finalText = await translateText(originalText, userLanguage, 'en');
        wasTranslated = true;
        console.log('✅ Translation completed');
      } catch (error) {
        console.error('❌ Translation failed:', error);
        // Keep original text if translation fails
        finalText = originalText;
      }
    }
    
    console.log('=== UNIFIED AI API ROUTE SUCCESS ===');
    
    return res.status(200).json({
      response: finalText,
      originalResponse: originalText,
      provider: 'google',
      model: 'gemini-pro',
      userLanguage,
      wasTranslated,
      translationInfo: wasTranslated ? {
        targetLanguage: userLanguage,
        sourceLanguage: 'en'
      } : null
    });
    
  } catch (error) {
    console.error('=== UNIFIED AI API ROUTE ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.log('❌ Rate limit error');
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message,
        });
      }

      if (error.message.includes('unauthorized') || error.message.includes('invalid key')) {
        console.log('❌ Auth error');
        return res.status(401).json({
          error: 'Authentication failed. Please check API keys.',
          details: error.message,
        });
      }
    }

    console.log('❌ General error');
    return res.status(500).json({
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
