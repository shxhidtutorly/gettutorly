// api/chat-notes.js - Chat with notes using OpenRouter
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
  console.log('=== CHAT NOTES API ROUTE START ===');
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    user = decodedToken;
    console.log('✅ Authenticated user:', user.uid);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
  
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { message, notes } = req.body;
    
    if (!message) {
      console.log('❌ No message provided');
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }
    
    // Get user language preference
    const userLanguage = await getUserLanguage(user.uid);
    console.log('🌍 User language preference:', userLanguage);
    
    // Create context-aware prompt
    const systemPrompt = `You are an AI tutor helping students understand their notes. 
Always respond in a helpful, educational manner. 
If the user's preferred language is not English, respond in their preferred language: ${userLanguage === 'en' ? 'English' : userLanguage.toUpperCase()}.`;
    
    const userPrompt = `Notes: ${notes || 'No specific notes provided'}

User Question: ${message}

Please provide a helpful response based on the notes and the user's question.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];
    
    console.log('🤖 Calling OpenRouter API...');
    
    // Call OpenRouter API - using the correct environment variable name
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gettutorly.com',
        'X-Title': 'Tutorly Chat'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    console.log('📡 OpenRouter Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter Error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenRouter Response received');
    
    const originalResponse = data.choices?.[0]?.message?.content;
    
    if (!originalResponse) {
      throw new Error('No response from AI');
    }
    
    // Translate response if user language is not English and AI didn't respond in the target language
    let finalResponse = originalResponse;
    let wasTranslated = false;
    
    if (userLanguage !== 'en') {
      console.log('🌐 Translating response to:', userLanguage);
      try {
        finalResponse = await translateText(originalResponse, userLanguage, 'en');
        wasTranslated = true;
        console.log('✅ Translation completed');
      } catch (error) {
        console.error('❌ Translation failed:', error);
        // Keep original response if translation fails
        finalResponse = originalResponse;
      }
    }
    
    console.log('🎉 Successfully got AI response');
    console.log('=== CHAT NOTES API SUCCESS ===');
    
    return res.status(200).json({
      response: finalResponse,
      originalResponse: originalResponse,
      model: 'deepseek-r1-distill-qwen',
      userLanguage,
      wasTranslated,
      translationInfo: wasTranslated ? {
        targetLanguage: userLanguage,
        sourceLanguage: 'en'
      } : null
    });
    
  } catch (error) {
    console.error('=== CHAT NOTES API ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
