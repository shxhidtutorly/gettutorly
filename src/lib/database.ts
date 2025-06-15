import { supabase } from '@/integrations/supabase/client';

// Get the current user's Clerk ID from the global window or context
const getCurrentClerkUserId = (): string | null => {
  // Try to get from global window first
  if (typeof window !== 'undefined' && (window as any).clerkUserId) {
    return (window as any).clerkUserId;
  }
  
  // Fallback: try to get from Clerk directly
  if (typeof window !== 'undefined' && (window as any).Clerk?.user?.id) {
    return (window as any).Clerk.user.id;
  }
  
  return null;
};

// Test function to verify Supabase connection
export const testSupabaseConnection = async (clerkUserId: string) => {
  try {
    console.log('🧪 Testing Supabase connection for user:', clerkUserId);
    
    // Test 1: Try to query study_progress
    const { data: progressData, error: progressError } = await supabase
      .from('study_progress')
      .select('time_spent')
      .eq('clerk_user_id', clerkUserId);
    
    console.log('📊 Study progress test:', { data: progressData, error: progressError });
    
    // Test 2: Try to query user_activity_logs
    const { data: activityData, error: activityError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .limit(5);
    
    console.log('📝 Activity logs test:', { data: activityData, error: activityError });
    
    // Test 3: Try to query notes
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .limit(5);
    
    console.log('📓 Notes test:', { data: notesData, error: notesError });
    
    return {
      progress: { data: progressData, error: progressError },
      activity: { data: activityData, error: activityError },
      notes: { data: notesData, error: notesError }
    };
  } catch (error) {
    console.error('💥 Supabase connection test failed:', error);
    throw error;
  }
};

// USER OPERATIONS - Updated to use clerk_user_id
export const createUserProfile = async (clerkUserId: string, userData: any) => {
  try {
    console.log('👤 Creating user profile for:', clerkUserId);
    
    const { data, error } = await supabase
      .from('users')
      .upsert([{
        clerk_user_id: clerkUserId,
        ...userData,
        role: userData.role || "student",
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
    
    console.log('✅ User profile created:', data);
    return data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (clerkUserId: string) => {
  try {
    console.log('👤 Getting user profile for:', clerkUserId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
    
    console.log('✅ User profile retrieved:', data);
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// STUDY MATERIALS OPERATIONS - Updated to use clerk_user_id
export const saveStudyMaterial = async (clerkUserId: string, materialData: any) => {
  try {
    console.log('📚 Saving study material for:', clerkUserId);
    
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        clerk_user_id: clerkUserId,
        ...materialData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error saving study material:', error);
      throw error;
    }
    
    console.log('✅ Study material saved:', data);
    
    // Log the activity
    await logUserActivity(clerkUserId, 'material_uploaded', {
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

export const getUserStudyMaterials = async (clerkUserId: string) => {
  try {
    console.log('📚 Getting study materials for:', clerkUserId);
    
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error getting study materials:', error);
      throw error;
    }
    
    console.log('✅ Study materials retrieved:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error("Error getting user study materials:", error);
    throw error;
  }
};

// NOTES OPERATIONS - Updated to use clerk_user_id
export const createNote = async (clerkUserId: string, noteData: any) => {
  try {
    console.log('📝 Creating note for:', clerkUserId);
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        clerk_user_id: clerkUserId,
        ...noteData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error creating note:', error);
      throw error;
    }
    
    console.log('✅ Note created:', data);
    
    // Log the activity
    await logUserActivity(clerkUserId, 'note_created', {
      note_id: data.id,
      title: noteData.title
    });
    
    return data.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getUserNotes = async (clerkUserId: string) => {
  try {
    console.log('📝 Getting notes for:', clerkUserId);
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error getting notes:', error);
      throw error;
    }
    
    console.log('✅ Notes retrieved:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error("Error getting user notes:", error);
    throw error;
  }
};

// STUDY PROGRESS TRACKING - Updated to use clerk_user_id
export const updateStudyProgress = async (clerkUserId: string, materialId: string, progressData: any) => {
  try {
    console.log('📈 Updating study progress for:', clerkUserId, 'material:', materialId);
    
    const { data, error } = await supabase
      .from('study_progress')
      .upsert([{
        clerk_user_id: clerkUserId,
        material_id: materialId,
        ...progressData,
        last_updated: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error updating study progress:', error);
      throw error;
    }
    
    console.log('✅ Study progress updated:', data);
    return data;
  } catch (error) {
    console.error("Error updating study progress:", error);
    throw error;
  }
};

export const getStudyProgress = async (clerkUserId: string, materialId?: string) => {
  try {
    console.log('📈 Getting study progress for:', clerkUserId, materialId ? `material: ${materialId}` : 'all materials');
    
    let query = supabase
      .from('study_progress')
      .select('*')
      .eq('clerk_user_id', clerkUserId);
      
    if (materialId) {
      query = query.eq('material_id', materialId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error getting study progress:', error);
      throw error;
    }
    
    console.log('✅ Study progress retrieved:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error("Error getting study progress:", error);
    throw error;
  }
};

// ACTIVITY LOGGING - Updated to use clerk_user_id
export const logUserActivity = async (clerkUserId: string, action: string, details: any = {}) => {
  try {
    console.log('📊 Logging activity for:', clerkUserId, 'action:', action);
    
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        clerk_user_id: clerkUserId,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.warn('⚠️ Could not log user activity:', error);
      return false;
    }
    
    console.log('✅ Activity logged successfully');
    return true;
  } catch (error) {
    console.warn("Warning: Error logging user activity:", error);
    return false;
  }
};

export const getUserAnalytics = async (clerkUserId: string, period: 'day' | 'week' | 'month' = 'week') => {
  try {
    console.log('📊 Getting analytics for:', clerkUserId, 'period:', period);
    
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
      .eq('clerk_user_id', clerkUserId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('❌ Error getting analytics:', error);
      throw error;
    }
    
    console.log('✅ Analytics retrieved:', data?.length || 0, 'activities');
    return data || [];
  } catch (error) {
    console.error("Error getting user analytics:", error);
    throw error;
  }
};

// FILE STORAGE OPERATIONS
export const uploadFile = async (clerkUserId: string, file: File) => {
  try {
    console.log('📁 Uploading file for:', clerkUserId, 'file:', file.name);
    
    const fileName = `${clerkUserId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('study-materials')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('study-materials')
      .getPublicUrl(fileName);

    console.log('✅ File uploaded successfully:', fileName);
    
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
    console.log('🗑️ Deleting file:', filePath);
    
    const { error } = await supabase.storage
      .from('study-materials')
      .remove([filePath]);

    if (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
    
    console.log('✅ File deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// --- STUDY PLANS OPERATIONS ---

/**
 * Create a new study plan for the given Clerk user.
 * @param {object} planData Should include: title, description, due_date, sessions, clerk_user_id
 * @returns The newly created plan.
 */
export const createStudyPlan = async (planData: {
  title: string;
  description?: string;
  due_date?: string;
  sessions?: any[];
  clerk_user_id: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('study_plans')
      .insert([
        {
          title: planData.title,
          description: planData.description ?? '',
          due_date: planData.due_date ?? '',
          sessions: planData.sessions ?? [],
          clerk_user_id: planData.clerk_user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating study plan:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error in createStudyPlan:", error);
    throw error;
  }
};

/**
 * Fetch all study plans for the given Clerk user.
 * @param {string} clerkUserId
 * @returns Array of study plans for the user.
 */
export const getUserStudyPlans = async (clerkUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching study plans:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error in getUserStudyPlans:", error);
    throw error;
  }
};
