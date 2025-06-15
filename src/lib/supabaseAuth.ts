
import { supabase } from '@/integrations/supabase/client';

// AUTHENTICATION HELPERS
export const signUpWithEmail = async (email: string, password: string, userData?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const updateUserPassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// USER PROFILE HELPERS - Updated to work with Clerk integration
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    // For Clerk integration, we store user data in a way that doesn't conflict with Supabase auth
    // Since we can't directly insert into the users table with Clerk IDs, we'll use a different approach
    console.log('Creating user profile for Clerk user:', userId);
    
    // Store user data in localStorage for now since we're using Clerk for auth
    const userProfile = {
      id: userId,
      ...userData,
      role: userData.role || "student",
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(userProfile));
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    // For Clerk integration, retrieve from localStorage
    console.log('Getting user profile for Clerk user:', userId);
    
    const stored = localStorage.getItem(`user_profile_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return a default profile if none exists
    const defaultProfile = {
      id: userId,
      role: "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return defaultProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
