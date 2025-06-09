
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
  const { isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set global user ID for database operations
    if (user?.id) {
      (window as any).clerkUserId = user.id;
    }

    const setupUser = async () => {
      if (isSignedIn && user) {
        try {
          // First try to get existing profile
          let profile = await getUserProfile(user.id);
          
          // If no profile exists, create one
          if (!profile) {
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
        }
      } else {
        setCurrentUser(null);
        (window as any).clerkUserId = null;
      }
      setLoading(false);
    };

    setupUser();
  }, [isSignedIn, user]);

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
