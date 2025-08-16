import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, RotateCcw, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserLanguage } from '@/hooks/useUserLanguage';
import { toast } from 'sonner';

interface TranslationToggleProps {
  originalText: string;
  onTranslationChange: (translatedText: string, isTranslated: boolean) => void;
  contextType?: 'chat' | 'summary' | 'notes' | 'quiz' | 'general';
  className?: string;
  showOriginalButton?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' }
];

const TranslationToggle: React.FC<TranslationToggleProps> = ({
  originalText,
  onTranslationChange,
  contextType = 'general',
  className = '',
  showOriginalButton = true
}) => {
  const { t } = useTranslation();
  const { language: userLanguage } = useUserLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState(originalText);

  // Update selected language when user language changes
  useEffect(() => {
    setSelectedLanguage(userLanguage);
  }, [userLanguage]);

  // Reset to original text when originalText changes
  useEffect(() => {
    setTranslatedText(originalText);
    setIsTranslated(false);
  }, [originalText]);

  const translateText = async (text: string, targetLang: string) => {
    if (targetLang === 'en' || !text.trim()) {
      return text;
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
          sourceLang: 'en',
          contextType
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Showing original content.');
      return text;
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    
    if (newLanguage === 'en') {
      setTranslatedText(originalText);
      setIsTranslated(false);
      onTranslationChange(originalText, false);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(originalText, newLanguage);
      setTranslatedText(translated);
      setIsTranslated(true);
      onTranslationChange(translated, true);
      toast.success(`Translated to ${SUPPORTED_LANGUAGES.find(lang => lang.code === newLanguage)?.name}`);
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const resetToOriginal = () => {
    setTranslatedText(originalText);
    setIsTranslated(false);
    setSelectedLanguage('en');
    onTranslationChange(originalText, false);
  };

  const getFlagEmoji = (languageCode: string): string => {
    const flagMap: { [key: string]: string } = {
      'en': '🇺🇸', 'hi': '🇮🇳', 'kn': '🇮🇳', 'es': '🇪🇸', 'fr': '🇫🇷',
      'de': '🇩🇪', 'pt': '🇵🇹', 'it': '🇮🇹', 'ru': '🇷🇺', 'zh': '🇨🇳',
      'ja': '🇯🇵', 'ko': '🇰🇷', 'ar': '🇸🇦', 'tr': '🇹🇷', 'nl': '🇳🇱',
      'pl': '🇵🇱', 'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴', 'fi': '🇫🇮'
    };
    return flagMap[languageCode] || '🌐';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Languages className="w-4 h-4 text-gray-500" />
        <Select
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
          disabled={isTranslating}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue>
              <div className="flex items-center gap-1">
                <span>{getFlagEmoji(selectedLanguage)}</span>
                <span>{SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'English'}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                className="flex items-center gap-2"
              >
                <span>{getFlagEmoji(lang.code)}</span>
                <div>
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-gray-500">{lang.nativeName}</div>
                </div>
                {selectedLanguage === lang.code && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isTranslating && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          Translating...
        </div>
      )}

      {isTranslated && showOriginalButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetToOriginal}
          className="h-8 px-2 text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Original
        </Button>
      )}

      {isTranslated && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          Translated
        </div>
      )}
    </div>
  );
};

export default TranslationToggle;
