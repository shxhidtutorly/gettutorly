
import { supabase } from '@/integrations/supabase/client';

// USER OPERATIONS
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        ...userData,
        role: userData.role || "student",
        updated_at: new Date().toISOString(),
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

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
export const saveStudyMaterial = async (userId: string, materialData: any) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        user_id: userId,
        ...materialData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the activity
    await logUserActivity('material_uploaded', {
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

export const deleteStudyMaterial = async (materialId: string) => {
  try {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', materialId);
      
    if (error) throw error;
    
    // Log the activity
    await logUserActivity('material_deleted', {
      material_id: materialId
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting study material:", error);
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
        ...noteData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the activity
    await logUserActivity('note_created', {
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

export const deleteNote = async (noteId: string) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
      
    if (error) throw error;
    
    // Log the activity
    await logUserActivity('note_deleted', {
      note_id: noteId
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
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

// ACTIVITY LOGGING
export const logUserActivity = async (action: string, details: any) => {
  try {
    const { error } = await supabase.rpc('log_user_activity', {
      action_type: action,
      activity_details: details
    });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging user activity:", error);
    return false;
  }
};

export const getUserAnalytics = async (userId: string, period: 'day' | 'week' | 'month' = 'week') => {
  try {
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

// FILE STORAGE OPERATIONS
export const uploadFile = async (userId: string, file: File) => {
  try {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('study-materials')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('study-materials')
      .getPublicUrl(fileName);

    return {
      filePath: data.path,
      fileUrl: publicUrl,
      fileName: file.name,
      contentType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('study-materials')
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
