import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from "framer-motion";

interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
  emailVerified: boolean;
}

interface UnifiedAuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  loading: boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const user: AuthUser | null = firebaseUser ? {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    fullName: firebaseUser.displayName,
    imageUrl: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified
  } : null;

  const value = React.useMemo(() => ({
    user,
    firebaseUser,
    isLoaded: !loading,
    isSignedIn: !!firebaseUser,
    loading
  }), [user, firebaseUser, loading]);

  if (loading) {
    return <BrutalLoader />;
  }

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

const BrutalLoader = () => {
  const loadingText = "LOADING_TUTORLY...".split("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono">
      <div className="w-24 h-24 mb-6">
        <motion.div
          className="w-full h-full bg-cyan-400"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180],
            borderRadius: ["20%", "50%", "20%"],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        />
      </div>
      <div className="flex items-center justify-center space-x-1">
        {loadingText.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: [0, 1, 0], y: 0 }}
            transition={{
              delay: i * 0.08,
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            className={`text-xl font-black ${char === '_' ? 'text-green-400' : 'text-gray-400'}`}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </div>
  );
};