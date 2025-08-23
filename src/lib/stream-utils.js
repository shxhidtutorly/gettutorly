// This function reads a streaming response body and pieces together the final message.
export async function streamToString(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    // Process Server-Sent Events (SSE) from the streaming API
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
    
    for (const line of lines) {
      const dataString = line.substring(6); // Remove "data: "
      if (dataString.trim() === '[DONE]') {
        break;
      }
      try {
        const parsed = JSON.parse(dataString);
        if (parsed.choices && parsed.choices[0].delta.content) {
          fullText += parsed.choices[0].delta.content;
        }
      } catch (e) {
        // Ignore parsing errors for incomplete JSON chunks
      }
    }
  }
  return fullText;
}
