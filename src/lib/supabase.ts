import { createClient } from '@supabase/supabase-js';

// Safely load from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials are missing in environment variables.');
}

// Create a single Supabase client instance
const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // <-- This is set to true
    detectSessionInUrl: false, 
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

const supabase = client;
export { supabase };

// Storage configuration
const STORAGE_CONFIG = {
  bucketName: 'summaries',
  fallbackBuckets: ['summaries', 'study_materials', 'documents', 'pdfs', 'uploads'],
  maxFileSize: 25 * 1024 * 1024, // 25MB
  allowedTypes: ['application/pdf'],
};

// Ensure bucket exists
export const ensureBucketExists = async (bucketName: string = STORAGE_CONFIG.bucketName) => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }

    const exists = buckets?.some(bucket => bucket.name === bucketName);
    if (!exists) {
      console.warn(`Bucket '${bucketName}' does not exist.`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('ensureBucketExists error:', err);
    return false;
  }
};

// Upload file
export const uploadFile = async (
  userId: string,
  file: File,
  primaryBucket = STORAGE_CONFIG.bucketName
) => {
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  if (file.size > STORAGE_CONFIG.maxFileSize) {
    throw new Error('File exceeds 25MB size limit');
  }

  const filePath = `${userId}/${Date.now()}_${file.name}`;
  let result = null;
  let bucketUsed = null;

  for (const bucket of STORAGE_CONFIG.fallbackBuckets) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false, cacheControl: '3600' });

      if (!error && data) {
        result = data;
        bucketUsed = bucket;
        break;
      }

      console.warn(`Upload failed for bucket ${bucket}:`, error?.message);
    } catch (err) {
      console.error(`Error uploading to ${bucket}:`, err);
    }
  }

  if (!result || !bucketUsed) {
    throw new Error('Upload failed on all buckets');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketUsed)
    .getPublicUrl(filePath);

  return {
    filePath,
    fileUrl: publicUrl,
    fileName: file.name,
    contentType: file.type,
    size: file.size,
    bucket: bucketUsed,
  };
};

// Delete file
export const deleteFile = async (filePath: string, bucket = STORAGE_CONFIG.bucketName) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteFile error:', err);
    throw err;
  }
};

// Fetch summaries
export const getSummaries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getSummaries error:', err);
    throw err;
  }
};

// Save summary
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
  } catch (err) {
    console.error('storeSummaryWithFile error:', err);
    throw err;
  }
};

// Storage init
export const initializeStorage = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }

    const available = buckets?.map(b => b.name);
    const usable = STORAGE_CONFIG.fallbackBuckets.find(b => available.includes(b));

    if (usable) {
      console.log(`Using bucket: ${usable}`);
      return true;
    } else {
      console.warn('No valid bucket found for storage.');
      return false;
    }
  } catch (err) {
    console.error('initializeStorage error:', err);
    return false;
  }
};
