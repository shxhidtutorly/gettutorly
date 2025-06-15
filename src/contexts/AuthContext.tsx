
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser, useSession, useOrganization } from '@clerk/clerk-react';
import { createUserProfile, getUserProfile } from '@/lib/supabaseAuth';
import { supabase } from '@/integrations/supabase/client';

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

  async function syncClerkTokenToSupabase() {
    // Use Clerk Browser SDK to get the Supabase template JWT
    // Works in latest Clerk
    try {
      // We're only doing this client-side
      if (typeof window === 'undefined' || !isSignedIn || !user) return;
      // Clerk v5 gets token with this:
      const token = await window.Clerk?.session?.getToken?.({ template: "supabase" }) 
        ?? (await (window as any).Clerk?.session?.getToken?.({ template: 'supabase' }));

      if (!token) {
        console.warn('No Clerk session token for Supabase available!');
        // Log out from Supabase
        await supabase.auth.signOut();
        return;
      }

      // Sync the token to Supabase auth state
      await supabase.auth.setSession({ access_token: token, refresh_token: token });
      // Optionally: you can log the JWT to debug
      // console.log('🔗 Synced Clerk token to Supabase');
    } catch (err) {
      console.error('Error syncing Clerk token to Supabase:', err);
    }
  }

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

          // Get or create user profile from Supabase
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
        // Log out from Supabase
        supabase.auth.signOut();
      }

      setLoading(false);
    };

    setupUser();
    // Sync Clerk token to Supabase on every login change
    syncClerkTokenToSupabase();
    // eslint-disable-next-line
  }, [isLoaded, isSignedIn, user, session]);

  // Manually trigger sync if needed
  useEffect(() => {
    syncClerkTokenToSupabase();
  }, [session]);

  const signOut = async () => {
    await clerkSignOut();
    setCurrentUser(null);
    (window as any).clerkUserId = null;
    // Log out from Supabase
    supabase.auth.signOut();
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
