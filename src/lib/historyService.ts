import { firebaseSecure } from './firebase-secure';
import { orderBy } from 'firebase/firestore';

export interface HistoryEntry {
  id?: string;
  type: 'math-chat' | 'ai-notes' | 'summarizer' | 'flashcards' | 'doubt-chain' | 'quiz' | 'study-plan';
  title: string;
  query: string;
  result: string;
  timestamp: any;
  userId: string;
}

class HistoryService {
  async addHistoryEntry(entry: Omit<HistoryEntry, 'userId' | 'timestamp'>) {
    const user = firebaseSecure.getCurrentUser();
    if (!user) return null;

    // FIX: Use segment array for secureAdd to ensure even segments
    return await firebaseSecure.secureAdd(['history', user.uid, 'entries'].join('/'), entry);
  }

  async getHistoryByType(type: HistoryEntry['type']) {
    const user = firebaseSecure.getCurrentUser();
    if (!user) return [];

    // FIX: Use segment array for secureQuery to ensure even segments
    return await firebaseSecure.secureQuery(['history', user.uid, 'entries'].join('/'));
  }

  async getAllHistory() {
    const user = firebaseSecure.getCurrentUser();
    if (!user) return [];

    // FIX: Use segment array for secureQuery to ensure even segments
    return await firebaseSecure.secureQuery(['history', user.uid, 'entries'].join('/'));
  }

  async clearHistoryByType(type: HistoryEntry['type']) {
    const entries = await this.getHistoryByType(type);
    // Implementation for bulk delete would need Firebase Functions
    console.log(`Clearing ${entries.length} entries of type ${type}`);
  }

  subscribeToHistory(callback: (entries: HistoryEntry[]) => void) {
    const user = firebaseSecure.getCurrentUser();
    if (!user) return () => {};

    return firebaseSecure.subscribeToUserData(`history/${user.uid}/entries`, callback);
  }
}

export const historyService = new HistoryService();
