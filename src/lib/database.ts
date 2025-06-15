
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
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: userId,
      p_stat_type: 'materials_created',
      p_increment: 1
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
    
    // Update user stats
    await supabase.rpc('update_user_stat', {
      p_user_id: userId,
      p_stat_type: 'notes_created',
      p_increment: 1
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
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// STUDY SESSIONS TRACKING
export const createStudySession = async (userId: string, sessionData: any) => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([{
        user_id: userId,
        ...sessionData,
        started_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating study session:", error);
    throw error;
  }
};

export const updateStudySession = async (sessionId: string, sessionData: any) => {
  try {
    const { error } = await supabase
      .from('study_sessions')
      .update({
        ...sessionData,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating study session:", error);
    throw error;
  }
};

export const getUserStudySessions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study sessions:", error);
    throw error;
  }
};

// PLACEHOLDER STUDY PLANS OPERATIONS (until study_plans table is created)
export const getUserStudyPlans = async (userId: string) => {
  try {
    // For now, return study materials as placeholder study plans
    const { data, error } = await supabase
      .from('study_materials')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform study materials to look like study plans
    const studyPlans = (data || []).map(material => ({
      id: material.id,
      title: material.title,
      description: "Study plan based on your uploaded materials",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      created_at: material.created_at
    }));
    
    return studyPlans;
  } catch (error) {
    console.error("Error getting user study plans:", error);
    throw error;
  }
};

export const createStudyPlan = async (userId: string, planData: any) => {
  try {
    // For now, create as a study material until study_plans table exists
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        user_id: userId,
        title: planData.title,
        content_type: 'study_plan',
        metadata: { description: planData.description, due_date: planData.due_date },
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating study plan:", error);
    throw error;
  }
};

export const deleteStudyPlan = async (planId: string) => {
  try {
    // For now, delete from study_materials
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', planId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting study plan:", error);
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

// Test function for debugging
export const testSupabaseConnection = async (userId: string) => {
  try {
    const results = {
      materials: { data: null, error: null },
      notes: { data: null, error: null },
      sessions: { data: null, error: null }
    };

    // Test study materials
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', userId);
      results.materials = { data, error };
    } catch (error) {
      results.materials = { data: null, error };
    }

    // Test notes
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);
      results.notes = { data, error };
    } catch (error) {
      results.notes = { data: null, error };
    }

    // Test study sessions
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);
      results.sessions = { data, error };
    } catch (error) {
      results.sessions = { data: null, error };
    }

    return results;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    throw error;
  }
};
