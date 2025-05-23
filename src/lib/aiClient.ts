
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
    
    // If the response is not OK, log the error and throw
    if (!response.ok) {
      console.error(`API error (${response.status}):`, responseText);
      throw new Error(`API error (${response.status}): ${responseText}`);
    }
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse API response as JSON:', responseText);
      throw new Error('Invalid JSON response from API');
    }
    
    if (!data.result) {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid response from AI service');
    }
    
    return data.result;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    // Use the fallback response in case of any errors
    return generateFallbackResponse(prompt);
  }
}

// Generate a fallback response when API call fails
function generateFallbackResponse(prompt: string): string {
  // Extract potential keywords to customize the response
  const isForSummary = prompt.toLowerCase().includes("summarize") || prompt.toLowerCase().includes("summary");
  const isForExplanation = prompt.toLowerCase().includes("explain") || prompt.toLowerCase().includes("how does");
  const isForQuestion = prompt.toLowerCase().includes("?") || prompt.toLowerCase().includes("what is");

  if (isForSummary) {
    return "Tutor AI: I couldn't connect to our AI providers at the moment. Here's a general summary: This content covers key academic concepts that are important for understanding the subject matter. The material introduces fundamental principles and provides examples of their application in real-world contexts.";
  } else if (isForExplanation) {
    return "Tutor AI: I'm having trouble connecting to our AI providers right now. This concept typically involves understanding the relationship between different elements and how they interact with each other. Try breaking it down into smaller parts and addressing each component individually.";
  } else if (isForQuestion) {
    return "Tutor AI: I couldn't reach our AI providers to answer your specific question. This topic relates to important principles in this field of study. Consider reviewing your course materials or textbook for more detailed information.";
  } else {
    return "Tutor AI: I'm currently unable to connect to our AI servers. Please try again later or browse our pre-made study materials in the meantime. We apologize for the inconvenience.";
  }
}
