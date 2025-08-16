interface TranslationResponse {
  translatedText: string;
  cached: boolean;
  modelUsed: string;
}

interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
  contextType?: string;
}

class TranslationService {
  private sessionCache = new Map<string, TranslationResponse>();

  private generateCacheKey(text: string, targetLang: string): string {
    // Simple hash function for session cache
    let hash = 0;
    const input = text + ':' + targetLang;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, targetLang, sourceLang = 'auto', contextType = 'general' } = request;
    
    // Check session cache first
    const cacheKey = this.generateCacheKey(text, targetLang);
    if (this.sessionCache.has(cacheKey)) {
      return this.sessionCache.get(cacheKey)!;
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
          sourceLang,
          contextType
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Cache the result in session
      this.sessionCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text as fallback
      return {
        translatedText: text,
        cached: false,
        modelUsed: 'none'
      };
    }
  }

  // Method to translate AI-generated content automatically
  async translateAIContent(content: string, targetLang: string, contentType: 'chat' | 'summary' | 'notes' | 'quiz' = 'general'): Promise<string> {
    if (targetLang === 'en' || !content.trim()) {
      return content;
    }

    try {
      const result = await this.translate({
        text: content,
        targetLang,
        sourceLang: 'en',
        contextType: contentType
      });
      
      return result.translatedText;
    } catch (error) {
      console.error('Failed to translate AI content:', error);
      return content; // Return original on error
    }
  }

  // Clear session cache
  clearCache(): void {
    this.sessionCache.clear();
  }
}

export const translationService = new TranslationService();