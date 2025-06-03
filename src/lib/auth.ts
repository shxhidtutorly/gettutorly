
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';

// Create user profile in database
const createUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: userData.email,
        name: userData.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'student'
      }]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

// Email/Password sign up with automatic profile creation
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    // Create user profile in the database if user is created
    if (data.user) {
      await createUserProfile(data.user.id, {
        email: data.user.email,
        name: displayName
      });
      
      toast({
        title: 'Account created successfully',
        description: 'Please check your email to verify your account',
      });
    }
    
    return data.user;
  } catch (error) {
    console.error("Email sign-up error:", error);
    toast({
      title: 'Sign-up failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
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
    
    toast({
      title: 'Signed in successfully',
      description: `Welcome back${data.user.user_metadata?.name ? ', ' + data.user.user_metadata.name : ''}!`,
    });
    
    return data.user;
  } catch (error) {
    console.error("Email sign-in error:", error);
    toast({
      title: 'Sign-in failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
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
    toast({
      title: 'OAuth sign-in failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
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
    
    toast({
      title: 'Password reset email sent',
      description: 'Check your inbox for the reset link',
    });
    
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    toast({
      title: 'Password reset failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
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
    
    toast({
      title: 'Password updated successfully',
      description: 'You can now sign in with your new password',
    });
    
    return true;
  } catch (error) {
    console.error("Password update error:", error);
    toast({
      title: 'Password update failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: 'Signed out successfully',
      description: 'You have been logged out',
    });
    
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    toast({
      title: 'Sign out failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
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

// Update user profile
export const updateUserProfile = async (userData: { name?: string; avatar_url?: string }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (authError) throw authError;

    // Update profile in database
    const { error: dbError } = await supabase
      .from('users')
      .update({
        name: userData.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (dbError) throw dbError;
    
    toast({
      title: 'Profile updated successfully',
      description: 'Your profile information has been updated',
    });
    
    return true;
  } catch (error) {
    console.error("Profile update error:", error);
    toast({
      title: 'Profile update failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
    throw error;
  }
};

// Change password for authenticated users
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // First verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    });
    
    if (verifyError) throw new Error('Current password is incorrect');

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    toast({
      title: 'Password changed successfully',
      description: 'Your password has been updated',
    });
    
    return true;
  } catch (error) {
    console.error("Password change error:", error);
    toast({
      title: 'Password change failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
    throw error;
  }
};

// Verify email (can be called after user clicks email verification link)
export const verifyEmail = async (token: string) => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });
    
    if (error) throw error;
    
    toast({
      title: 'Email verified successfully',
      description: 'Your email has been verified',
    });
    
    return true;
  } catch (error) {
    console.error("Email verification error:", error);
    toast({
      title: 'Email verification failed',
      description: getAuthErrorMessage(error),
      variant: 'destructive',
    });
    throw error;
  }
};

// Helper function to get error message from Supabase Auth errors
export const getAuthErrorMessage = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'P0001':
        return 'No account found with this email.';
      case 'auth/wrong-password':
      case 'invalid_credentials':
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
  return error?.message || 'An error occurred during authentication.';
};
