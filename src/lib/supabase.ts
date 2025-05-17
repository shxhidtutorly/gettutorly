
import { createClient } from '@supabase/supabase-js';

// Default values for development (these will be used if env vars are missing)
// Replace these with actual values for your development environment
const DEFAULT_SUPABASE_URL = 'https://your-project.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'your-anon-key';

// Get environment variables or use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Check for empty strings (which might come from env vars)
if (supabaseUrl === '' || supabaseAnonKey === '') {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create Supabase client with fallbacks to prevent runtime errors
export const supabase = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY
);

// Storage helpers
export const uploadFile = async (userId: string, file: File, bucket: string = 'study_materials') => {
  try {
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      filePath,
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

// Delete file from storage
export const deleteFile = async (filePath: string, bucket: string = 'study_materials') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get summaries for a user
export const getSummaries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching summaries:", error);
    throw error;
  }
};
