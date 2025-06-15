
import { supabase } from '@/integrations/supabase/client';
import { convertClerkIdToUuid } from './supabaseAuth';

export interface ChatMessage {
  id: string;
  clerk_user_id: string; // Changed to match actual DB column
  note_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

/**
 * Save a chat message. Always store with clerk_user_id.
 */
export const saveChatMessage = async (
  clerkUserId: string, 
  noteId: string, 
  role: 'user' | 'assistant', 
  message: string
): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('note_chats')
      .insert({
        clerk_user_id: clerkUserId,  // Use clerk_user_id directly
        note_id: noteId,
        role: role,
        message: message,
      })
      .select()
      .single();
        
    if (error) {
      console.error("Error saving chat message:", error);
      throw error;
    }
    
    return data as ChatMessage;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
};

/**
 * Get chat history for a note. Filter by clerk_user_id.
 */
export const getChatHistory = async (clerkUserId: string, noteId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('note_chats')
      .select('*')
      .eq('clerk_user_id', clerkUserId)  // Use clerk_user_id directly
      .eq('note_id', noteId)
      .order('created_at', { ascending: true });
        
    if (error) {
      console.error("Error getting chat history:", error);
      throw error;
    }
    
    return (data as ChatMessage[]) || [];
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};
