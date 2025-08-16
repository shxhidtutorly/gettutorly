import { useState, useEffect, useCallback } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import i18n from '@/i18n/i18n';
import { toast } from 'sonner';

/**
 * A hook to manage and synchronize the user's language preference with Firebase.
 *
 * @returns An object containing the current language, an update function,
 * and loading states for both initial fetch and subsequent updates.
 */
export const useUserLanguage = () => {
  const { user } = useUser();
  const [language, setLanguage] = useState<string>(i18n.language || 'en');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Effect to fetch and listen for language changes from Firebase
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const languageRef = ref(database, `users/${user.uid}/preferences/language`);

    const unsubscribe = onValue(languageRef, (snapshot) => {
      const savedLanguage = snapshot.val();
      const lang = savedLanguage || 'en'; // Default to English if not set

      setLanguage(lang);
      i18n.changeLanguage(lang);
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase onValue error:", error);
      toast.error("Could not fetch language settings.");
      setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [user?.uid]);

  /**
   * Updates the user's language preference in Firebase and locally.
   * Implements an optimistic update for a snappy UI response.
   *
   * @param {string} newLanguage - The new language code (e.g., 'en', 'hi').
   */
  const updateLanguage = useCallback(async (newLanguage: string) => {
    if (!user?.uid || newLanguage === language) return;

    const oldLanguage = language;
    setIsUpdating(true);

    // Optimistic update: change language in the UI immediately
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);

    try {
      const languageRef = ref(database, `users/${user.uid}/preferences/language`);
      await set(languageRef, newLanguage);
      toast.success('Language updated successfully!');
    } catch (error) {
      console.error('Failed to update language:', error);
      toast.error('Failed to save language. Reverting changes.');

      // Revert on failure
      setLanguage(oldLanguage);
      i18n.changeLanguage(oldLanguage);
    } finally {
      setIsUpdating(false);
    }
  }, [user?.uid, language]);

  return {
    language,
    updateLanguage,
    isLoading, // For the initial language fetch
    isUpdating, // For when the language is being saved
  };
};
