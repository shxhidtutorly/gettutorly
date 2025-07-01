
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@/hooks/useUser";
import { useUploadThing } from './useUploadThing';

export const useFirebaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useUser();
  const { toast } = useToast();
  const { startUpload, deleteFile } = useUploadThing();

  const handleUpload = async (file: File, folder: string = "files") => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      
      const results = await startUpload([file]);
      
      if (!results || results.length === 0) {
        throw new Error('Upload failed');
      }
      
      const result = results[0];
      
      const fileDetails = {
        path: result.key,
        url: result.url,
        fileName: result.name,
        contentType: file.type,
        size: result.size
      };
      
      toast({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
      });

      return fileDetails;
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getUserFiles = useCallback(async (folder: string = "files") => {
    if (!user) return [];

    try {
      // UploadThing doesn't provide a list files API in the same way
      // You might need to store file references in Firebase DB
      return [];
    } catch (error) {
      console.error("Error listing files:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your files. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [user, toast]);

  const getFileURL = (filePath: string) => {
    // UploadThing files are directly accessible via their URL
    return filePath;
  };

  const removeFile = async (fileKey: string) => {
    try {
      const success = await deleteFile(fileKey);
      
      if (success) {
        toast({
          title: "File deleted",
          description: "The file has been removed successfully.",
        });
      }
      
      return success;
    } catch (error) {
      console.error("File deletion error:", error);
      toast({
        title: "Deletion failed",
        description: "Could not delete the file. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadFile: handleUpload,
    getFileURL,
    deleteFile: removeFile,
    listUserFiles: getUserFiles,
    isUploading,
    progress,
  };
};
