export async function fetchAIResponse(prompt: string): Promise<string> {
  console.log('=== CLIENT REQUEST START ===');
  console.log('Sending request with prompt:', prompt.substring(0, 50) + '...');
  
  // Use Supabase Edge Function URL
  // Note: Replace 'your-project-ref' with your actual Supabase project reference
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : 'your-project-ref';
  const apiUrl = `https://${projectRef}.functions.supabase.co/fetch-ai-response`;
  
  console.log('API URL:', apiUrl);
  
  try {
    const requestBody = { prompt };
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      
      if (!data.result) {
        console.error('Response missing result field:', data);
        console.log('Using fallback response due to missing result field');
        return generateFallbackResponse(prompt);
      }
      
      console.log('Successfully got AI response from Supabase Edge Function');
      console.log('=== CLIENT REQUEST SUCCESS ===');
      return data.result;
      
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
    if (process.env.NODE_ENV === 'development') {
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
    return "Tutor AI: Hello! I'm your AI study assistant. I'm currently having some connectivity issues, but I'm here to help you with your studies. You can ask me questions about your study materials, request summaries, or get help with explanations.";
  } else if (isForSummary) {
    return "Tutor AI: I couldn't connect to our AI providers at the moment. Here's a general summary: This content covers key academic concepts that are important for understanding the subject matter. The material introduces fundamental principles and provides examples of their application in real-world contexts.";
  } else if (isForExplanation) {
    return "Tutor AI: I'm having trouble connecting to our AI providers right now. This concept typically involves understanding the relationship between different elements and how they interact with each other. Try breaking it down into smaller parts and addressing each component individually.";
  } else if (isForQuestion) {
    return "Tutor AI: I couldn't reach our AI providers to answer your specific question. This topic relates to important principles in this field of study. Consider reviewing your course materials or textbook for more detailed information.";
  } else {
    return "Tutor AI: I'm currently unable to connect to our AI servers. Please try again later or browse our pre-made study materials in the meantime. We apologize for the inconvenience.";
  }
}
