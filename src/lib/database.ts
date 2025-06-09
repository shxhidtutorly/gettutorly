import { supabase } from '@/lib/supabase';

// Study Plans Operations
export const createStudyPlan = async (planData: {
  title: string;
  description?: string;
  sessions: any[];
  due_date?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('study_plans')
      .insert([{
        user_id: user.id,
        title: planData.title,
        description: planData.description || '',
        sessions: planData.sessions,
        due_date: planData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating study plan:", error);
    throw error;
  }
};

export const getUserStudyPlans = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study plans:", error);
    return [];
  }
};

// Study Materials Operations
export const getUserStudyMaterials = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study materials:", error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (updates: {
  name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Get user study progress
export const getUserStudyProgress = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_updated', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study progress:", error);
    return [];
  }
};

// Get user activity logs
export const getUserActivityLogs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user activity logs:", error);
    return [];
  }
};

// Log user activity
export const logUserActivity = async (actionType: string, details: any = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_activity_logs')
      .insert([{
        user_id: user.id,
        action_type: actionType,
        details: details,
        timestamp: new Date().toISOString()
      }]);
      
    if (error) throw error;
    
    // Update activity streak
    const today = new Date().toDateString();
    localStorage.setItem('lastActivityDate', today);
    
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
};

// Search study materials
export const searchStudyMaterials = async (query: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,file_name.ilike.%${query}%,content_type.ilike.%${query}%`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching materials:", error);
    return [];
  }
};

// Store AI Notes
export const storeAINotes = async (notesData: {
  title: string;
  content: string;
  filename: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ai_notes')
      .insert([{
        user_id: user.id,
        title: notesData.title,
        content: notesData.content,
        source_filename: notesData.filename,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log activity
    await logUserActivity('ai_notes_generated', { title: notesData.title });
    
    return data;
  } catch (error) {
    console.error("Error storing AI notes:", error);
    throw error;
  }
};

// Get user AI notes
export const getUserAINotes = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ai_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting AI notes:", error);
    return [];
  }
};

// Store Audio Notes
export const storeAudioNotes = async (audioData: {
  title: string;
  filename: string;
  audioUrl: string;
  transcription: string;
  aiNotes: string;
  aiSummary: string;
  duration?: number;
  fileSize?: number;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('audio_notes')
      .insert([{
        user_id: user.id,
        title: audioData.title,
        filename: audioData.filename,
        audio_url: audioData.audioUrl,
        transcription: audioData.transcription,
        ai_notes: audioData.aiNotes,
        ai_summary: audioData.aiSummary,
        duration: audioData.duration || null,
        file_size: audioData.fileSize || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log activity
    await logUserActivity('audio_notes_generated', { 
      title: audioData.title,
      filename: audioData.filename 
    });
    
    return data;
  } catch (error) {
    console.error("Error storing audio notes:", error);
    throw error;
  }
};

// Get user audio notes
export const getUserAudioNotes = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('audio_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting audio notes:", error);
    return [];
  }
};
