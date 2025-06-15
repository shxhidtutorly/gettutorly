
console.log('🚀 Starting AI API...');

import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('✅ AI API import successful');

export default async function handler(req, res) {
  console.log('=== AI API ROUTE START ===');
  console.log('Method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { messages, model = 'gemini', prompt } = req.body;
    
    // Validate required fields
    if (!messages && !prompt) {
      console.log('❌ No messages or prompt provided');
      return res.status(400).json({ 
        error: 'Either messages array or prompt string is required' 
      });
    }
    
    console.log('✅ Valid request - Model:', model);
    
    // Initialize Google Generative AI
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ No Gemini API key found');
      return res.status(500).json({ 
        error: 'Gemini API key not configured' 
      });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const genModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let response;
    
    if (messages) {
      // Chat format with message history
      console.log('🔄 Processing messages array format...');
      
      // Convert messages to a single prompt for Gemini
      const conversationText = messages.map(msg => {
        if (msg.role === 'system') {
          return `Context: ${msg.content}`;
        }
        return `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`;
      }).join('\n\n');
      
      const result = await genModel.generateContent(conversationText);
      response = await result.response;
      
    } else {
      // Single prompt format
      console.log('🔄 Processing single prompt format...');
      const result = await genModel.generateContent(prompt);
      response = await result.response;
    }
    
    const text = response.text();
    console.log('✅ AI Response received:', text.substring(0, 100) + '...');
    console.log('=== AI API SUCCESS ===');
    
    return res.status(200).json({
      response: text,
      provider: 'google',
      model: 'gemini-pro'
    });
    
  } catch (error) {
    console.error('=== AI API ERROR ===');
    console.error('Error details:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    });
  }
}
