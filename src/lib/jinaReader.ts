
export interface JinaReaderResponse {
  success: boolean;
  title?: string;
  content?: string;
  description?: string;
  url?: string;
  error?: string;
}

export const extractTextFromUrl = async (url: string): Promise<JinaReaderResponse> => {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TutorlyBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }

    const text = await response.text();
    
    // Parse the response to extract title and content
    const lines = text.split('\n');
    let title = '';
    let content = '';
    
    // Look for title in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !title) {
        title = line;
        break;
      }
    }
    
    // The rest is content
    content = lines.slice(1).join('\n').trim();

    return {
      success: true,
      title: title || 'Extracted Content',
      content: content,
      description: content.substring(0, 200) + '...',
      url: url
    };
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const extractTextFromPDF = async (file: File): Promise<JinaReaderResponse> => {
  try {
    // This would require PDF.js or similar library
    // For now, return a placeholder response
    return {
      success: false,
      error: 'PDF text extraction not implemented yet'
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
