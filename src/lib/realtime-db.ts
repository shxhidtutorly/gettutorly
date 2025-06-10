import { supabase } from './supabase';

// Use clerk_user_id as the unique identifier instead of id

// User profiles in Realtime Database
export const createUserProfile = async (clerkUserId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert([{
        clerk_user_id: clerkUserId,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (clerkUserId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', clerkUserId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (clerkUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Study progress tracking
export const updateStudyProgress = async (clerkUserId: string, courseId: string, progressData: any) => {
  try {
    const { error } = await supabase
      .from('progress')
      .upsert([{
        clerk_user_id: clerkUserId,
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

export const getStudyProgress = async (clerkUserId: string, courseId?: string) => {
  try {
    let query = supabase
      .from('progress')
      .select('*')
      .eq('clerk_user_id', clerkUserId);

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

// Notes management
export const createNote = async (clerkUserId: string, noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        clerk_user_id: clerkUserId,
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

export const updateNote = async (clerkUserId: string, noteId: string, noteData: any) => {
  try {
    const { error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        updated_at: new Date().toISOString()
      })
      .match({ id: noteId, clerk_user_id: clerkUserId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const deleteNote = async (clerkUserId: string, noteId: string) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .match({ id: noteId, clerk_user_id: clerkUserId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export const getNotes = async (clerkUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
};

// Real-time data subscription
export const subscribeToData = (path: string, callback: (data: any) => void) => {
  const [table, field, value] = path.split('/');

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

  const subscription = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      if (field && value && payload.new[field] !== value) return;
      fetchData();
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Backup & Restore functions (still use clerk_user_id)
export const backupUserData = async (clerkUserId: string) => {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (profileError) throw profileError;

    const { data: userNotes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('clerk_user_id', clerkUserId);

    if (notesError) throw notesError;

    const { data: userProgress, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('clerk_user_id', clerkUserId);

    if (progressError) throw progressError;

    const backupData = {
      profile: userProfile,
      notes: userNotes,
      progress: userProgress,
      backup_date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('backups')
      .insert([{
        clerk_user_id: clerkUserId,
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

export const restoreFromBackup = async (clerkUserId: string, backupId: string) => {
  try {
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('data')
      .eq('id', backupId)
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (backupError) throw backupError;
    if (!backup) throw new Error("Backup not found");

    const backupData = backup.data;

    if (backupData.profile) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          ...backupData.profile,
          updated_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;
    }

    if (backupData.notes?.length) {
      await supabase.from('notes').delete().eq('clerk_user_id', clerkUserId);
      const { error: insertError } = await supabase
        .from('notes')
        .insert(backupData.notes.map((n: any) => ({
          ...n,
          updated_at: new Date().toISOString()
        })));
      if (insertError) throw insertError;
    }

    if (backupData.progress?.length) {
      await supabase.from('progress').delete().eq('clerk_user_id', clerkUserId);
      const { error: insertError } = await supabase
        .from('progress')
        .insert(backupData.progress.map((p: any) => ({
          ...p,
          updated_at: new Date().toISOString()
        })));
      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error("Error restoring backup:", error);
    throw error;
  }
};
