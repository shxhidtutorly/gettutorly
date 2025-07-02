
import { useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';

export const useSupabaseStorage = () => {
  const [user] = useAuthState(auth);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile: firebaseUpload, deleteFile: firebaseDelete } = useFirebaseStorage();

  const uploadFile = async (userId: string, file: File) => {
    if (!file) throw new Error('No file provided');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `study-materials/${userId}/${fileName}`;

    const downloadURL = await firebaseUpload(file, filePath);
    return { path: filePath, fullPath: downloadURL };
  };

  const deleteFile = async (filePath: string) => {
    await firebaseDelete(filePath);
    return true;
  };

  const uploadStudyMaterial = async (file: File) => {
    if (!user) {
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
      
      const result = await uploadFile(user.uid, file);
      
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
    // For Firebase, we can return the public URL directly
    // or implement signed URLs if needed
    return filePath;
  };
  
  const listFiles = async (folderPath: string = '') => {
    if (!user) {
      setError('User must be logged in to list files');
      return null;
    }
    
    try {
      setError(null);
      // This would need to be implemented with Firebase Storage listAll
      // For now, return empty array
      return [];
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
