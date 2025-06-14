
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// UUID validation regex
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;

/**
 * Validates if a string is a valid UUID format
 */
const isValidUUID = (id: string): boolean => {
  return typeof id === 'string' && id.length === 36 && UUID_REGEX.test(id);
};

/**
 * Logs detailed error context for Supabase operations
 */
const logDetailedError = (operation: string, userId: string, error: any) => {
  console.error(`Error ${operation} for userId=${userId} – code=${error.code || 'UNKNOWN'}, message=${error.message || 'No message'}, hint=${error.hint || 'No hint'}`, error);
};

// Helper function to convert Clerk user ID to UUID
const convertClerkIdToUuid = (clerkId: string): string => {
  // If it's already a UUID, return it
  if (isValidUUID(clerkId)) {
    return clerkId;
  }
  
  // For Clerk IDs, we'll create a deterministic UUID based on the Clerk ID
  const hash = clerkId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Create a UUID-like string from the hash
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hexHash.substring(0, 8)}-${hexHash.substring(0, 4)}-4${hexHash.substring(1, 4)}-8${hexHash.substring(0, 3)}-${hexHash}${clerkId.slice(-8)}`;
  
  return uuid.substring(0, 36);
};

/**
 * Creates or updates user profile with validation and error handling
 */
export const createUserProfile = async (clerkUserId: string, userData: {
  email: string;
  name?: string;
  avatar_url?: string;
}) => {
  try {
    // Validate input
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return { success: false, error: "Invalid user ID", code: "INVALID_ID" };
    }

    const userId = convertClerkIdToUuid(clerkUserId);
    
    // Validate converted UUID
    if (!isValidUUID(userId)) {
      return { success: false, error: "Invalid user ID format", code: "INVALID_UUID" };
    }
    
    console.log('Creating user profile with ID:', userId);
    
    // Prepare data object
    const profileData: any = {
      id: userId,
      clerk_user_id: clerkUserId,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      avatar_url: userData.avatar_url,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      logDetailedError('createUserProfile', userId, error);
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message || 'Failed to create user profile', code: error.code || 'UNKNOWN_ERROR' };
  }
};

/**
 * Gets user profile with UUID validation and schema error handling
 */
export const getUserProfile = async (clerkUserId: string) => {
  try {
    // Validate input
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return { success: false, error: "Invalid user ID", code: "INVALID_ID" };
    }

    const userId = convertClerkIdToUuid(clerkUserId);
    
    // Validate UUID format before querying
    if (!isValidUUID(userId)) {
      return { success: false, error: "Invalid user ID format", code: "INVALID_UUID" };
    }
    
    console.log('Getting user profile with ID:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, user doesn't exist yet
        return { success: true, data: null };
      }
      
      logDetailedError('getUserProfile', userId, error);
      return { success: false, error: error.message || 'Failed to get user profile', code: error.code || 'UNKNOWN_ERROR' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message || 'Failed to get user profile', code: 'UNKNOWN_ERROR' };
  }
};

// Update user profile
export const updateUserProfile = async (clerkUserId: string, updates: any) => {
  try {
    // Validate input
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return { success: false, error: "Invalid user ID", code: "INVALID_ID" };
    }

    const userId = convertClerkIdToUuid(clerkUserId);
    
    // Validate UUID format
    if (!isValidUUID(userId)) {
      return { success: false, error: "Invalid user ID format", code: "INVALID_UUID" };
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logDetailedError('updateUserProfile', userId, error);
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message || 'Failed to update user profile', code: error.code || 'UNKNOWN_ERROR' };
  }
};

/**
 * Logs user activity with validation and error handling
 */
export const logUserActivity = async (clerkUserId: string, action: string, details: any = {}) => {
  try {
    // Validate input
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      console.warn('Invalid user ID for activity logging:', clerkUserId);
      return false;
    }

    const userId = convertClerkIdToUuid(clerkUserId);
    
    // Validate UUID format
    if (!isValidUUID(userId)) {
      console.warn('Invalid UUID format for activity logging:', userId);
      return false;
    }

    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        clerk_user_id: clerkUserId,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      logDetailedError('logUserActivity', userId, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error logging user activity:', error);
    return false;
  }
};
