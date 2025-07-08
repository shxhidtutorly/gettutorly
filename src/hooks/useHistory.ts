
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
}

export const useHistory = (type: HistoryEntry['type']) => {
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || !type) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const entries = await firebaseSecure.secureQuery(`${type}_history/${user.uid}/entries`);
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
      const entry = {
        input,
        output,
        type,
        metadata,
        timestamp: new Date(),
        userId: user.uid
      };

      const docId = await firebaseSecure.secureAdd(`${type}_history/${user.uid}/entries`, entry);
      
      if (docId) {
        const newEntry: HistoryEntry = { 
          ...entry, 
          id: docId,
          type: type
        };
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
