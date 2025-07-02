
import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  userId: string;
  noteId: string;
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
    const chatRef = collection(db, 'note_chats');
    const docRef = await addDoc(chatRef, {
      userId,
      noteId,
      role,
      message,
      created_at: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      userId,
      noteId,
      role,
      message,
      created_at: new Date().toISOString(),
    };
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
    const chatRef = collection(db, 'note_chats');
    const q = query(
      chatRef, 
      where("userId", "==", userId),
      where("noteId", "==", noteId),
      orderBy("created_at", "asc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as ChatMessage[];
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};

// Subscribe to note chat history in real time
export const subscribeToChatHistory = (
  userId: string,
  noteId: string,
  onInsert: (message: ChatMessage) => void
) => {
  const chatRef = collection(db, 'note_chats');
  const q = query(
    chatRef, 
    where("userId", "==", userId),
    where("noteId", "==", noteId),
    orderBy("created_at", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        onInsert({
          id: change.doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as ChatMessage);
      }
    });
  });
};
