
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';

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

// OAuth sign in (e.g., Google)
export const signInWithOAuth = async (provider: 'google') => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`${provider} sign-in error:`, error);
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

// Update password (after reset)
export const updateUserPassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Password update error:", error);
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

// Get auth session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Session error:", error);
    return null;
  }
  return data.session;
};

// Helper function to get error message from Supabase Auth errors
export const getAuthErrorMessage = (error: AuthError | Error): string => {
  if ('code' in error) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'P0001': // Postgres error
        return 'No account found with this email.';
      case 'auth/wrong-password':
      case '23505': // Unique violation
        return 'Incorrect password or email.';
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
