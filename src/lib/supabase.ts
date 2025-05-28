
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase project configuration
const supabaseUrl = 'https://dllyfsbuxrjyiatfcegk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHlmc2J1eHJqeWlhdGZjZWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDUxNzAsImV4cCI6MjA2MzAyMTE3MH0.1jfGciFNtGgfw7bNZhuraoA_83whPx6Ojl0J5iHfJz0';

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

// Enhanced storage helpers with better error handling
export const uploadFile = async (userId: string, file: File, bucket: string = 'study_materials') => {
  try {
    // Validate file type and size
    if (file.type !== 'application/pdf') {
      throw new Error('Please upload a PDF file');
    }
    
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('File size must be less than 25MB');
    }

    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

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
      .from('summaries')
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

// Store a new summary
export const storeSummaryWithFile = async (
  userId: string, 
  summary: string, 
  title: string, 
  fileUrl: string, 
  fileName: string, 
  fileType: string = 'application/pdf',
  fileSize: number = 0
) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .insert([{
        user_id: userId,
        title,
        content: summary,
        file_name: fileName,
        file_url: fileUrl,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error storing summary:", error);
    throw error;
  }
};
