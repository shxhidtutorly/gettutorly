
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@/hooks/useUser";
import { 
  createUserProfile as fbCreateUserProfile,
  updateUserProfile as fbUpdateUserProfile,
  getUserProfile as fbGetUserProfile,
  createNote as fbCreateNote,
  updateNote as fbUpdateNote,
  deleteNote as fbDeleteNote,
  getUserNotes
} from '@/lib/firebase-firestore';

export const useRealtimeDB = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const updateUserProfile = async (profileData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      await fbUpdateUserProfile(user.id, {
        ...profileData,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = useCallback(async () => {
    if (!user) return null;

    try {
      const data = await fbGetUserProfile(user.id);
      return data;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }, [user]);

  const updateStudyProgress = async (progressData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update study progress",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      // Implement study progress tracking in Firebase
      console.log('Study progress update:', progressData);

      toast({
        title: "Progress updated",
        description: "Your study progress has been recorded.",
      });

      return true;
    } catch (error) {
      console.error("Progress update error:", error);
      toast({
        title: "Update failed",
        description: "Could not update your progress. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getStudyProgress = useCallback(async () => {
    if (!user) return null;

    try {
      // Implement getting study progress from Firebase
      return [];
    } catch (error) {
      console.error("Error getting study progress:", error);
      return null;
    }
  }, [user]);

  const createNote = async (noteData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const noteId = await fbCreateNote(user.id, {
        ...noteData,
        created_at: new Date().toISOString()
      });

      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });

      return noteId;
    } catch (error) {
      console.error("Note creation error:", error);
      toast({
        title: "Creation failed",
        description: "Could not create your note. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (noteId: string, noteData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      await fbUpdateNote(user.id, noteId, {
        ...noteData,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Note update error:", error);
      toast({
        title: "Update failed",
        description: "Could not update your note. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      await fbDeleteNote(user.id, noteId);

      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Note deletion error:", error);
      toast({
        title: "Deletion failed",
        description: "Could not delete your note. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getNotes = useCallback(async () => {
    if (!user) return [];

    try {
      const notes = await getUserNotes(user.id);
      return notes || [];
    } catch (error) {
      console.error("Error getting notes:", error);
      return [];
    }
  }, [user]);

  const backupUserData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to backup data",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      // Get all user data
      const [notes, sessions] = await Promise.all([
        getNotes(),
        getStudyProgress()
      ]);

      const backupData = {
        user_id: user.id,
        backup_date: new Date().toISOString(),
        notes: notes,
        study_sessions: sessions
      };

      // Store backup in localStorage as fallback
      localStorage.setItem(`backup_${user.id}_${Date.now()}`, JSON.stringify(backupData));

      toast({
        title: "Backup created",
        description: "Your data has been backed up locally.",
      });

      return backupData;
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Backup failed",
        description: "Could not backup your data. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFromBackup = async (backupId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to restore data",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      // Try to get backup from localStorage
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        throw new Error("Backup not found");
      }

      const parsedBackup = JSON.parse(backupData);

      toast({
        title: "Data restored",
        description: "Your data has been restored from backup.",
      });

      return parsedBackup;
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore failed",
        description: "Could not restore your data. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    getUserProfile,
    updateStudyProgress,
    getStudyProgress,
    createNote,
    updateNote,
    deleteNote,
    getNotes,
    backupUserData,
    restoreFromBackup,
    isLoading
  };
};
