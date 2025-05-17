
export async function fetchAIResponse(prompt: string): Promise<string> {
  const providers = [
    { name: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", key: import.meta.env.VITE_OPENROUTER_API_KEY },
    { name: "Groq", url: "https://api.groq.com/openai/v1/chat/completions", key: import.meta.env.VITE_GROQ_API_KEY },
    { name: "Together", url: "https://api.together.xyz/v1/chat/completions", key: import.meta.env.VITE_TOGETHER_API_KEY },
    { name: "Claude", url: "https://api.anthropic.com/v1/messages", key: import.meta.env.VITE_CLAUDE_API_KEY },
    { name: "HuggingFace", url: "https://api-inference.huggingface.co/models/tiiuae/falcon-7b", key: import.meta.env.VITE_HUGGINGFACE_API_KEY }
  ];

  // Filter out providers without API keys
  const availableProviders = providers.filter(provider => provider.key);
  
  if (availableProviders.length === 0) {
    console.error("No API keys found. Please configure at least one AI provider API key.");
    return generateFallbackResponse(prompt);
  }

  // Track failed providers for better error reporting
  const failedProviders = [];
  const maxRetries = 2;

  for (const provider of availableProviders) {
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`Trying ${provider.name} for generating summary (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        
        // For summarization, we need more tokens - increased for better summaries
        const maxTokens = prompt.length > 5000 ? 2000 : 1000; 
        
        const res = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.key}`,
            ...(provider.name === "Claude" && { "x-api-key": provider.key }),
            ...(provider.name === "Claude" && { "anthropic-version": "2023-06-01" }),
          },
          body: JSON.stringify(
            provider.name === "Claude" 
              ? {
                  model: "claude-3-opus-20240229",
                  messages: [{ role: "user", content: prompt }],
                  max_tokens: maxTokens,
                }
              : {
                  model: provider.name === "OpenRouter" ? "openai/gpt-3.5-turbo" : "gpt-3.5-turbo",
                  messages: [{ role: "user", content: prompt }],
                  max_tokens: maxTokens,
                }
          ),
        });

        if (res.ok) {
          const data = await res.json();
          const text =
            provider.name === "Claude"
              ? data?.content?.[0]?.text || "No response"
              : data?.choices?.[0]?.message?.content || "No response";
          
          if (text === "No response" || text.length < 50) {
            console.warn(`${provider.name} returned an empty or very short response.`);
            failedProviders.push(`${provider.name} (empty response)`);
            retryCount++;
            continue;  // Retry with the same provider
          }
          
          console.log(`${provider.name} successfully generated a response of length: ${text.length}`);
          // Return with "Tutor AI" branding instead of provider name
          return `Tutor AI: ${text}`;
        } else {
          const errorText = await res.text();
          console.error(`${provider.name} API error (${res.status}):`, errorText);
          failedProviders.push(`${provider.name} (HTTP ${res.status})`);
          retryCount++;
        }
      } catch (e) {
        console.error(`${provider.name} failed: ${(e as Error).message}.`);
        failedProviders.push(`${provider.name} (${(e as Error).message})`);
        retryCount++;
      }
      
      if (retryCount <= maxRetries) {
        console.log(`Retrying ${provider.name}...`);
        // Small delay before retry to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`All retry attempts failed for ${provider.name}, trying next provider...`);
  }

  // All providers failed, use fallback
  console.error("All AI providers failed:", failedProviders.join(", "));
  return generateFallbackResponse(prompt);
}

// Generate a fallback response when all AI providers fail
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
