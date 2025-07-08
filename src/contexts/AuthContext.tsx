
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userId: string | null;
  appId: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userId: null,
  appId: 'default-app-id'
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
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get appId from global Canvas variable or use default
  const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'default-app-id';

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if initial auth token is available (Canvas environment)
      const initialAuthToken = typeof (window as any).__initial_auth_token !== 'undefined' 
        ? (window as any).__initial_auth_token 
        : null;

      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
          console.log("Signed in with custom token");
        } else {
          // Fallback to anonymous authentication
          await signInAnonymously(auth);
          console.log("Signed in anonymously");
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        try {
          await signInAnonymously(auth);
          console.log("Fallback anonymous sign-in successful");
        } catch (anonError) {
          console.error("Error with anonymous sign-in:", anonError);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      setUserId(user?.uid || null);
      setLoading(false);
    });

    // Initialize authentication if no user is already signed in
    if (!auth.currentUser) {
      initializeAuth();
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userId, appId }}>
      {children}
    </AuthContext.Provider>
  );
};
