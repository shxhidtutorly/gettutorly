import { supabase } from '@/integrations/supabase/client';

// Helper function to convert Clerk user ID to UUID (same as in supabaseAuth.ts)
const convertClerkIdToUuid = (clerkId: string): string => {
  // If it's already a UUID, return it
  if (clerkId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
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

// Get current user ID (Clerk user ID)
const getCurrentUserId = () => {
  return (window as any).clerkUserId || null;
};

// STUDY MATERIALS OPERATIONS
export const saveStudyMaterial = async (userId: string, materialData: any) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        user_id: dbUserId,
        title: materialData.title,
        file_name: materialData.file_name,
        file_url: materialData.file_url,
        content_type: materialData.content_type,
        size: materialData.size,
        metadata: materialData.metadata || {},
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the activity
    await logUserActivity(userId, 'material_uploaded', {
      material_id: data.id,
      title: materialData.title,
      file_name: materialData.file_name
    });
    
    return data.id;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

export const getUserStudyMaterials = async (userId: string) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user study materials:", error);
    throw error;
  }
};

// NOTES OPERATIONS
export const createNote = async (userId: string, noteData: any) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: dbUserId,
        title: noteData.title,
        content: noteData.content,
        material_id: noteData.material_id || null,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    await logUserActivity(userId, 'notes_created', {
      note_id: data.id,
      title: noteData.title
    });
    
    return data.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getUserNotes = async (userId: string) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user notes:", error);
    throw error;
  }
};

// STUDY PROGRESS TRACKING
export const updateStudyProgress = async (userId: string, materialId: string, progressData: any) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { error } = await supabase
      .from('study_progress')
      .upsert([{
        user_id: dbUserId,
        material_id: materialId,
        progress_percentage: progressData.progress_percentage || 0,
        last_position: progressData.last_position || 0,
        time_spent: progressData.time_spent || 0,
        completed: progressData.completed || false,
        last_updated: new Date().toISOString(),
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating study progress:", error);
    throw error;
  }
};

export const getStudyProgress = async (userId: string, materialId?: string) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    let query = supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', dbUserId);
      
    if (materialId) {
      query = query.eq('material_id', materialId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study progress:", error);
    throw error;
  }
};

// STUDY PLANS OPERATIONS
export const createStudyPlan = async (planData: any) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const dbUserId = convertClerkIdToUuid(userId);

    const { data, error } = await supabase
      .from('study_plans')
      .insert([{
        user_id: dbUserId,
        title: planData.title,
        description: planData.description,
        due_date: planData.due_date,
        sessions: planData.sessions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    await logUserActivity(userId, 'study_plan_created', {
      plan_id: data.id,
      title: planData.title
    });
    
    return data;
  } catch (error) {
    console.error("Error creating study plan:", error);
    throw error;
  }
};

export const getUserStudyPlans = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const dbUserId = convertClerkIdToUuid(userId);

    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user study plans:", error);
    throw error;
  }
};

// USER ACTIVITY LOGS
export const getUserActivityLogs = async (userId: string) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', dbUserId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user activity logs:", error);
    throw error;
  }
};

// ACTIVITY LOGGING
export const logUserActivity = async (userId: string, action: string, details: any = {}) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: dbUserId,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging user activity:", error);
    return false;
  }
};

// Store AI Notes (for AI Notes Generator)
export const storeAINotes = async (userId: string, notesData: {
  title: string;
  content: string;
  filename: string;
}) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: dbUserId,
        title: notesData.title,
        content: notesData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    await logUserActivity(userId, 'ai_notes_generated', { title: notesData.title });
    
    return data;
  } catch (error) {
    console.error("Error storing AI notes:", error);
    throw error;
  }
};

// Get user AI notes
export const getUserAINotes = async (userId: string) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting AI notes:", error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: {
  name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
}) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbUserId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Search study materials
export const searchStudyMaterials = async (userId: string, query: string) => {
  try {
    const dbUserId = convertClerkIdToUuid(userId);
    
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', dbUserId)
      .or(`title.ilike.%${query}%,file_name.ilike.%${query}%,content_type.ilike.%${query}%`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching materials:", error);
    return [];
  }
};

// Add missing functions that were referenced in other files
export const getUserStudyProgress = async (userId: string) => {
  return getStudyProgress(userId);
};
