
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDoc, getUserDocs, safeSetDoc } from '@/lib/firebase-helpers';
import { getDoc, Timestamp } from 'firebase/firestore';

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

export const useUserStats = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      try {
        const uid = user.uid;
        
        // Check for cached stats first
        const cachedStatsDoc = await getDoc(getUserDoc(uid, 'stats'));
        if (cachedStatsDoc.exists()) {
          const cachedData = cachedStatsDoc.data() as UserStats;
          const lastUpdated = cachedData.lastUpdated?.toDate ? cachedData.lastUpdated.toDate() : new Date(0);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

          if (lastUpdated > oneHourAgo) {
            setStats(cachedData);
            setLoading(false);
            console.log("Loaded user stats from cache.");
            return;
          }
        }

        // Calculate fresh stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const [
          userActivity,
          notesHistory,
          mathHistory,
          summaryHistory,
          flashcards,
          quizzes,
          aiSessions
        ] = await Promise.all([
          getUserDocs(uid, 'userActivity'),
          getUserDocs(uid, 'notes_history'),
          getUserDocs(uid, 'math_chat_history'),
          getUserDocs(uid, 'summary_sessions'),
          getUserDocs(uid, 'flashcards'),
          getUserDocs(uid, 'quizzes'),
          getUserDocs(uid, 'ai_sessions')
        ]);

        // Calculate total study time (in minutes)
        const totalStudyTime = userActivity.reduce((sum: number, session: any) => {
          return sum + (typeof session.duration === 'number' ? session.duration : 0);
        }, 0);

        // Calculate sessions this month
        const sessionsThisMonth = userActivity.filter((session: any) => {
          let sessionDate;
          if (session.timestamp?.toDate) {
            sessionDate = session.timestamp.toDate();
          } else if (session.timestamp) {
            try {
              sessionDate = new Date(session.timestamp);
            } catch (e) {
              sessionDate = new Date(0);
            }
          } else {
            sessionDate = new Date(0);
          }
          return sessionDate >= monthStart;
        }).length;

        // Calculate average quiz score and total quizzes taken
        const quizzesTaken = quizzes.length;
        const quizScores = quizzes.map((q: any) => q.score).filter((score: any) => typeof score === 'number');
        const averageQuizScore = quizScores.length > 0
          ? Math.round(quizScores.reduce((a: number, b: number) => a + b, 0) / quizScores.length)
          : 0;

        // Calculate learning milestones
        const learningMilestones = notesHistory.length + summaryHistory.length + 
          flashcards.length + quizzesTaken + aiSessions.length;

        const calculatedStats: UserStats = {
          total_study_time: totalStudyTime,
          materials_created: notesHistory.length + summaryHistory.length,
          notes_created: notesHistory.length,
          quizzes_taken: quizzesTaken,
          flashcards_created: flashcards.length,
          average_quiz_score: averageQuizScore,
          sessions_this_month: sessionsThisMonth,
          learning_milestones: learningMilestones
        };

        setStats(calculatedStats);
        console.log("Calculated and set new user stats:", calculatedStats);

        // Save stats to cache
        await safeSetDoc(getUserDoc(uid, 'stats'), {
          ...calculatedStats,
          lastUpdated: Timestamp.now()
        });

      } catch (error) {
        console.error('Error loading user stats:', error);
        // Set default stats on error
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
  }, [user, authLoading]);

  return { stats, loading: loading || authLoading };
};
