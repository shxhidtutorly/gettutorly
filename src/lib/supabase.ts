
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
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
