import { userPreferencesService } from './firebase-user-preferences';

export interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
  contextType?: 'chat' | 'summary' | 'notes' | 'quiz' | 'general';
}

export interface TranslationResponse {
  translatedText: string;
  cached: boolean;
  modelUsed: string;
}

export class AITranslationService {
  private static instance: AITranslationService;
  private sessionCache = new Map<string, TranslationResponse>();

  static getInstance(): AITranslationService {
    if (!AITranslationService.instance) {
      AITranslationService.instance = new AITranslationService();
    }
    return AITranslationService.instance;
  }

  /**
   * Generate cache key for translation requests
   */
  private generateCacheKey(text: string, targetLang: string): string {
    const hash = this.simpleHash(text + targetLang);
    return `${hash}_${targetLang}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Translate text using the translation API
   */
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

  /**
   * Automatically translate AI-generated content based on user preferences
   */
  async translateAIContent(
    content: string, 
    userId: string, 
    contentType: 'chat' | 'summary' | 'notes' | 'quiz' = 'general'
  ): Promise<string> {
    try {
      // Get user preferences
      const preferences = await userPreferencesService.getUserPreferences(userId);
      const userLanguage = preferences?.language || 'en';

      // If user language is English, return original content
      if (userLanguage === 'en') {
        return content;
      }

      // Check if auto-translate is enabled
      const autoTranslate = preferences?.aiSettings?.autoTranslate ?? true;
      if (!autoTranslate) {
        return content;
      }

      // Translate the content
      const translation = await this.translate({
        text: content,
        targetLang: userLanguage,
        sourceLang: 'en',
        contextType: contentType
      });

      return translation.translatedText;
    } catch (error) {
      console.error('Error translating AI content:', error);
      // Return original content on error
      return content;
    }
  }

  /**
   * Translate AI response with user context
   */
  async translateAIResponse(
    aiResponse: string,
    userId: string,
    context: {
      type: 'chat' | 'summary' | 'notes' | 'quiz';
      originalLanguage?: string;
    }
  ): Promise<{
    originalText: string;
    translatedText: string;
    userLanguage: string;
    wasTranslated: boolean;
  }> {
    try {
      const preferences = await userPreferencesService.getUserPreferences(userId);
      const userLanguage = preferences?.language || 'en';

      // If user language is English, return original
      if (userLanguage === 'en') {
        return {
          originalText: aiResponse,
          translatedText: aiResponse,
          userLanguage: 'en',
          wasTranslated: false
        };
      }

      // Check if auto-translate is enabled
      const autoTranslate = preferences?.aiSettings?.autoTranslate ?? true;
      if (!autoTranslate) {
        return {
          originalText: aiResponse,
          translatedText: aiResponse,
          userLanguage,
          wasTranslated: false
        };
      }

      // Translate the response
      const translation = await this.translate({
        text: aiResponse,
        targetLang: userLanguage,
        sourceLang: context.originalLanguage || 'en',
        contextType: context.type
      });

      return {
        originalText: aiResponse,
        translatedText: translation.translatedText,
        userLanguage,
        wasTranslated: true
      };
    } catch (error) {
      console.error('Error translating AI response:', error);
      return {
        originalText: aiResponse,
        translatedText: aiResponse,
        userLanguage: 'en',
        wasTranslated: false
      };
    }
  }

  /**
   * Clear session cache
   */
  clearCache(): void {
    this.sessionCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number } {
    return {
      size: this.sessionCache.size
    };
  }
}

export const aiTranslationService = AITranslationService.getInstance();
