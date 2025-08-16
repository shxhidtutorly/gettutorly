
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userPreferencesService } from '@/lib/firebase-user-preferences';
import i18n from '@/i18n/i18n';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        // Initialize language preferences when user logs in
        if (user) {
          console.log('🔐 User logged in, initializing language preferences...');
          try {
            const preferences = await userPreferencesService.getUserPreferences(user.uid);
            const userLanguage = preferences?.language || 'en';
            
            // Set the language in i18n
            if (i18n.language !== userLanguage) {
              console.log(`🌍 Setting language to: ${userLanguage}`);
              i18n.changeLanguage(userLanguage);
            }
            
            console.log('✅ Language preferences initialized');
          } catch (error) {
            console.error('❌ Error initializing language preferences:', error);
            // Fallback to English
            if (i18n.language !== 'en') {
              i18n.changeLanguage('en');
            }
          }
        } else {
          // User logged out, reset to default language
          console.log('🔐 User logged out, resetting to default language');
          if (i18n.language !== 'en') {
            i18n.changeLanguage('en');
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
