
// api/ai-unified.js
console.log('🚀 Starting Unified AI API import...');

import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('✅ Unified AI API import successful');

// Import authentication utilities
import { verifyFirebaseToken } from '../src/lib/firebase-auth-utils.js';

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
  try {
    const user = await verifyFirebaseToken(req);
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
    
    const text = response.text();
    console.log('✅ AI Response received:', text.substring(0, 100) + '...');
    console.log('=== UNIFIED AI API ROUTE SUCCESS ===');
    
    return res.status(200).json({
      response: text,
      provider: 'google',
      model: 'gemini-pro'
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
