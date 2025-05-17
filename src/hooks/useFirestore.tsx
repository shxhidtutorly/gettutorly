
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  createUserProfile, 
  getUserProfile, 
  saveSummary, 
  getUserSummaries, 
  deleteSummary
} from "@/lib/db";
import {
  createNote,
  getNotes as getUserNotes,
  deleteNote
} from "@/lib/realtime-db";

export const useFirestore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // User profile operations
  const updateUserProfile = async (userData: any) => {
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
      await createUserProfile(currentUser.id, userData);
      
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

  const fetchUserProfile = async () => {
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

  // Summary operations
  const createSummary = async (summaryData: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a summary",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      const summaryId = await saveSummary(currentUser.id, summaryData);
      
      toast({
        title: "Summary saved",
        description: "Your summary has been saved successfully.",
      });

      return summaryId;
    } catch (error) {
      console.error("Summary creation error:", error);
      toast({
        title: "Save failed",
        description: "Failed to save your summary. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSummaries = async () => {
    if (!currentUser) return [];

    try {
      setIsLoading(true);
      return await getUserSummaries(currentUser.id);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your summaries. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const removeSummary = async (summaryId: string) => {
    try {
      setIsLoading(true);
      await deleteSummary(summaryId);
      
      toast({
        title: "Summary deleted",
        description: "The summary has been removed successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Summary deletion error:", error);
      toast({
        title: "Deletion failed",
        description: "Could not delete the summary. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Note operations
  const createUserNote = async (noteData: any) => {
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

  const fetchUserNotes = async () => {
    if (!currentUser) return [];

    try {
      setIsLoading(true);
      return await getUserNotes(currentUser.id);
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
  };

  const removeNote = async (noteId: string) => {
    if (!currentUser) return false;
    
    try {
      setIsLoading(true);
      await deleteNote(currentUser.id, noteId);
      
      toast({
        title: "Note deleted",
        description: "The note has been removed successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Note deletion error:", error);
      toast({
        title: "Deletion failed",
        description: "Could not delete the note. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // User profile
    updateUserProfile,
    getUserProfile: fetchUserProfile,
    
    // Summaries
    createSummary,
    getUserSummaries: fetchUserSummaries,
    deleteSummary: removeSummary,
    
    // Notes
    createNote: createUserNote,
    getUserNotes: fetchUserNotes,
    deleteNote: removeNote,
    
    isLoading,
  };
};
