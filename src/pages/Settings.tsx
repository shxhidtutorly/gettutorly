import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Crown,
  Calendar,
  CreditCard,
  Settings as SettingsIcon,
  User,
  LogOut,
  Globe,
  Languages,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Comprehensive list of supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese Simplified', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
   { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' }
];

const SettingsPage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useFirebaseAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, updateLanguage, isLoading: languageLoading, isUpdating: languageUpdating } = useUserLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLanguageChange = (newLanguage: string) => {
    updateLanguage(newLanguage);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trialing': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];
  };

  if (subscriptionLoading || !isLoaded || languageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              {t('settings.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Language & Translation Settings */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('settings.language')} & Translation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                  {t('settings.languageDescription')}
                </label>
                <Select
                  value={language}
                  onValueChange={handleLanguageChange}
                  disabled={languageLoading || languageUpdating}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50 max-h-60">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.code}
                        value={lang.code}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFlagEmoji(lang.code)}</span>
                            <div>
                              <div className="font-medium">{lang.name}</div>
                              <div className="text-sm text-gray-500">{lang.nativeName}</div>
                            </div>
                          </div>
                          {language === lang.code && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Language Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFlagEmoji(language)}</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getCurrentLanguageInfo().name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getCurrentLanguageInfo().nativeName}
                    </p>
                  </div>
                  {languageUpdating && (
                    <div className="ml-auto">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Translation Features Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Translation Features
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• AI responses are automatically translated to your preferred language</li>
                  <li>• Upload materials in any language - summaries are generated in English then translated</li>
                  <li>• Quiz questions and flashcards are translated to your language</li>
                  <li>• Interface text is fully localized</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('settings.profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-lg text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          {subscription && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</span>
                  <span className="text-gray-900 dark:text-white">{subscription.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Billing</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(subscription.nextBillingDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

// Helper function to get flag emoji for language codes
function getFlagEmoji(languageCode: string): string {
  const flagMap: { [key: string]: string } = {
    'en': '🇺🇸',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'pt': '🇵🇹',
    'it': '🇮🇹',
    'ru': '🇷🇺',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'ar': '🇸🇦',
    'tr': '🇹🇷',
    'nl': '🇳🇱',
    'pl': '🇵🇱',
    'sv': '🇸🇪',
    'da': '🇩🇰',
    'no': '🇳🇴',
    'fi': '🇫🇮'
    'hi': '🇮🇳',
    'kn': '🇮🇳',
  };
  
  return flagMap[languageCode] || '🌐';
}

export default SettingsPage;
