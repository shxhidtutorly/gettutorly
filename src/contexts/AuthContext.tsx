
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupUser = async () => {
      // Don't proceed if Clerk isn't loaded yet
      if (!isLoaded) {
        return;
      }

      if (isSignedIn && user) {
        try {
          // Set global user ID for database operations
          (window as any).clerkUserId = user.id;

          // First try to get existing profile
          let profile = await getUserProfile(user.id);
          
          // If no profile exists, create one
          if (!profile) {
            console.log('Creating new user profile for:', user.id);
            profile = await createUserProfile(user.id, {
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.fullName || user.firstName || '',
              avatar_url: user.imageUrl || '',
            });
          }

          // Set current user with both Clerk and Supabase data
          setCurrentUser({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            user_metadata: {
              name: user.fullName || user.firstName,
              full_name: user.fullName,
              avatar_url: user.imageUrl,
            },
            profile: profile,
          });
        } catch (error) {
          console.error('Error setting up user:', error);
          // Still set current user with Clerk data even if Supabase fails
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
  }, [isLoaded, isSignedIn, user]);

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
