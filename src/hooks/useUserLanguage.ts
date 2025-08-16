import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import i18n from '@/i18n/i18n';
import { toast } from 'sonner';
import { userPreferencesService } from '@/lib/firebase-user-preferences';

/**
 * A hook to manage and synchronize the user's language preference with Firebase Firestore.
 *
 * @returns An object containing the current language, an update function,
 * and loading states for both initial fetch and subsequent updates.
 */
export const useUserLanguage = () => {
  const { user } = useUser();
  const [language, setLanguage] = useState<string>(i18n.language || 'en');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Effect to fetch and listen for language changes from Firebase Firestore
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    // Set up real-time listener for user preferences
    const unsubscribe = userPreferencesService.onUserPreferencesChange(
      user.uid,
      (preferences) => {
        const savedLanguage = preferences.language || 'en';
        setLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  /**
   * Updates the user's language preference in Firebase Firestore and locally.
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
      await userPreferencesService.updateLanguage(user.uid, newLanguage);
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
