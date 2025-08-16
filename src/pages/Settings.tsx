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
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Moved outside the component to prevent re-declaration on every render
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
  { code: 'zh', name: 'Chinese Simplified' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

const SettingsPage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useFirebaseAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Use the improved hook with distinct loading states
  const { language, updateLanguage, isLoading: languageLoading, isUpdating: languageUpdating } = useUserLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // The update logic is now handled inside the hook, so this is just a wrapper.
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

  if (subscriptionLoading || !isLoaded || languageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <Navbar />

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
            <CardContent>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                {t('settings.languageDescription')}
              </label>
              <Select
                value={language}
                onValueChange={handleLanguageChange}
                // Disable while initially loading OR while an update is in progress
                disabled={languageLoading || languageUpdating}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.code}
                      value={lang.code}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Subscription Details (Code unchanged) */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            {/* ... Your existing subscription card content ... */}
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
