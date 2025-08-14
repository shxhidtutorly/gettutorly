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
      // Set the user and update the loading state.
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up the subscription on unmount to prevent memory leaks.
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once.

  // Use `useMemo` to prevent the context value from changing on every render.
  // The value will only be re-calculated if `user` or `loading` changes.
  const value = React.useMemo(() => ({ user, loading }), [user, loading]);

  // This is a crucial check. If the app is still loading, we render a loader.
  // This prevents the children components from being rendered with an incomplete state.
  if (loading) {
    return <BrutalLoader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Assuming you have this loader component defined elsewhere.
// If not, you can place it here or import it from the Dashboard file.
const BrutalLoader = () => {
  const loadingText = "LOADING_DASHBOARD...".split("");
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
