
import { supabase } from '@/integrations/supabase/client';

// Get current user ID (Clerk user ID)
const getCurrentUserId = () => {
  // This will be set by the auth context
  return (window as any).clerkUserId || null;
};

// STUDY MATERIALS OPERATIONS
export const saveStudyMaterial = async (userId: string, materialData: any) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        user_id: userId,
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
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
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
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        title: noteData.title,
        content: noteData.content,
        material_id: noteData.material_id || null,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the activity
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
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
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
    const { error } = await supabase
      .from('study_progress')
      .upsert([{
        user_id: userId,
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
    let query = supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', userId);
      
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

    const { data, error } = await supabase
      .from('study_plans')
      .insert([{
        user_id: userId,
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
    
    // Log the activity
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

    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
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
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
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
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        title: notesData.title,
        content: notesData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log activity
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
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
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
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Search study materials
export const searchStudyMaterials = async (userId: string, query: string) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,file_name.ilike.%${query}%,content_type.ilike.%${query}%`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching materials:", error);
    return [];
  }
};
