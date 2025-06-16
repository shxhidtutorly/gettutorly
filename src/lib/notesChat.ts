import { SupabaseClient } from '@supabase/supabase-js';

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
  supabase: SupabaseClient,
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
export const getChatHistory = async (supabase: SupabaseClient, userId: string, noteId: string): Promise<ChatMessage[]> => {
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

// Subscribe to note chat history in real time (text only, no files)
export const subscribeToChatHistory = (
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
  onInsert: (message: ChatMessage) => void
) => {
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
        if (
          payload?.new &&
          payload.new.user_id === userId
        ) {
          onInsert(payload.new as ChatMessage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
