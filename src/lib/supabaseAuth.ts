
import { supabase } from '@/integrations/supabase/client';

// Create or update user profile with Clerk ID
export const createUserProfile = async (clerkUserId: string, userData: {
  email: string;
  name?: string;
  avatar_url?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: clerkUserId,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (clerkUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (clerkUserId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clerkUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Log user activity with Clerk ID
export const logUserActivity = async (clerkUserId: string, action: string, details: any = {}) => {
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: clerkUserId,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging user activity:', error);
    return false;
  }
};
