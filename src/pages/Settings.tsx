import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Using for basic button structure
import { useUser } from "@/hooks/useUser";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Crown,
  Settings as SettingsIcon,
  User,
  LogOut,
  Globe,
  Languages,
  CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// This list remains the same
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    // ... other languages
];

// Helper to get flag emoji remains the same
function getFlagEmoji(languageCode: string): string {
  // ... implementation
  const flagMap: { [key: string]: string } = { 'en': '🇺🇸', 'es': '🇪🇸', /* ... */ };
  return flagMap[languageCode] || '🌐';
}

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
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];
  };

  // Consistent Loading screen with Dashboard
  if (subscriptionLoading || !isLoaded || languageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-100 font-mono">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg font-black tracking-wider">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  // Matching Dashboard styles
  const themeClasses = theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-100';
  const panelClasses = theme === 'light' ? 'bg-white text-black border-black' : 'bg-zinc-800 text-white border-zinc-300';
  const mutedTextClasses = theme === 'light' ? 'text-stone-600' : 'text-zinc-400';

  return (
    <div className={`min-h-screen flex flex-col font-mono ${themeClasses}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              {t('settings.title')}
            </h1>
            <p className={`text-lg ${mutedTextClasses}`}>
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Language Settings Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`p-6 border-4 ${panelClasses}`}
            style={{ boxShadow: `6px 6px 0px #00e6c4` }}
          >
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              {t('settings.languageAndTranslation')}
            </h2>
            <div className="space-y-6">
              <div>
                <label className={`text-sm font-bold block mb-2 ${mutedTextClasses}`}>
                  {t('settings.languageDescription')}
                </label>
                <Select
                  value={language}
                  onValueChange={handleLanguageChange}
                  disabled={languageLoading || languageUpdating}
                >
                  <SelectTrigger 
                    className={`w-full p-3 border-4 border-black font-bold text-base transition-all ${theme === 'light' ? 'bg-white' : 'bg-zinc-900'}`}
                    style={{ boxShadow: '3px 3px 0px #000' }}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className={`border-4 border-black font-mono ${theme === 'light' ? 'bg-white' : 'bg-zinc-800'}`}>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                         <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-3">
                             <span className="text-xl">{getFlagEmoji(lang.code)}</span>
                             <div>
                               <div className="font-bold">{lang.name}</div>
                               <div className="text-sm">{lang.nativeName}</div>
                             </div>
                           </div>
                           {language === lang.code && <CheckCircle className="w-5 h-5 text-cyan-400" />}
                         </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={`p-4 ${theme === 'light' ? 'bg-stone-50' : 'bg-zinc-700'}`}>
                  {/* Current Language Info */}
              </div>
            </div>
          </motion.div>

          {/* User Profile Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`p-6 border-4 ${panelClasses}`}
            style={{ boxShadow: `6px 6px 0px #ff5a8f` }}
          >
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <User className="w-6 h-6" />
              {t('settings.profile')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-bold ${mutedTextClasses}`}>{t('settings.emailLabel')}</label>
                <p className="text-lg font-bold">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="px-6 py-3 border-4 border-black bg-transparent font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-red-400 flex items-center gap-2"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </Button>
            </div>
          </motion.div>
          
          {/* Subscription Panel */}
          {subscription && (
             <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.3 }}
             className={`p-6 border-4 ${panelClasses}`}
             style={{ boxShadow: `6px 6px 0px #00e6c4` }}
           >
             <h2 className="text-xl font-black mb-4 flex items-center gap-2">
               <Crown className="w-6 h-6" />
               {t('settings.subscriptionDetails')}
             </h2>
             <div className="space-y-3 font-bold">
                <div className="flex items-center justify-between">
                    <span className={mutedTextClasses}>{t('settings.status')}</span>
                    <Badge variant="default" className={`font-bold ${subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {subscription.status}
                    </Badge>
                </div>
                 <div className="flex items-center justify-between">
                    <span className={mutedTextClasses}>{t('settings.plan')}</span>
                    <span>{subscription.plan}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className={mutedTextClasses}>{t('settings.nextBilling')}</span>
                    <span>{formatDate(subscription.nextBillingDate)}</span>
                 </div>
             </div>
           </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
