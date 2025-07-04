
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
    if (!user?.uid || !userId) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Get current month start
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Fetch all user data collections
        const [
          userActivity,
          notesHistory,
          mathHistory,
          summaryHistory,
          flashcards,
          quizzes,
          aiSessions
        ] = await Promise.all([
          firebaseSecure.secureQuery(`userActivity/${user.uid}/sessions`),
          firebaseSecure.secureQuery(`notes_history/${user.uid}/entries`),
          firebaseSecure.secureQuery(`math_chat_history/${user.uid}/entries`),
          firebaseSecure.secureQuery(`summary_sessions/${user.uid}/entries`),
          firebaseSecure.secureQuery(`flashcards/${user.uid}/sets`),
          firebaseSecure.secureQuery(`quizzes/${user.uid}/attempts`),
          firebaseSecure.secureQuery(`ai_sessions/${user.uid}/chats`)
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

        // Calculate quiz average
        const quizScores = quizzes.map((q: any) => q.score || 0).filter((score: number) => score > 0);
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

        // Save stats to Firebase for caching
        await firebaseSecure.secureWrite(`userStats/${user.uid}`, {
          ...calculatedStats,
          lastUpdated: new Date()
        });

      } catch (error) {
        console.error('Error loading user stats:', error);
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
  }, [user?.uid, userId]);

  return { stats, loading };
};
