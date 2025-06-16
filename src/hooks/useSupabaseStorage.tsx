
import { useState } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react"; // Renamed for clarity
import { useSupabase } from "@/lib/supabase"; // Import the new hook

export const useSupabaseStorage = () => {
  const { user } = useClerkAuth(); // Use Clerk's useAuth
  const supabase = useSupabase(); // Use the new Supabase hook
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // This internal helper function now relies on the supabase instance from the hook's scope
  const uploadFileInternal = async (userId: string, file: File) => {
    if (!file) throw new Error('No file provided');
    if (!supabase) throw new Error('Supabase client is not available'); // Check for supabase
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('study-materials')
      .upload(filePath, file);

    if (error) throw error;
    return data;
  };

  // This internal helper function now relies on the supabase instance from the hook's scope
  const deleteFileInternal = async (filePath: string) => {
    if (!supabase) throw new Error('Supabase client is not available'); // Check for supabase
    const { error } = await supabase.storage
      .from('study-materials')
      .remove([filePath]);

    if (error) throw error;
    return true;
  };

  const uploadStudyMaterial = async (file: File) => {
    if (!user || !supabase) { // Add supabase check
      setError('User must be logged in and Supabase client available to upload files');
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
      
      const result = await uploadFileInternal(user.id, file); // Use internal helper
      
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
    if (!supabase) { // Add supabase check
      setError('Supabase client is not available');
      return false;
    }
    try {
      setError(null);
      const result = await deleteFileInternal(filePath); // Use internal helper
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during file deletion');
      console.error('File deletion error:', err);
      return false;
    }
  };
  
  const getSignedUrl = async (filePath: string, expiresIn: number = 3600) => {
    if (!supabase) { // Add supabase check
      setError('Supabase client is not available');
      return null;
    }
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
    if (!user || !supabase) { // Add supabase check
      setError('User must be logged in and Supabase client available to list files');
      return null;
    }
    
    try {
      setError(null);
      const path = folderPath ? `${user.id}/${folderPath}` : `${user.id}`;
      
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
