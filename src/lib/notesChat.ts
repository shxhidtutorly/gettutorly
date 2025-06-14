
import { supabase } from '@/integrations/supabase/client';
import { convertClerkIdToUuid } from './supabaseAuth';

export interface ChatMessage {
  id: string;
  user_id: string;
  note_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export const saveChatMessage = async (
  clerkUserId: string, 
  noteId: string, 
  role: 'user' | 'assistant', 
  message: string
): Promise<ChatMessage | null> => {
  try {
    const userId = convertClerkIdToUuid(clerkUserId);
    const { data, error } = await supabase
      .from('note_chats')
      .insert([{
        user_id: userId,
        note_id: noteId,
        role: role,
        message: message,
        created_at: new Date().toISOString(),
      }])
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

export const getChatHistory = async (clerkUserId: string, noteId: string): Promise<ChatMessage[]> => {
  try {
    const userId = convertClerkIdToUuid(clerkUserId);
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

export const sendChatMessage = async (
  message: string,
  noteContent: string,
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const response = await fetch('/api/chat-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        noteContent,
        chatHistory: chatHistory.map(msg => ({
          role: msg.role,
          message: msg.message
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
