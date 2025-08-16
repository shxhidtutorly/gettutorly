import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { translationService } from '@/services/translationService';

interface TranslationToolbarProps {
  originalText: string;
  onTranslatedText: (text: string, metadata?: { modelUsed: string; cached: boolean }) => void;
  currentLanguage?: string;
  showOriginal?: boolean;
  onToggleOriginal?: (show: boolean) => void;
  autoTranslate?: boolean;
  onAutoTranslateChange?: (enabled: boolean) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

export const TranslationToolbar: React.FC<TranslationToolbarProps> = ({
  originalText,
  onTranslatedText,
  currentLanguage = 'en',
  showOriginal = false,
  onToggleOriginal,
  autoTranslate = false,
  onAutoTranslateChange
}) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{
    text: string;
    language: string;
    modelUsed: string;
    cached: boolean;
  } | null>(null);

  const handleTranslate = async () => {
    if (!originalText.trim() || selectedLanguage === 'en') {
      return;
    }

    setIsTranslating(true);
    
    try {
      const result = await translationService.translate({
        text: originalText,
        targetLang: selectedLanguage,
        sourceLang: 'en'
      });

      setLastTranslation({
        text: result.translatedText,
        language: selectedLanguage,
        modelUsed: result.modelUsed,
        cached: result.cached
      });

      onTranslatedText(result.translatedText, {
        modelUsed: result.modelUsed,
        cached: result.cached
      });
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getCurrentLanguageName = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'Unknown';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Globe className="w-4 h-4" />
        {t('aiNotes.translation.translateNow')}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            {t('settings.language')}:
          </label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-32 h-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-50">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto Translate Toggle */}
        {onAutoTranslateChange && (
          <div className="flex items-center gap-2">
            <Switch
              checked={autoTranslate}
              onCheckedChange={onAutoTranslateChange}
              className="data-[state=checked]:bg-blue-600"
            />
            <label className="text-sm text-gray-600 dark:text-gray-400">
              {t('aiNotes.translation.autoTranslate')}
            </label>
          </div>
        )}

        {/* Translate Button */}
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || selectedLanguage === 'en' || !originalText.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isTranslating ? (
            <>
              <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
              {t('aiNotes.translating')}
            </>
          ) : (
            t('aiNotes.translation.translateNow')
          )}
        </Button>

        {/* Show/Hide Original Toggle */}
        {onToggleOriginal && lastTranslation && (
          <Button
            onClick={() => onToggleOriginal(!showOriginal)}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-gray-600"
          >
            {showOriginal ? (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                {t('aiNotes.translation.showTranslated')}
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                {t('aiNotes.translation.showOriginal')}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Translation Metadata */}
      {lastTranslation && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Translated to {getCurrentLanguageName()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            model: {lastTranslation.modelUsed}
          </Badge>
          {lastTranslation.cached && (
            <Badge variant="outline" className="text-xs text-green-600">
              cached
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};