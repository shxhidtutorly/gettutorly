
import { supabase } from '@/integrations/supabase/client';

// Study Plans Operations - using direct SQL until types are updated
export const createStudyPlan = async (planData: {
  title: string;
  description?: string;
  sessions: any[];
  due_date?: string;
}) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('create_study_plan', {
        p_user_id: user.user.id,
        p_title: planData.title,
        p_description: planData.description || '',
        p_sessions: planData.sessions,
        p_due_date: planData.due_date || null
      });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating study plan:", error);
    throw error;
  }
};

export const getUserStudyPlans = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_study_plans', {
        p_user_id: user.user.id
      });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study plans:", error);
    throw error;
  }
};

// Real-time subscription for study progress
export const subscribeToStudyProgress = (userId: string, callback: (data: any) => void) => {
  return supabase
    .channel('study_progress_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'study_progress',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

// Real-time subscription for study materials
export const subscribeToStudyMaterials = (userId: string, callback: (data: any) => void) => {
  return supabase
    .channel('study_materials_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'study_materials',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

// Real-time subscription for user activity logs
export const subscribeToUserActivity = (userId: string, callback: (data: any) => void) => {
  return supabase
    .channel('user_activity_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_activity_logs',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

// Update user profile
export const updateUserProfile = async (updates: {
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
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
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
export const searchStudyMaterials = async (query: string, userId: string) => {
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
    throw error;
  }
};
