
import { supabase } from './supabase';

// USER OPERATIONS
// Create or update user profile (called after auth signup)
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        ...userData,
        role: userData.role || "student", // Default role
        updated_at: new Date().toISOString(),
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get user profile data
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Update user role (for admin functions)
export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        role: role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// STUDY MATERIALS OPERATIONS
// Save a study material with its summary to the database
export const saveSummary = async (userId: string, summaryData: any) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        user_id: userId,
        ...summaryData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

// Get all study materials for a user
export const getUserSummaries = async (userId: string) => {
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

// Delete a study material
export const deleteSummary = async (summaryId: string) => {
  try {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', summaryId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting study material:", error);
    throw error;
  }
};

// NOTES OPERATIONS
// Create a note for a study session or material
export const createNote = async (userId: string, noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        ...noteData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

// Get all notes for a user
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

// Delete a note
export const deleteNote = async (noteId: string) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// STUDY PROGRESS TRACKING
// Create or update study progress for a material
export const updateStudyProgress = async (userId: string, materialId: string, progressData: any) => {
  try {
    const { error } = await supabase
      .from('study_progress')
      .upsert([{
        user_id: userId,
        material_id: materialId,
        ...progressData,
        last_updated: new Date().toISOString(),
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating study progress:", error);
    throw error;
  }
};

// Get study progress for a user
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

// ANALYTICS
// Record user activity log (for analytics)
export const logUserActivity = async (userId: string, action: string, details: any) => {
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert([{
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString(),
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging user activity:", error);
    // Don't throw here to avoid disrupting user experience for analytics errors
    return false;
  }
};

// Get study analytics for a user
export const getUserAnalytics = async (userId: string, period: 'day' | 'week' | 'month' = 'week') => {
  try {
    // Calculate the start date based on the period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user analytics:", error);
    throw error;
  }
};

// REAL-TIME SUBSCRIPTIONS
// Subscribe to updates on a table for real-time features
export const subscribeToData = (
  table: string,
  callback: (data: any) => void,
  filters: { column: string; value: any }[] = []
) => {
  let query = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
      callback(payload.new);
    });
  
  // Add the channel to the subscription and start listening
  const subscription = query.subscribe();
  
  // Return an unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};
