export async function fetchAIResponse(prompt: string): Promise<string> {
  console.log('=== CLIENT REQUEST START ===');
  console.log('Sending request with prompt:', prompt.substring(0, 50) + '...');
  
  try {
    const requestBody = { prompt };
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch('/api/fetch-ai-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response text first
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    if (!response.ok) {
      console.error(`API responded with status ${response.status}`);
      console.error('Error response text:', responseText);
      
      // Try to parse error as JSON
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error data:', errorData);
        throw new Error(`API Error (${response.status}): ${errorData.message || errorData.error || 'Unknown error'}`);
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
        throw new Error(`API Error (${response.status}): ${responseText || 'No error message'}`);
      }
    }
    
    // Try to parse successful response
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      if (!data.result) {
        console.error('Response missing result field:', data);
        throw new Error('Invalid response format - missing result field');
      }
      
      console.log('Successfully got AI response');
      return data.result;
      
    } catch (parseError) {
      console.error('Failed to parse successful response as JSON:', responseText);
      throw new Error('Invalid JSON response from API');
    }
    
  } catch (error) {
    console.error('=== CLIENT REQUEST ERROR ===');
    console.error('Error:', error);
    
    // Don't use fallback immediately - let the error bubble up for debugging
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while fetching AI response');
    }
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
