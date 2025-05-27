
export async function fetchAIResponse(prompt: string): Promise<string> {
  console.log('=== CLIENT REQUEST START ===');
  console.log('Sending request with prompt:', prompt.substring(0, 50) + '...');
  
  // Use your specific Supabase Edge Function URL
  const apiUrl = `https://dllyfsbuxrjyiatfcegk.functions.supabase.co/fetch-ai-response`;
  
  // Get the anon key from environment variables (supporting both Vite and Next.js patterns)
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHlmc2J1eHJqeWlhdGZjZWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDUxNzAsImV4cCI6MjA2MzAyMTE3MH0.1jfGciFNtGgfw7bNZhuraoA_83whPx6Ojl0J5iHfJz0';
  
  console.log('API URL:', apiUrl);
  console.log('Using anon key:', supabaseAnonKey ? 'Present' : 'Missing');
  
  try {
    const requestBody = { prompt };
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response text first
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    // Handle specific HTTP status codes
    if (response.status === 405) {
      console.error('405 Method Not Allowed - Supabase Edge Function configuration issue');
      console.log('Using fallback response due to 405 error');
      return generateFallbackResponse(prompt);
    }
    
    if (response.status === 404) {
      console.error('404 Not Found - Supabase Edge Function does not exist or is not deployed');
      console.log('Using fallback response due to 404 error');
      return generateFallbackResponse(prompt);
    }
    
    if (!response.ok) {
      console.error(`Supabase Edge Function responded with status ${response.status}`);
      console.error('Error response text:', responseText);
      
      // Try to parse error as JSON
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error data:', errorData);
        throw new Error(`Supabase Error (${response.status}): ${errorData.message || errorData.error || 'Unknown error'}`);
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
        
        // For non-critical errors, use fallback instead of throwing
        if (response.status >= 500) {
          console.log('Server error detected, using fallback response');
          return generateFallbackResponse(prompt);
        }
        
        throw new Error(`Supabase Error (${response.status}): ${responseText || 'No error message'}`);
      }
    }
    
    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      console.error('Received empty response from Supabase Edge Function');
      console.log('Using fallback response due to empty response');
      return generateFallbackResponse(prompt);
    }
    
    // Try to parse successful response
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      // Handle both response formats: { "message": "..." } and { "result": "..." }
      const message = data.message || data.result;
      
      if (!message) {
        console.error('Response missing message/result field:', data);
        console.log('Using fallback response due to missing message field');
        return generateFallbackResponse(prompt);
      }
      
      console.log('Successfully got AI response from Supabase Edge Function');
      console.log('=== CLIENT REQUEST SUCCESS ===');
      return message;
      
    } catch (parseError) {
      console.error('Failed to parse successful response as JSON:', responseText);
      console.error('Parse error:', parseError);
      console.log('Using fallback response due to JSON parse error');
      return generateFallbackResponse(prompt);
    }
    
  } catch (error) {
    console.error('=== CLIENT REQUEST ERROR ===');
    console.error('Error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error detected - could be CORS, network connectivity, or Supabase Edge Function not deployed');
      console.log('Using fallback response due to network error');
      return generateFallbackResponse(prompt);
    }
    
    // For development debugging
    if (import.meta.env.DEV) {
      console.error('Development mode - additional debugging info:');
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    }
    
    // Use fallback for most errors instead of throwing
    console.log('Using fallback response due to unexpected error');
    return generateFallbackResponse(prompt);
  }
}

// Generate a fallback response when API call fails
function generateFallbackResponse(prompt: string): string {
  console.log('Generating fallback response for prompt:', prompt.substring(0, 50) + '...');
  
  // Extract potential keywords to customize the response
  const lowerPrompt = prompt.toLowerCase();
  const isGreeting = lowerPrompt.includes("hi") || lowerPrompt.includes("hello") || lowerPrompt.includes("hey");
  const isForSummary = lowerPrompt.includes("summarize") || lowerPrompt.includes("summary");
  const isForExplanation = lowerPrompt.includes("explain") || lowerPrompt.includes("how does");
  const isForQuestion = lowerPrompt.includes("?") || lowerPrompt.includes("what is");

  if (isGreeting) {
    return "Hello! I'm your AI assistant. I'm currently having some connectivity issues, but I'm here to help you with your questions.";
  } else if (isForSummary) {
    return "I couldn't connect to the AI service at the moment. Here's a general summary: This content covers key concepts that are important for understanding the subject matter.";
  } else if (isForExplanation) {
    return "I'm having trouble connecting to the AI service right now. This concept typically involves understanding the relationship between different elements and how they interact with each other.";
  } else if (isForQuestion) {
    return "I couldn't reach the AI service to answer your specific question. This topic relates to important principles in this field of study.";
  } else {
    return `Hello ${prompt}!`;
  }
}
