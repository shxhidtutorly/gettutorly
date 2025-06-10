
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert Clerk user ID to UUID
const convertClerkIdToUuid = (clerkId: string): string => {
  // If it's already a UUID, return it
  if (clerkId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    return clerkId;
  }
  
  // For Clerk IDs, we'll create a deterministic UUID based on the Clerk ID
  // This ensures the same Clerk ID always maps to the same UUID
  const hash = clerkId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Create a UUID-like string from the hash
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hexHash.substring(0, 8)}-${hexHash.substring(0, 4)}-4${hexHash.substring(1, 4)}-8${hexHash.substring(0, 3)}-${hexHash}${clerkId.slice(-8)}`;
  
  return uuid.substring(0, 36);
};

// Create or update user profile with Clerk ID
export const createUserProfile = async (clerkUserId: string, userData: {
  email: string;
  name?: string;
  avatar_url?: string;
}) => {
  try {
    const userId = convertClerkIdToUuid(clerkUserId);
    
    console.log('Creating user profile with ID:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        clerk_id: clerkUserId, // Store the original Clerk ID for reference
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (clerkUserId: string) => {
  try {
    const userId = convertClerkIdToUuid(clerkUserId);
    
    console.log('Getting user profile with ID:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, user doesn't exist yet
        return null;
      }
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (clerkUserId: string, updates: any) => {
  try {
    const userId = convertClerkIdToUuid(clerkUserId);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
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
    const userId = convertClerkIdToUuid(clerkUserId);
    
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
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
