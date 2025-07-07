import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { firebaseSecure } from '@/lib/firebase-secure';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

export interface UserStats {
  total_study_time: number;
  materials_created: number;
  notes_created: number;
  quizzes_taken: number;
  flashcards_created: number;
  average_quiz_score: number;
  sessions_this_month: number;
  learning_milestones: number;
  // Add lastUpdated to the interface for better type safety, though it's internal
  lastUpdated?: Timestamp;
}

export const useUserStats = (userId: string | null) => {
  const [user] = useAuthState(auth); // 'user' from useAuthState is already provided by the hook, but 'userId' prop is primary here.
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
        // Cache path is specific to the user
        const cachedStatsDoc = await firebaseSecure.secureRead(`userStats/${userId}`);
        if (cachedStatsDoc) {
          const cachedData = cachedStatsDoc as UserStats; // Cast to UserStats
          const lastUpdated = cachedData.lastUpdated?.toDate ? cachedData.lastUpdated.toDate() : new Date(0);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

          // If cache is less than an hour old, use it.
          if (lastUpdated > oneHourAgo) {
            setStats(cachedData);
            setLoading(false);
            console.log("Loaded user stats from cache.");
            return; // Stop execution and use the fresh cache
          }
        }

        // --- If no fresh cache, proceed with calculation ---
        
        // Get current month start
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // --- FIX 1: Correct `secureQuery` paths to be just collection names ---
        // `secureQuery` automatically adds `where("userId", "==", this.currentUser.uid)`
        const [
          userActivity,
          notesHistory,
          mathHistory,
          summaryHistory,
          flashcards,
          quizzes,
          aiSessions
        ] = await Promise.all([
          firebaseSecure.secureQuery('userActivity'), // Assuming userActivity is a collection with userId field
          firebaseSecure.secureQuery('notes_history'),
          firebaseSecure.secureQuery('math_chat_history'),
          firebaseSecure.secureQuery('summary_sessions'),
          firebaseSecure.secureQuery('flashcards'),
          firebaseSecure.secureQuery('quizzes'), // Assuming quizzes is a collection with userId field
          firebaseSecure.secureQuery('ai_sessions')
        ]);

        // Calculate total study time (in minutes)
        const totalStudyTime = userActivity.reduce((sum: number, session: any) => {
          // Ensure 'duration' exists and is a number
          return sum + (typeof session.duration === 'number' ? session.duration : 0);
        }, 0);

        // Calculate sessions this month
        const sessionsThisMonth = userActivity.filter((session: any) => {
          // Ensure timestamp conversion is robust
          let sessionDate;
          if (session.timestamp?.toDate) {
            sessionDate = session.timestamp.toDate();
          } else if (session.timestamp) {
            // Attempt to parse if it's a string or number, otherwise default to epoch
            try {
              sessionDate = new Date(session.timestamp);
            } catch (e) {
              sessionDate = new Date(0); // Fallback to epoch if invalid
            }
          } else {
            sessionDate = new Date(0); // Fallback if no timestamp
          }
          return sessionDate >= monthStart;
        }).length;

        // --- FIX 2: Correctly calculate average quiz score and total quizzes taken ---
        // Assuming 'quizzes' array contains objects like { score: number, ... }
        const quizzesTaken = quizzes.length; // This should directly reflect the number of quiz attempts fetched
        const quizScores = quizzes.map((q: any) => q.score).filter((score: any) => typeof score === 'number');
        const averageQuizScore = quizScores.length > 0
          ? Math.round(quizScores.reduce((a: number, b: number) => a + b, 0) / quizScores.length)
          : 0;

        // Calculate learning milestones
        const learningMilestones = notesHistory.length + summaryHistory.length + 
          flashcards.length + quizzesTaken + aiSessions.length; // Use quizzesTaken here

        const calculatedStats: UserStats = {
          total_study_time: totalStudyTime,
          materials_created: notesHistory.length + summaryHistory.length,
          notes_created: notesHistory.length,
          quizzes_taken: quizzesTaken, // Use the calculated quizzesTaken
          flashcards_created: flashcards.length,
          average_quiz_score: averageQuizScore,
          sessions_this_month: sessionsThisMonth,
          learning_milestones: learningMilestones
        };

        setStats(calculatedStats);
        console.log("Calculated and set new user stats:", calculatedStats);

        // --- FIX 3: Save stats to Firebase cache under the correct userId (already correct) ---
        await firebaseSecure.secureWrite(`userStats/${userId}`, {
          ...calculatedStats,
          lastUpdated: Timestamp.now() // Use Firestore Timestamp for consistency
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
    // Dependency array should only include userId, as 'user' from useAuthState
    // is implicitly handled by the hook itself and 'userId' is derived from it.
  }, [userId]); 

  return { stats, loading };
};
