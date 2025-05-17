
import { useState, useCallback } from "react";
import { 
  uploadFile, 
  getFileURL, 
  deleteFile, 
  listUserFiles, 
  validateFile,
  backupUserFiles
} from "@/lib/storage";
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
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.message || "This file type or size is not allowed.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      
      // Use the enhanced upload function that returns task for monitoring progress
      const { task, promise } = uploadFile(currentUser.uid, file, folder);
      
      // Monitor upload progress
      task.on('state_changed', 
        (snapshot) => {
          const progressValue = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(progressValue);
        },
        (error) => {
          console.error("Upload error:", error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
          setIsUploading(false);
        }
      );
      
      // Wait for upload to complete
      const fileDetails = await promise;
      
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
      return await listUserFiles(currentUser.uid, folder);
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

  const removeFile = async (filePath: string) => {
    try {
      await deleteFile(filePath);
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
      const result = await backupUserFiles(currentUser.uid, folder);
      
      toast({
        title: "Files backed up",
        description: `${result.length} files have been backed up successfully.`,
      });

      return result;
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
