
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  user_id: string;
  note_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

/**
 * Save a chat message
 */
export const saveChatMessage = async (
  userId: string, 
  noteId: string, 
  role: 'user' | 'assistant', 
  message: string
): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('note_chats')
      .insert({
        user_id: userId,
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
 * Get chat history for a note
 */
export const getChatHistory = async (userId: string, noteId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('note_chats')
      .select('*')
      .eq('user_id', userId)
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
