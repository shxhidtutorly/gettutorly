
console.log('🚀 Starting Chat Notes API...');

export default async function handler(req, res) {
  console.log('=== CHAT NOTES API ROUTE START ===');
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
    
    const { message, noteContent, chatHistory = [] } = req.body;
    
    // Validate required fields
    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message:', message);
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }
    
    if (!noteContent || typeof noteContent !== 'string') {
      console.log('❌ Invalid note content:', noteContent);
      return res.status(400).json({ 
        error: 'Note content is required and must be a string' 
      });
    }
    
    console.log('✅ Valid request - Message:', message.substring(0, 50) + '...');
    
    // Prepare messages for OpenRouter API
    const messages = [
      {
        role: 'system',
        content: `You are an AI tutor. Only answer based on the following notes: ${noteContent}. Don't add unrelated information. Be clear and helpful. Do not use markdown formatting like ## or ** or *. Provide clean, readable text with proper spacing and structure.`
      },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.message
      })),
      {
        role: 'user',
        content: message
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
    
    const aiMessage = data.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
      throw new Error('No response from AI');
    }
    
    console.log('🎉 Successfully got AI response');
    console.log('=== CHAT NOTES API SUCCESS ===');
    
    return res.status(200).json({
      response: aiMessage,
      model: 'deepseek-r1-distill-qwen'
    });
    
  } catch (error) {
    console.error('=== CHAT NOTES API ERROR ===');
    console.error('Error details:', error);
    
    // Handle specific error types
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        details: error.message 
      });
    }
    
    if (error.message?.includes('unauthorized') || error.message?.includes('invalid key')) {
      return res.status(401).json({ 
        error: 'Authentication failed. Please check API keys.',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
