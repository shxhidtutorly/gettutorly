
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useFirebaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleUpload = async (file: File, folder: string = "files") => {
    if (!currentUser) {
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
      
      const filePath = `${currentUser.id}/${folder}/${Date.now()}_${file.name}`;
      
      // Simulating progress because Supabase doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      clearInterval(progressInterval);
      
      if (error) throw error;
      
      setProgress(100);
      
      const fileUrl = supabase.storage
        .from('files')
        .getPublicUrl(filePath).data.publicUrl;
      
      const fileDetails = {
        path: filePath,
        url: fileUrl,
        fileName: file.name,
        contentType: file.type,
        size: file.size
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
    if (!currentUser) return [];

    try {
      const { data, error } = await supabase.storage
        .from('files')
        .list(`${currentUser.id}/${folder}`);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error listing files:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your files. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [currentUser, toast]);

  const getFileURL = (filePath: string) => {
    return supabase.storage
      .from('files')
      .getPublicUrl(filePath).data.publicUrl;
  };

  const removeFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('files')
        .remove([filePath]);
        
      if (error) throw error;
      
      toast({
        title: "File deleted",
        description: "The file has been removed successfully.",
      });
      return true;
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

  const backupFiles = async (folder: string = "files") => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to backup files",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsUploading(true);
      
      // Get list of user's files
      const { data: filesList, error: listError } = await supabase.storage
        .from('files')
        .list(`${currentUser.id}/${folder}`);
        
      if (listError) throw listError;
      
      // Create backup folder with timestamp
      const backupFolder = `backups/${currentUser.id}/${Date.now()}`;
      const copyPromises = filesList?.map(async (fileItem) => {
        const sourceFile = `${currentUser.id}/${folder}/${fileItem.name}`;
        const destFile = `${backupFolder}/${fileItem.name}`;
        
        const { error } = await supabase.storage
          .from('files')
          .copy(sourceFile, destFile);
          
        return { name: fileItem.name, success: !error };
      }) || [];
      
      const results = await Promise.all(copyPromises);
      
      toast({
        title: "Files backed up",
        description: `${results.filter(r => r.success).length} files have been backed up successfully.`,
      });

      return results;
    } catch (error) {
      console.error("File backup error:", error);
      toast({
        title: "Backup failed",
        description: "Could not backup your files. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile: handleUpload,
    getFileURL,
    deleteFile: removeFile,
    listUserFiles: getUserFiles,
    backupUserFiles: backupFiles,
    isUploading,
    progress,
  };
};
