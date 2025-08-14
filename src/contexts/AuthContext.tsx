// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-config'; // Assuming you have a firebase-config file

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener will only run once when the component mounts.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // It will set the user and update the loading state.
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up the subscription on unmount to prevent memory leaks.
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once.

  // Use `useMemo` to prevent the context value from changing on every render.
  // The value will only be re-calculated if `user` or `loading` changes.
  const value = React.useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
