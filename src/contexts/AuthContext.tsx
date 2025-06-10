
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
    /**
     * Sets up user authentication and profile with validation and error handling
     * Validates user data and handles authentication errors gracefully
     */
    const setupUser = async () => {
      // Don't proceed if Clerk isn't loaded yet
      if (!isLoaded) {
        return;
      }

      if (isSignedIn && user) {
        try {
          // Validate user ID before proceeding
          if (!user.id || typeof user.id !== 'string') {
            console.error('Invalid user ID from Clerk:', user.id);
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          // Set global user ID for database operations
          (window as any).clerkUserId = user.id;

          // First try to get existing profile with validation
          const profileResult = await getUserProfile(user.id);
          
          let profile = null;
          if (profileResult.success) {
            profile = profileResult.data;
          } else if (profileResult.code === 'INVALID_ID' || profileResult.code === 'INVALID_UUID') {
            console.error('Invalid user ID format:', user.id);
            setCurrentUser(null);
            setLoading(false);
            return;
          }
          
          // If no profile exists, create one with validation
          if (!profile) {
            console.log('Creating new user profile for:', user.id);
            const createResult = await createUserProfile(user.id, {
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.fullName || user.firstName || '',
              avatar_url: user.imageUrl || '',
            });

            if (createResult.success) {
              profile = createResult.data;
            } else {
              console.error('Failed to create user profile:', createResult.error);
              // Continue with Clerk data even if profile creation fails
            }
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
