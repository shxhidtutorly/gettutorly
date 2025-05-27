
// Client-side function to call the Vercel API route
export async function callVercelAI(
  prompt: string, 
  model: 'gemini' | 'groq' | 'claude' | 'openrouter' | 'huggingface' | 'together' = 'gemini'
): Promise<string> {
  console.log('=== VERCEL AI CLIENT REQUEST START ===');
  console.log('Sending request with prompt:', prompt.substring(0, 50) + '...');
  console.log('Using model:', model);
  
  try {
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
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!data.message) {
      throw new Error('No message in API response');
    }
    
    console.log('Successfully got AI response from Vercel API');
    console.log('=== VERCEL AI CLIENT REQUEST SUCCESS ===');
    
    return data.message;
    
  } catch (error) {
    console.error('=== VERCEL AI CLIENT REQUEST ERROR ===');
    console.error('Error:', error);
    throw error;
  }
}
