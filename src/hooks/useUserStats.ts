
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserDoc } from '@/lib/firebase-helpers';
import { getDoc, onSnapshot } from 'firebase/firestore';

export interface UserStats {
  total_study_time: number;
  notes_created: number;
  quizzes_taken: number;
  average_quiz_score: number;
  sessions_this_month: number;
  learning_milestones: number;
  materials_created?: number;
}

export const useUserStats = () => {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user stats document reference
      const userStatsRef = getUserDoc(user.uid, 'stats/summary');
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(userStatsRef, (doc) => {
        if (doc.exists()) {
          setStats(doc.data() as UserStats);
        } else {
          // Set default stats if document doesn't exist
          setStats({
            total_study_time: 0,
            notes_created: 0,
            quizzes_taken: 0,
            average_quiz_score: 0,
            sessions_this_month: 0,
            learning_milestones: 0,
            materials_created: 0
          });
        }
        setLoading(false);
      }, (err) => {
        console.error('Error fetching user stats:', err);
        setError('Failed to load stats');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up stats listener:', err);
      setError('Failed to setup stats listener');
      setLoading(false);
    }
  }, [user?.uid]);

  return { stats, loading, error };
};
