import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage helpers
export const uploadFile = async (userId: string, file: File, folder: string = 'files') => {
  try {
    const filePath = `${userId}/${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('summaries')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('summaries')
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

// Database helpers
export const saveSummary = async (userId: string, summary: string, fileName: string, fileUrl: string) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .insert([{
        user_id: userId,
        title: fileName.replace(/\.[^/.]+$/, ""),
        content: summary,
        file_name: fileName,
        file_url: fileUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving summary:', error);
    throw error;
  }
};

export const getSummaries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching summaries:', error);
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
    console.error('Error deleting summary:', error);
    throw error;
  }
};