
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { createUserProfile } from "@/lib/db";

export const useSupabaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check auth state on component mount
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        
        // If the user just signed up, create their profile in the database
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
          createInitialUserProfile(session.user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Initial session check
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check current session
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
    }
    setLoading(false);
  };
  
  // Create initial user profile in the database
  const createInitialUserProfile = async (user: User) => {
    try {
      // Extract name from user metadata if available
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      
      await createUserProfile(user.id, {
        email: user.email,
        name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'student' // Default role
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      // We don't toast this error as it's a background operation
    }
  };

  // Sign up with email
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: displayName || email.split('@')[0]
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      
      return data.user;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create your account.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email or OAuth
  const signIn = async (email?: string, password?: string) => {
    try {
      setLoading(true);
      
      let result;
      
      // If email and password are provided, sign in with them
      if (email && password) {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Otherwise sign in with Google OAuth
        result = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: "Sign in successful",
        description: email ? `Signed in as ${email}` : "Signed in with Google",
      });
      
      // For OAuth we can't directly return the user since it requires a redirect
      // For password auth we can
      if (email && password) {
        return result.data.user;
      }
      
      return null;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials or authentication error.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
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
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the reset link.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Reset request failed",
        description: error.message || "Could not send reset email.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (userData: { name?: string; avatar_url?: string }) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update your profile.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile
  };
};
