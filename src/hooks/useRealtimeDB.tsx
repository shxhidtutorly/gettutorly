import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useRealtimeDB = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // User profile operations
  const updateProfile = async (userData: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      await updateUserProfile(currentUser.id, userData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!currentUser) return null;

    try {
      setIsLoading(true);
      return await getUserProfile(currentUser.id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your profile. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Study progress tracking
  const updateProgress = async (courseId: string, progressData: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update progress",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      await updateStudyProgress(currentUser.id, courseId, progressData);
      
      toast({
        title: "Progress updated",
        description: "Your study progress has been updated.",
      });

      return true;
    } catch (error) {
      console.error("Progress update error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async (courseId?: string) => {
    if (!currentUser) return null;

    try {
      setIsLoading(true);
      return await getStudyProgress(currentUser.id, courseId);
    } catch (error) {
      console.error("Error fetching progress:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your progress. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time data subscription
  const useRealtimeData = (path: string) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
      if (!currentUser) {
        setLoading(false);
        return () => {};
      }

      setLoading(true);
      const userSpecificPath = path.replace('{userId}', currentUser.id);
      
      try {
        const unsubscribe = subscribeToData(userSpecificPath, (newData) => {
          setData(newData);
          setLoading(false);
        });
        
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error("Error subscribing to data:", err);
        setError(err);
        setLoading(false);
        return () => {};
      }
    }, [currentUser, path]);

    return { data, loading, error };
  };

  // Notes operations
  const addNote = async (noteData: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a note",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      const noteId = await createNote(currentUser.id, noteData);
      
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });

      return noteId;
    } catch (error) {
      console.error("Note creation error:", error);
      toast({
        title: "Save failed",
        description: "Failed to save your note. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const editNote = async (noteId: string, noteData: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update a note",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      await updateNote(currentUser.id, noteId, noteData);
      
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Note update error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your note. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeNote = async (noteId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a note",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      await deleteNote(currentUser.id, noteId);
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Note deletion error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete your note. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = useCallback(async () => {
    if (!currentUser) return [];

    try {
      setIsLoading(true);
      return await getNotes(currentUser.id);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your notes. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  // Backup operations
  const createBackup = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a backup",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      const result = await backupUserData(currentUser.id);
      
      toast({
        title: "Backup created",
        description: "Your data has been backed up successfully.",
      });

      return result;
    } catch (error) {
      console.error("Backup creation error:", error);
      toast({
        title: "Backup failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to restore a backup",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      await restoreFromBackup(currentUser.id, backupId);
      
      toast({
        title: "Backup restored",
        description: "Your data has been restored successfully.",
      });

      return true;
    } catch (error) {
      console.error("Backup restoration error:", error);
      toast({
        title: "Restoration failed",
        description: "Failed to restore your data. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // User profile
    updateProfile,
    fetchProfile,
    
    // Progress tracking
    updateProgress,
    fetchProgress,
    
    // Real-time data
    useRealtimeData,
    
    // Notes
    addNote,
    editNote,
    removeNote,
    fetchNotes,
    
    // Backups
    createBackup,
    restoreBackup,
    
    isLoading
  };
};
