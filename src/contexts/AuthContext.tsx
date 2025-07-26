
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthUser } from '@/hooks/useFirebaseAuth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoaded: false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          fullName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          imageUrl: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isLoaded: true,
          metadata: {
            createdAt: firebaseUser.metadata.creationTime,
            lastSignInAt: firebaseUser.metadata.lastSignInTime
          }
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoaded: !loading }}>
      {children}
    </AuthContext.Provider>
  );
};
