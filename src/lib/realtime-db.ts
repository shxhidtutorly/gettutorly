
import { supabase } from './supabase';

// User profiles in Realtime Database
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert([{
        id: userId,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating user profile in RTDB:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user profile in RTDB:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user profile from RTDB:", error);
    throw error;
  }
};

// Study progress tracking
export const updateStudyProgress = async (userId: string, courseId: string, progressData: any) => {
  try {
    const { error } = await supabase
      .from('progress')
      .upsert([{
        user_id: userId,
        course_id: courseId,
        ...progressData,
        updated_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating study progress:", error);
    throw error;
  }
};

export const getStudyProgress = async (userId: string, courseId?: string) => {
  try {
    let query = supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId);
      
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return courseId ? data?.[0] : data;
  } catch (error) {
    console.error("Error getting study progress:", error);
    throw error;
  }
};

// Real-time data subscription
export const subscribeToData = (path: string, callback: (data: any) => void) => {
  const [table, field, value] = path.split('/');
  
  // Initialize with a first fetch
  const fetchData = async () => {
    try {
      let query = supabase.from(table).select('*');
      
      if (field && value) {
        query = query.eq(field, value);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      callback(data);
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
    }
  };

  fetchData();
  
  // Set up realtime subscription
  const subscription = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      if (field && value && payload.new[field] !== value) return;
      fetchData();
    })
    .subscribe();
  
  // Return function to unsubscribe
  return () => {
    subscription.unsubscribe();
  };
};

// Notes management
export const createNote = async (userId: string, noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        ...noteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

export const updateNote = async (userId: string, noteId: string, noteData: any) => {
  try {
    const { error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        updated_at: new Date().toISOString()
      })
      .match({ id: noteId, user_id: userId });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const deleteNote = async (userId: string, noteId: string) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .match({ id: noteId, user_id: userId });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export const getNotes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
};

// Data backup utilities
export const backupUserData = async (userId: string) => {
  try {
    // Get all user data
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    const { data: userNotes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
      
    if (notesError) throw notesError;
    
    const { data: userProgress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId);
      
    if (progressError) throw progressError;
    
    // Create backup entry
    const backupData = {
      profile: userProfile,
      notes: userNotes,
      progress: userProgress,
      backup_date: new Date().toISOString()
    };
    
    // Store backup
    const { data, error } = await supabase
      .from('backups')
      .insert([{
        user_id: userId,
        data: backupData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      backupId: data.id,
      backupDate: backupData.backup_date
    };
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
};

export const restoreFromBackup = async (userId: string, backupId: string) => {
  try {
    // Get backup data
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('data')
      .eq('id', backupId)
      .eq('user_id', userId)
      .single();
      
    if (backupError) throw backupError;
    
    if (!backup) {
      throw new Error("Backup not found");
    }
    
    const backupData = backup.data;
    
    // Transaction not directly supported, so we need to handle each operation separately
    // Restore profile data
    if (backupData.profile) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          ...backupData.profile,
          updated_at: new Date().toISOString()
        }]);
        
      if (profileError) throw profileError;
    }
    
    // Delete existing notes and insert backup notes
    if (backupData.notes && backupData.notes.length > 0) {
      // First delete existing notes
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert backup notes
      const { error: insertError } = await supabase
        .from('notes')
        .insert(backupData.notes.map((note: any) => ({
          ...note,
          updated_at: new Date().toISOString()
        })));
        
      if (insertError) throw insertError;
    }
    
    // Delete existing progress and insert backup progress
    if (backupData.progress && backupData.progress.length > 0) {
      // First delete existing progress
      const { error: deleteError } = await supabase
        .from('progress')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert backup progress
      const { error: insertError } = await supabase
        .from('progress')
        .insert(backupData.progress.map((item: any) => ({
          ...item,
          updated_at: new Date().toISOString()
        })));
        
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Error restoring from backup:", error);
    throw error;
  }
};
