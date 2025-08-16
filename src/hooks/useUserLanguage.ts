import { useState, useEffect } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import i18n from '@/i18n/i18n';

export const useUserLanguage = () => {
  const { user } = useUser();
  const [language, setLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const languageRef = ref(database, `users/${user.uid}/preferences/language`);
    
    const unsubscribe = onValue(languageRef, (snapshot) => {
      const savedLanguage = snapshot.val();
      const lang = savedLanguage || 'en';
      setLanguage(lang);
      i18n.changeLanguage(lang);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const updateLanguage = async (newLanguage: string) => {
    if (!user?.uid) return;

    try {
      const languageRef = ref(database, `users/${user.uid}/preferences/language`);
      await set(languageRef, newLanguage);
      
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      
      // Dispatch global event for UI updates
      window.dispatchEvent(new CustomEvent('user-language-changed', { 
        detail: { lang: newLanguage } 
      }));
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  return {
    language,
    updateLanguage,
    loading
  };
};