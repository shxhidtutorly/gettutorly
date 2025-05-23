
export async function fetchAIResponse(prompt: string): Promise<string> {
  try {
    console.log('Sending request to AI API with prompt:', prompt.substring(0, 50) + '...');
    
    // Make a POST request to our secure server-side API endpoint
    const response = await fetch('/api/fetch-ai-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    // Get the response as text first to help with debugging
    const responseText = await response.text();
    console.log('Raw API response:', responseText.substring(0, 200) + '...');
    
    // If the response is not OK, log the error and use fallback
    if (!response.ok) {
      console.error(`API error (${response.status}):`, responseText);
      
      // Parse error response if possible
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error data:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      
      // Use fallback instead of throwing error
      console.log('Using fallback response due to API error');
      return generateFallbackResponse(prompt);
    }
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed API response data:', data);
    } catch (e) {
      console.error('Failed to parse API response as JSON:', responseText);
      console.log('Using fallback response due to JSON parse error');
      return generateFallbackResponse(prompt);
    }
    
    if (!data.result) {
      console.error('Invalid API response format - missing result field:', data);
      console.log('Using fallback response due to missing result');
      return generateFallbackResponse(prompt);
    }
    
    console.log('Successfully got AI response');
    return data.result;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    console.log('Using fallback response due to fetch error');
    // Use the fallback response in case of any errors
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
