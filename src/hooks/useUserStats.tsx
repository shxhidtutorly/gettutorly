
import { useState, useEffect } from 'react';
import { getUserStats, subscribeToUserStats } from '@/lib/firebase-db';

export const useUserStats = (userId: string | null) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Initial fetch
    getUserStats(userId)
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user stats:', err);
        setError('Failed to load stats');
        setLoading(false);
      });

    // Real-time subscription
    const unsubscribe = subscribeToUserStats(userId, (data) => {
      setStats(data);
    });

    return () => unsubscribe();
  }, [userId]);

  return { stats, loading, error };
};
