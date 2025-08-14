import { useState, useEffect } from 'react';
// Assuming subscribeToUserStats is your real-time listener from firebase-db
import { subscribeToUserStats } from '@/lib/firebase-db';

/**
 * A hook to fetch and subscribe to a user's statistics from Firebase in real-time.
 *
 * This revised hook uses only a real-time listener (`subscribeToUserStats`).
 * This is more efficient and avoids potential race conditions between a one-time
 * fetch and the subscription's initial data emission.
 *
 * @param userId The ID of the user whose stats are to be fetched.
 * @returns An object containing the stats, loading state, and any error.
 */
export const useUserStats = (userId: string | null) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's no user ID, we're not logged in or auth is pending.
    // Reset state and indicate we are not loading.
    if (!userId) {
      setStats(null);
      setLoading(false); // Not loading if there's no user to load for.
      return;
    }

    // Start loading for the new userId.
    setLoading(true);
    setError(null);

    // Set up the real-time subscription.
    // This listener will handle both the initial data and subsequent updates.
    // NOTE: This assumes `subscribeToUserStats` accepts success and error callbacks.
    const unsubscribe = subscribeToUserStats(
      userId,
      (data) => {
        // Data received from Firestore. Update state and stop loading.
        setStats(data);
        setLoading(false);
      },
      (err: Error) => {
        // Handle any errors from the subscription.
        console.error("Error subscribing to user stats:", err);
        setError("Failed to subscribe to user statistics.");
        setLoading(false);
      }
    );

    // The cleanup function returned by useEffect.
    // React runs this when the component unmounts or when `userId` changes.
    // This is crucial to prevent memory leaks by detaching the listener.
    return () => {
      unsubscribe();
    };
  }, [userId]); // The effect re-runs ONLY when the userId string changes.

  return { stats, loading, error };
};
