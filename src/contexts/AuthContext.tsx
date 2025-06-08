
import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: any | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<any | null>;
  signIn: (email?: string, password?: string) => Promise<any | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile?: (userData: { name?: string; avatar_url?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const { toast } = useToast();

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      // Clerk signup will be handled by Clerk components
      toast({
        title: "Sign up with Clerk",
        description: "Please use the sign up form.",
      });
      return null;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create your account.",
        variant: "destructive",
      });
      return null;
    }
  };

  const signIn = async (email?: string, password?: string) => {
    try {
      // Clerk signin will be handled by Clerk components
      toast({
        title: "Sign in with Clerk",
        description: "Please use the sign in form.",
      });
      return null;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials or authentication error.",
        variant: "destructive",
      });
      return null;
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Could not sign out.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      toast({
        title: "Password reset",
        description: "Please use Clerk's password reset feature.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Reset request failed",
        description: error.message || "Could not send reset email.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUserProfile = async (userData: { name?: string; avatar_url?: string }) => {
    try {
      // This will be handled by Clerk's user profile
      toast({
        title: "Profile update",
        description: "Please use Clerk's profile management.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update your profile.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser: user,
      loading: !isLoaded,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
