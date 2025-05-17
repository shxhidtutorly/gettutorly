
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Google authentication
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    // Return user if available in session
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData?.session?.user || null;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Email/Password sign up
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName
        }
      }
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Email sign-up error:", error);
    throw error;
  }
};

// Email/Password sign in
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

// Password reset
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// Helper function to get error message from Supabase Auth errors
export const getAuthErrorMessage = (error: AuthError | Error): string => {
  if ('code' in error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return error.message || 'An error occurred during authentication.';
    }
  }
  return error.message || 'An error occurred during authentication.';
};
