import { useState, useEffect } from 'react';
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

// --- FIX: The core logic is now a standalone function, completely outside the hook. ---
// This function doesn't depend on any state setters from the hook, so it can't cause re-renders.
const fetchUserStatsData = async (uid: string) => {
  try {
    // 1. Check for recently cached stats in Firestore
    const cachedStats = await getUserStats(uid);
    if (cachedStats && cachedStats.lastUpdated) {
      const lastUpdatedDate = cachedStats.lastUpdated.toDate();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (lastUpdatedDate > oneHourAgo) {
        console.log('Loaded user stats from Firestore cache.');
        return cachedStats as UserStats;
      }
    }

    // 2. If no valid cache, calculate fresh stats
    console.log('Cache stale or missing. Calculating fresh stats...');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [userActivity, notesHistory, summaryHistory, flashcards, quizzes, aiSessions] = await Promise.all([
      getUserDocs(uid, 'userActivity'),
      getUserDocs(uid, 'notes_history'),
      getUserDocs(uid, 'summary_sessions'),
      getUserDocs(uid, 'flashcards'),
      getUserDocs(uid, 'quizzes'),
      getUserDocs(uid, 'ai_sessions'),
    ]);

    const totalStudyTime = userActivity.reduce((sum: number, session: any) => sum + (session.duration || 0), 0);
    const sessionsThisMonth = userActivity.filter(
      (session: any) => session.timestamp?.toDate && session.timestamp.toDate() >= monthStart,
    ).length;
    const quizzesTaken = quizzes.length;
    const quizScores = quizzes.map((q: any) => q.score).filter((s: any): s is number => typeof s === 'number');
    const averageQuizScore =
      quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
    const learningMilestones =
      notesHistory.length + summaryHistory.length + flashcards.length + quizzesTaken + aiSessions.length;

    const calculatedStats: UserStats = {
      total_study_time: totalStudyTime,
      materials_created: notesHistory.length + summaryHistory.length,
      notes_created: notesHistory.length,
      quizzes_taken: quizzesTaken,
      flashcards_created: flashcards.length,
      average_quiz_score: averageQuizScore,
      sessions_this_month: sessionsThisMonth,
      learning_milestones: learningMilestones,
      lastUpdated: Timestamp.now(),
    };

    console.log('Calculated and updated user stats in Firestore.');
    await updateUserStats(uid, calculatedStats);
    return calculatedStats;
  } catch (error) {
    console.error('FATAL: Error loading user stats:', error);
    return initialStats;
  }
};

export const useUserStats = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until the authentication process is complete.
    if (authLoading) {
      setLoading(true);
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      if (user) {
        const userStats = await fetchUserStatsData(user.uid);
        setStats(userStats);
      } else {
        setStats(null);
      }
      setLoading(false);
    };

    // If we have a logged-in user, run the data loading function.
    if (user) {
      loadStats();
    } else {
      // If no user, reset state and stop loading.
      setStats(null);
      setLoading(false);
    }
  }, [user, authLoading]); // Dependencies are now just the user object and auth loading status.

  return { stats, loading: loading || authLoading };
};
