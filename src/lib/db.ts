
import { supabase } from './supabase';

// User profile operations
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        ...userData,
        role: userData.role || "student", // Default role
        created_at: new Date().toISOString(),
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

// Admin-specific functions
export const isUserAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Summary operations
export const saveSummary = async (userId: string, summaryData: any) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
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
    console.error("Error saving summary:", error);
    throw error;
  }
};

export const getUserSummaries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user summaries:", error);
    throw error;
  }
};

export const deleteSummary = async (summaryId: string) => {
  try {
    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('id', summaryId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting summary:", error);
    throw error;
  }
};

// Study resources operations
export const addStudyResource = async (resourceData: any) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert([{
        ...resourceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error adding study resource:", error);
    throw error;
  }
};

export const getStudyResources = async (filters: any = {}) => {
  try {
    let query = supabase
      .from('resources')
      .select('*');
      
    // Apply any filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting study resources:", error);
    throw error;
  }
};

export const subscribeToCollection = (collectionPath: string, callback: (data: any[]) => void, filters: any = {}) => {
  // Initialize with a first fetch
  const fetchData = async () => {
    try {
      let query = supabase
        .from(collectionPath)
        .select('*');
        
      // Apply any filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      callback(data || []);
    } catch (error) {
      console.error(`Error fetching ${collectionPath}:`, error);
    }
  };

  fetchData();
  
  // Set up realtime subscription
  const subscription = supabase
    .channel(`public:${collectionPath}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: collectionPath }, () => {
      fetchData();
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};
