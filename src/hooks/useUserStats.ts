import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDocs } from '@/lib/firebase-helpers';
import { Timestamp } from 'firebase/firestore';
import { getUserStats, updateUserStats } from '@/lib/firebase-firestore';

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

// A default state for stats to prevent UI errors if stats are null
const initialStats: UserStats = {
  total_study_time: 0,
  materials_created: 0,
  notes_created: 0,
  quizzes_taken: 0,
  flashcards_created: 0,
  average_quiz_score: 0,
  sessions_this_month: 0,
  learning_milestones: 0,
};

export const useUserStats = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // We wrap the main logic in a useCallback to ensure its reference is stable.
  // This function will now only be created once.
  const loadAndCalculateStats = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      // 1. Check for recently cached stats in Firestore to avoid expensive calculations
      const cachedStats = await getUserStats(uid);
      if (cachedStats && cachedStats.lastUpdated) {
        const lastUpdatedDate = cachedStats.lastUpdated.toDate();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (lastUpdatedDate > oneHourAgo) {
          setStats(cachedStats as UserStats);
          console.log("Loaded user stats from Firestore cache.");
          return; // Early exit, we're done
        }
      }

      // 2. If no valid cache, perform the expensive calculation
      console.log("Cache stale or missing. Calculating fresh stats...");
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
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

      // Calculate total study time (in minutes)
      const totalStudyTime = userActivity.reduce((sum: number, session: any) => sum + (session.duration || 0), 0);
      
      // Calculate sessions this month
      const sessionsThisMonth = userActivity.filter((session: any) => 
        session.timestamp?.toDate && session.timestamp.toDate() >= monthStart
      ).length;

      // Calculate average quiz score and total quizzes taken
      const quizzesTaken = quizzes.length;
      const quizScores = quizzes.map((q: any) => q.score).filter((s: any): s is number => typeof s === 'number');
      const averageQuizScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;

      // Calculate learning milestones
      const learningMilestones = notesHistory.length + summaryHistory.length + flashcards.length + quizzesTaken + aiSessions.length;

      const calculatedStats: UserStats = {
        total_study_time: totalStudyTime,
        materials_created: notesHistory.length + summaryHistory.length,
        notes_created: notesHistory.length,
        quizzes_taken: quizzesTaken,
        flashcards_created: flashcards.length,
        average_quiz_score: averageQuizScore,
        sessions_this_month: sessionsThisMonth,
        learning_milestones: learningMilestones,
        lastUpdated: Timestamp.now()
      };

      setStats(calculatedStats);
      console.log("Calculated and set new user stats.");

      // 3. Update the cache in Firestore for the next time
      await updateUserStats(uid, calculatedStats);

    } catch (error) {
      console.error('Error loading user stats:', error);
      // On error, set stats to a default state to prevent the UI from breaking.
      setStats(initialStats); 
    } finally {
      // This ensures loading is always set to false when the process is complete
      setLoading(false);
    }
  }, []); // This function has no dependencies, so it will not be recreated.

  useEffect(() => {
    // Wait until Firebase auth state is resolved
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    // If we have a user, load their stats.
    if (user) {
      loadAndCalculateStats(user.uid);
    } else {
      // If auth is done and there's no user, reset state.
      setStats(null);
      setLoading(false);
    }
    
    // This effect now depends on stable values and will only run when the user
    // logs in or out, NOT on every re-render.
  }, [user?.uid, authLoading, loadAndCalculateStats]);

  // Return the combined loading state from this hook and the auth hook
  return { stats, loading: loading || authLoading };
};
