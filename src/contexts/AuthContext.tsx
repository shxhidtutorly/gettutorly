
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser, useSession } from '@clerk/clerk-react';
import { createUserProfile, getUserProfile } from '@/lib/supabaseAuth';

interface AuthContextType {
  currentUser: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, signOut: clerkSignOut, isLoaded } = useClerkAuth();
  const { user } = useUser();
  const { session } = useSession();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupUser = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        try {
          const clerkUserId = user.id;

          if (!clerkUserId || typeof clerkUserId !== 'string') {
            console.error('Invalid user ID from Clerk:', clerkUserId);
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          // Set global Clerk user ID
          (window as any).clerkUserId = clerkUserId;

          // Get or create user profile (using localStorage approach for Clerk)
          let profile;
          try {
            profile = await getUserProfile(clerkUserId);
          } catch (error) {
            console.warn('No existing profile found, creating new one.');
            await createUserProfile(clerkUserId, {
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.fullName || user.firstName || '',
              avatar_url: user.imageUrl || '',
            });
            profile = await getUserProfile(clerkUserId);
          }

          // Set current user object
          setCurrentUser({
            id: clerkUserId,
            email: user.emailAddresses[0]?.emailAddress,
            user_metadata: {
              name: user.fullName || user.firstName,
              full_name: user.fullName,
              avatar_url: user.imageUrl,
            },
            profile,
          });
        } catch (error) {
          console.error('Error setting up user:', error);
          // Fallback to Clerk-only data
          setCurrentUser({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            user_metadata: {
              name: user.fullName || user.firstName,
              full_name: user.fullName,
              avatar_url: user.imageUrl,
            },
          });
        }
      } else {
        setCurrentUser(null);
        (window as any).clerkUserId = null;
      }

      setLoading(false);
    };

    setupUser();
  }, [isLoaded, isSignedIn, user, session]);

  const signOut = async () => {
    await clerkSignOut();
    setCurrentUser(null);
    (window as any).clerkUserId = null;
  };

  const value = {
    currentUser,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
