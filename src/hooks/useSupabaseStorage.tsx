
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { uploadFile } from "@/lib/supabase";

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleUpload = async (file: File, folder: string = "summaries") => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsUploading(true);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 100);

      // Upload file to Supabase storage
      const fileDetails = await uploadFile(currentUser.uid, file, folder);
      
      // Complete the progress
      clearInterval(progressInterval);
      setProgress(100);
      
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

  return {
    uploadFile: handleUpload,
    isUploading,
    progress,
  };
};
