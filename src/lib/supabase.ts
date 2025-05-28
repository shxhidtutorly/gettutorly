
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

// Storage configuration
const STORAGE_CONFIG = {
  bucketName: 'summaries',
  fallbackBuckets: ['summaries', 'study_materials', 'documents', 'pdfs', 'uploads'],
  maxFileSize: 25 * 1024 * 1024,
  allowedTypes: ['application/pdf']
};

// Function to ensure bucket exists
export const ensureBucketExists = async (bucketName: string = STORAGE_CONFIG.bucketName) => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' not found. Attempting to create...`);
      // Note: Bucket creation may require admin privileges
      // For now, we'll return false and use fallback strategy
      return false;
    }
    
    console.log(`Bucket '${bucketName}' exists and is ready.`);
    return true;
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    return false;
  }
};

// Function to upload file with fallback bucket strategy
export const uploadFile = async (userId: string, file: File, primaryBucket: string = STORAGE_CONFIG.bucketName) => {
  try {
    // Validate file type and size
    if (file.type !== 'application/pdf') {
      throw new Error('Please upload a PDF file');
    }
    
    if (file.size > STORAGE_CONFIG.maxFileSize) {
      throw new Error('File size must be less than 25MB');
    }

    const filePath = `${userId}/${Date.now()}_${file.name}`;
    
    // Try uploading to the primary bucket first
    let uploadResult = null;
    let successfulBucket = null;
    
    for (const bucketName of STORAGE_CONFIG.fallbackBuckets) {
      try {
        console.log(`Attempting upload to bucket: ${bucketName}`);
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(`Upload to ${bucketName} failed:`, error);
          if (error.message.includes('Bucket not found')) {
            console.log(`Bucket ${bucketName} not found, trying next...`);
            continue;
          }
          throw error;
        }

        console.log(`Successfully uploaded to bucket: ${bucketName}`);
        uploadResult = data;
        successfulBucket = bucketName;
        break;
      } catch (bucketError) {
        console.error(`Failed to upload to ${bucketName}:`, bucketError);
        continue;
      }
    }
    
    if (!uploadResult || !successfulBucket) {
      throw new Error('All storage buckets failed. Please contact support.');
    }

    const { data: { publicUrl } } = supabase.storage
      .from(successfulBucket)
      .getPublicUrl(filePath);

    return {
      filePath,
      fileUrl: publicUrl,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      bucket: successfulBucket
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete file from storage
export const deleteFile = async (filePath: string, bucket: string = STORAGE_CONFIG.bucketName) => {
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

// Initialize storage on app startup
export const initializeStorage = async () => {
  try {
    console.log('Initializing storage...');
    
    // List existing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name) || []);
    
    // Check if any of our fallback buckets exist
    const availableBuckets = buckets?.map(b => b.name) || [];
    const usableBucket = STORAGE_CONFIG.fallbackBuckets.find(bucket => 
      availableBuckets.includes(bucket)
    );
    
    if (usableBucket) {
      console.log(`Found usable bucket: ${usableBucket}`);
      return true;
    } else {
      console.warn('No suitable storage buckets found. File uploads may fail.');
      return false;
    }
  } catch (error) {
    console.error('Storage initialization failed:', error);
    return false;
  }
};
