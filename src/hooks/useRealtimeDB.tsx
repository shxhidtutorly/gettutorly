import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from "@clerk/clerk-react"; // Renamed for clarity
import { useSupabase } from "@/lib/supabase"; // Import the new hook

export const useRealtimeDB = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useClerkAuth(); // Use Clerk's useAuth
  const supabase = useSupabase(); // Use the new Supabase hook
  const { toast } = useToast();

  const updateUserProfile = async (profileData: any) => {
    if (!user || !supabase) { // Add supabase check
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return data;
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
    if (!user || !supabase) return null; // Add supabase check

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }, [user, supabase]); // Add supabase to dependency array

  const updateStudyProgress = async (progressData: any) => {
    if (!user || !supabase) { // Add supabase check
      toast({
        title: "Authentication required",
        description: "You must be logged in to update study progress",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          ...progressData,
          started_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Progress updated",
        description: "Your study progress has been recorded.",
      });

      return data;
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
    if (!user || !supabase) return null; // Add supabase check

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting study progress:", error);
      return null;
    }
  }, [user, supabase]); // Add supabase to dependency array

  // --- Real-time chat updates for note_chats table ---
  const subscribeToNoteChats = useCallback((noteId, onNewMessage) => {
    if (!user || !noteId || !supabase) return null; // Add supabase check

    const channel = supabase
      .channel("note_chats_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "note_chats",
          filter: `note_id=eq.${noteId}`,
        },
        (payload) => {
          if (payload.new && payload.new.user_id === user.id) {
            onNewMessage(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, supabase]); // Add supabase to dependency array

  // --- Real-time updates for study_sessions table ---
  const subscribeToStudySessions = useCallback((onUpdate) => {
    if (!user || !supabase) return null; // Add supabase check

    const channel = supabase
      .channel("study_sessions_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_sessions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, supabase]); // Add supabase to dependency array

  const createNote = async (noteData: any) => {
    if (!user || !supabase) { // Add supabase check
      toast({
        title: "Authentication required",
        description: "You must be logged in to create notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          ...noteData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });

      return data;
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
    if (!user || !supabase) { // Add supabase check
      toast({
        title: "Authentication required",
        description: "You must be logged in to update notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...noteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });

      return data;
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
    if (!user || !supabase) { // Add supabase check
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete notes",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

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
    if (!user || !supabase) return []; // Add supabase check

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting notes:", error);
      return [];
    }
  }, [user, supabase]); // Add supabase to dependency array

  const backupUserData = async () => {
    if (!user || !supabase) { // Add supabase check
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

      // Store backup in localStorage as fallback since user_backups table doesn't exist
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
    if (!user || !supabase) { // Add supabase check
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
    subscribeToNoteChats,
    subscribeToStudySessions,
    createNote,
    updateNote,
    deleteNote,
    getNotes,
    backupUserData,
    restoreFromBackup,
    isLoading
  };
};
