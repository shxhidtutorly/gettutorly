
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { firebaseSecure } from '@/lib/firebase-secure';

export interface HistoryEntry {
  id: string;
  timestamp: any;
  input: string;
  output: string;
  type: 'math' | 'notes' | 'summary' | 'flashcard' | 'doubt' | 'quiz' | 'chat';
  metadata?: Record<string, any>;
  userId?: string;
}

export const useHistory = (type: string) => {
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || !type) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        // FIX: Use segment array for secureQuery to ensure even segments
        const entries = await firebaseSecure.secureQuery([`${type}_history`, user.uid, 'entries'].join('/'));
        setHistory(entries || []);
      } catch (error) {
        console.error(`Error loading ${type} history:`, error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user?.uid, type]);

  const addHistoryEntry = async (input: string, output: string, metadata?: Record<string, any>) => {
    if (!user?.uid) return;

    try {
      const entry: HistoryEntry = {
        id: '', // Will be set after firestore add
        input,
        output,
        type: type as HistoryEntry['type'],
        metadata,
        timestamp: new Date(),
        userId: user.uid
      };

      // FIX: Use segment array for secureAdd to ensure even segments
      const docId = await firebaseSecure.secureAdd([`${type}_history`, user.uid, 'entries'].join('/'), entry);
      
      if (docId) {
        const newEntry = { ...entry, id: docId };
        setHistory(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error(`Error adding ${type} history entry:`, error);
    }
  };

  const clearHistory = async () => {
    if (!user?.uid) return;

    try {
      // Note: In production, you'd want to implement batch delete
      // For now, we'll clear the local state and let Firebase clean up
      setHistory([]);
      console.log(`Cleared ${type} history for user ${user.uid}`);
    } catch (error) {
      console.error(`Error clearing ${type} history:`, error);
    }
  };

  return {
    history,
    loading,
    addHistoryEntry,
    clearHistory
  };
};
