
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useSupabaseStorage = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, bucket: string = 'files') => {
    if (!currentUser) {
      setError('User must be logged in to upload files');
      return null;
    }

    try {
      setProgress(0);
      setError(null);

      // Create a unique file path using user ID and timestamp
      const filePath = `${currentUser.id}/${bucket}/${Date.now()}_${file.name}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);
      
      return {
        filePath,
        fileUrl: publicUrlData.publicUrl,
        fileName: file.name,
        contentType: file.type,
        size: file.size
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload');
      console.error('File upload error:', err);
      return null;
    }
  };

  const deleteFile = async (filePath: string, bucket: string = 'files') => {
    try {
      setError(null);
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during file deletion');
      console.error('File deletion error:', err);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    progress,
    error
  };
};
