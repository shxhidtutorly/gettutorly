
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile as uploadFileUtil, deleteFile as deleteFileUtil, ensureBucketExists } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export const useSupabaseStorage = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, bucket: string = 'summaries') => {
    if (!currentUser) {
      setError('User must be logged in to upload files');
      return null;
    }

    try {
      setProgress(0);
      setError(null);

      // Validate file type and size
      if (file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }
      
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('File size must be less than 25MB');
      }

      setProgress(25);
      
      // Use the enhanced upload function with fallback strategy
      const result = await uploadFileUtil(currentUser.id, file, bucket);
      
      setProgress(100);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during file upload';
      setError(errorMessage);
      console.error('File upload error:', err);
      return null;
    }
  };

  const deleteFile = async (filePath: string, bucket: string = 'summaries') => {
    try {
      setError(null);
      const result = await deleteFileUtil(filePath, bucket);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during file deletion');
      console.error('File deletion error:', err);
      return false;
    }
  };
  
  const getSignedUrl = async (filePath: string, bucket: string = 'summaries', expiresIn: number = 3600) => {
    try {
      setError(null);
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating signed URL');
      console.error('Signed URL error:', err);
      return null;
    }
  };
  
  const listFiles = async (folderPath: string = '', bucket: string = 'summaries') => {
    if (!currentUser) {
      setError('User must be logged in to list files');
      return null;
    }
    
    try {
      setError(null);
      // Ensure we're only looking in the user's folder
      const path = folderPath ? `${currentUser.id}/${folderPath}` : `${currentUser.id}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while listing files');
      console.error('List files error:', err);
      return null;
    }
  };

  const checkBucketStatus = async () => {
    try {
      setError(null);
      const isReady = await ensureBucketExists();
      return isReady;
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking bucket status');
      console.error('Bucket check error:', err);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    getSignedUrl,
    listFiles,
    checkBucketStatus,
    progress,
    error
  };
};
