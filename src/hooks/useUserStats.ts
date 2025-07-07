
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { firebaseSecure } from '@/lib/firebase-secure';

export interface UserStats {
  total_study_time: number;
  materials_created: number;
  notes_created: number;
  quizzes_taken: number;
  flashcards_created: number;
  average_quiz_score: number;
  sessions_this_month: number;
  learning_milestones: number;
}

export const useUserStats = (userId: string | null) => {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Exit if there is no user ID to fetch stats for.
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      try {
        // --- IMPROVEMENT: Check for cached stats first ---
        const cachedStatsDoc = await firebaseSecure.secureRead(`userStats/${userId}`);
        if (cachedStatsDoc) {
          const cachedData = cachedStatsDoc;
          const lastUpdated = cachedData.lastUpdated?.toDate ? cachedData.lastUpdated.toDate() : new Date(0);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

          // If cache is less than an hour old, use it.
          if (lastUpdated > oneHourAgo) {
            setStats(cachedData as UserStats);
            setLoading(false);
            return; // Stop execution and use the fresh cache
          }
        }

        // --- If no fresh cache, proceed with calculation ---
        
        // Get current month start
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // --- FIX: Use the `userId` prop for all queries ---
        const [
          userActivity,
          notesHistory,
          mathHistory,
          summaryHistory,
          flashcards,
          quizzes,
          aiSessions
        ] = await Promise.all([
          firebaseSecure.secureQuery(`userActivity/${userId}/sessions`),
          firebaseSecure.secureQuery(`notes_history/${userId}/entries`),
          firebaseSecure.secureQuery(`math_chat_history/${userId}/entries`),
          firebaseSecure.secureQuery(`summary_sessions/${userId}/entries`),
          firebaseSecure.secureQuery(`flashcards/${userId}/sets`),
          firebaseSecure.secureQuery(`quizzes/${userId}/attempts`),
          firebaseSecure.secureQuery(`ai_sessions/${userId}/chats`)
        ]);

        // Calculate total study time (in minutes)
        const totalStudyTime = userActivity.reduce((sum: number, session: any) => {
          return sum + (session.duration || 0);
        }, 0);

        // Calculate sessions this month
        const sessionsThisMonth = userActivity.filter((session: any) => {
          const sessionDate = session.timestamp?.toDate ? session.timestamp.toDate() : new Date(session.timestamp);
          return sessionDate >= monthStart;
        }).length;

        // --- FIX: Include scores of 0 in the average calculation ---
        const quizScores = quizzes.map((q: any) => q.score).filter((score: any) => typeof score === 'number');
        const averageQuizScore = quizScores.length > 0
          ? Math.round(quizScores.reduce((a: number, b: number) => a + b, 0) / quizScores.length)
          : 0;

        // Calculate learning milestones
        const learningMilestones = notesHistory.length + summaryHistory.length + 
          flashcards.length + quizzes.length + aiSessions.length;

        const calculatedStats: UserStats = {
          total_study_time: totalStudyTime,
          materials_created: notesHistory.length + summaryHistory.length,
          notes_created: notesHistory.length,
          quizzes_taken: quizzes.length,
          flashcards_created: flashcards.length,
          average_quiz_score: averageQuizScore,
          sessions_this_month: sessionsThisMonth,
          learning_milestones: learningMilestones
        };

        setStats(calculatedStats);

        // --- FIX: Save stats to Firebase cache under the correct userId ---
        await firebaseSecure.secureWrite(`userStats/${userId}`, {
          ...calculatedStats,
          lastUpdated: new Date()
        });

      } catch (error) {
        console.error('Error loading user stats:', error);
        // Set stats to 0 on error to prevent crashes
        setStats({
          total_study_time: 0,
          materials_created: 0,
          notes_created: 0,
          quizzes_taken: 0,
          flashcards_created: 0,
          average_quiz_score: 0,
          sessions_this_month: 0,
          learning_milestones: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]); // --- FIX: Dependency array now only depends on userId ---

  return { stats, loading };
};
