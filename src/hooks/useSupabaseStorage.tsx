import { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseStorage = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const uploadStudyMaterial = async (file: File) => {
    if (!currentUser) {
      setError('User must be logged in to upload files');
      return null;
    }

    try {
      setProgress(0);
      setError(null);

      if (file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }
      
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('File size must be less than 25MB');
      }

      setProgress(25);
      
      const result = await uploadFile(currentUser.id, file);
      
      setProgress(100);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during file upload';
      setError(errorMessage);
      console.error('File upload error:', err);
      return null;
    }
  };

  const deleteStudyMaterial = async (filePath: string) => {
    try {
      setError(null);
      const result = await deleteFile(filePath);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during file deletion');
      console.error('File deletion error:', err);
      return false;
    }
  };
  
  const getSignedUrl = async (filePath: string, expiresIn: number = 3600) => {
    try {
      setError(null);
      const { data, error } = await supabase.storage
        .from('study-materials')
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating signed URL');
      console.error('Signed URL error:', err);
      return null;
    }
  };
  
  const listFiles = async (folderPath: string = '') => {
    if (!currentUser) {
      setError('User must be logged in to list files');
      return null;
    }
    
    try {
      setError(null);
      const path = folderPath ? `${currentUser.id}/${folderPath}` : `${currentUser.id}`;
      
      const { data, error } = await supabase.storage
        .from('study-materials')
        .list(path);

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while listing files');
      console.error('List files error:', err);
      return null;
    }
  };

  return {
    uploadFile: uploadStudyMaterial,
    deleteFile: deleteStudyMaterial,
    getSignedUrl,
    listFiles,
    progress,
    error
  };
};
