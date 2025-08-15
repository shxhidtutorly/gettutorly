// src/hooks/useUserStats.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
// Updated imports: All firestore functions now come from a single file for clarity.
import {
  subscribeToUserStats,
  updateUserStats,
  getUserDocs
} from '@/lib/firebase-firestore';

export interface UserStats {
  total_study_time: number;
  materials_created: number;
  notes_created: number;
  quizzes_taken: number;
  flashcards_created: number;
  average_quiz_score: number;
  sessions_this_month: number;
  learning_milestones: number;
  lastUpdated?: Timestamp;
}

/**
 * A hook to provide real-time user statistics for the dashboard.
 *
 * This hook subscribes to a pre-calculated 'stats' document in Firestore.
 * It shows cached data instantly and updates in real-time.
 * If the cached data is older than one hour, it triggers a full recalculation
 * in the background to ensure data accuracy without blocking the UI.
 */
export const useUserStats = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // This function performs the expensive recalculation of all stats from raw data.
  // It should only be called when the cached stats are considered stale.
  const recalculateAndSaveStats = async (uid: string) => {
    console.log("Cached stats are stale. Recalculating from source...");
    try {
      // Fetch all underlying data collections in parallel.
      // Note: This is an expensive operation and should not be run frequently.
      const [
        userActivity,
        notesHistory,
        summaryHistory,
        flashcards,
        quizzes,
        aiSessions
      ] = await Promise.all([
        getUserDocs(uid, 'userActivity'),
        getUserDocs(uid, 'notes_history'),
        getUserDocs(uid, 'summary_sessions'),
        getUserDocs(uid, 'flashcards'),
        getUserDocs(uid, 'quizzes'),
        getUserDocs(uid, 'ai_sessions')
      ]);

      // --- Perform Calculations ---

      const totalStudyTime = userActivity.reduce((sum: number, session: any) => {
        return sum + (typeof session.duration === 'number' ? session.duration : 0);
      }, 0);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const sessionsThisMonth = userActivity.filter((session: any) => {
        if (!session.timestamp) return false;
        // Handle both Firestore Timestamp and string/number date formats
        const sessionDate = session.timestamp?.toDate ? session.timestamp.toDate() : new Date(session.timestamp);
        return sessionDate >= monthStart;
      }).length;

      const quizzesTaken = quizzes.length;
      const quizScores = quizzes.map((q: any) => q.score).filter((score: any) => typeof score === 'number');
      const averageQuizScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((a: number, b: number) => a + b, 0) / quizScores.length)
        : 0;

      const learningMilestones = notesHistory.length + summaryHistory.length + flashcards.length + quizzesTaken + aiSessions.length;

      // Note: I've updated 'materials_created' to also include flashcards.
      const materialsCreated = notesHistory.length + summaryHistory.length + flashcards.length;

      const newStats: UserStats = {
        total_study_time: totalStudyTime,
        materials_created: materialsCreated,
        notes_created: notesHistory.length,
        quizzes_taken: quizzesTaken,
        flashcards_created: flashcards.length,
        average_quiz_score: averageQuizScore,
        sessions_this_month: sessionsThisMonth,
        learning_milestones: learningMilestones,
        lastUpdated: Timestamp.now()
      };

      // Save the newly calculated stats back to Firestore.
      // The real-time listener will automatically pick up this update.
      await updateUserStats(uid, newStats);
      console.log("Successfully recalculated and saved new stats:", newStats);

    } catch (error) {
      console.error('Error recalculating user stats:', error);
    }
  };

  useEffect(() => {
    // If auth is loading or there's no user, do nothing.
    if (authLoading) {
      return;
    }
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const uid = user.uid;

    // Subscribe to the user's stats document for real-time updates.
    const unsubscribe = subscribeToUserStats(uid, (liveStats) => {
      if (liveStats) {
        const statsData = liveStats as UserStats;
        setStats(statsData);

        // Check if the stats are stale (older than 1 hour).
        const lastUpdated = statsData.lastUpdated?.toDate ? statsData.lastUpdated.toDate() : new Date(0);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (lastUpdated < oneHourAgo) {
          // Trigger a background recalculation. The UI will show stale data
          // until the update comes through the real-time listener.
          recalculateAndSaveStats(uid);
        }
      }
      // If liveStats is null (e.g., doc doesn't exist yet), the subscription
      // in firebase-firestore.ts will create it, triggering this callback again.
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts or the user changes.
    return () => unsubscribe();
  }, [user, authLoading]);

  // Return the latest stats and the combined loading state.
  return { stats, loading: loading || authLoading };
};
