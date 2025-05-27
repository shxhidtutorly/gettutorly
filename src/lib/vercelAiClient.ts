
// Client-side function to call the Vercel API route
export async function callVercelAI(
  prompt: string, 
  model: 'gemini' | 'groq' | 'claude' | 'openrouter' | 'huggingface' | 'together' = 'gemini'
): Promise<string> {
  console.log('=== VERCEL AI CLIENT REQUEST START ===');
  console.log('Sending request with prompt:', prompt.substring(0, 50) + '...');
  console.log('Using model:', model);
  console.log('API URL:', '/api/ai');
  
  try {
    console.log('🚀 Making fetch request...');
    
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model
      }),
    });
    
    console.log('📡 Response received');
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Response data:', data);
    
    // Handle the new response format where the message is in 'response' field
    if (!data.response) {
      throw new Error('No response in API response');
    }
    
    console.log('🎉 Successfully got AI response from Vercel API');
    console.log('=== VERCEL AI CLIENT REQUEST SUCCESS ===');
    
    return data.response;
    
  } catch (error) {
    console.error('=== VERCEL AI CLIENT REQUEST ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    throw error;
  }
}

// Test function to verify API connectivity
export async function testVercelAPI(): Promise<boolean> {
  try {
    console.log('🧪 Testing API connectivity...');
    
    const response = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'connectivity' })
    });
    
    const data = await response.json();
    console.log('✅ Test API response:', data);
    return response.ok;
    
  } catch (error) {
    console.error('❌ Test API failed:', error);
    return false;
  }
}
