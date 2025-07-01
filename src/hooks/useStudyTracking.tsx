
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from 'react';
import { 
  createStudySession, 
  updateStudySession, 
  getUserStudySessions, 
  updateUserStat, 
  getUserStats,
  subscribeToUserStats 
} from '@/lib/firebase-firestore';

interface StudyStats {
  totalStudyHours: number;
  sessionCount: number;
  quizzesCompleted: number;
  summariesGenerated: number;
  notesCreated: number;
  mathProblemsSolved: number;
  streakDays: number;
  doubtsResolved: number;
}

export interface StudySession {
  id: string;
  type: string;
  title: string;
  completed: boolean;
  date: string;
  timestamp: string;
  duration: number;
}

interface UserStatsData {
  quizzes_taken?: { count: number };
  summaries_created?: { count: number };
  notes_created?: { count: number };
  math_problems_solved?: { count: number };
  sessions_started?: { count: number };
  doubts_resolved?: { count: number };
  total_study_time?: { count: number };
}

export const useStudyTracking = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<StudyStats>({
    totalStudyHours: 0,
    sessionCount: 0,
    quizzesCompleted: 0,
    summariesGenerated: 0,
    notesCreated: 0,
    mathProblemsSolved: 0,
    streakDays: 1,
    doubtsResolved: 0,
  });

  const [sessions, setSessions] = useState<StudySession[]>([]);

  // Track activity using Firebase Firestore
  const trackActivity = async (activityType: string, details: any = {}) => {
    if (!user?.id) {
      console.log('No current user, skipping activity tracking');
      return;
    }

    try {
      console.log('Tracking activity:', activityType, 'for user:', user.id);
      
      // Create a study session entry
      try {
        await createStudySession(user.id, {
          session_type: activityType,
          duration: details.duration || 0,
          material_id: details.material_id || null,
        });

        console.log('Activity tracked successfully');
      } catch (dbError) {
        console.warn('Database activity logging failed, continuing with local state');
      }

      // Update stats based on activity type
      setStats(prev => {
        const updated = { ...prev };
        
        switch (activityType) {
          case 'quiz_completed':
            updated.quizzesCompleted += 1;
            break;
          case 'summary_generated':
            updated.summariesGenerated += 1;
            break;
          case 'notes_created':
          case 'ai_notes_generated':
            updated.notesCreated += 1;
            break;
          case 'math_problem_solved':
            updated.mathProblemsSolved += 1;
            break;
          case 'study_session_started':
            updated.sessionCount += 1;
            break;
          case 'doubt_resolved':
            updated.doubtsResolved += 1;
            break;
        }
        
        return updated;
      });

    } catch (error) {
      console.error('Error in trackActivity:', error);
    }
  };

  // Wrapper functions for compatibility
  const trackSummaryGeneration = () => trackActivity('summary_generated');
  const trackQuizCompletion = () => trackActivity('quiz_completed');
  const trackNotesCreation = () => trackActivity('notes_created');
  const trackMathProblemSolved = () => trackActivity('math_problem_solved');

  const startSession = () => trackActivity('study_session_started');
  const endSession = (type: string, title: string, completed: boolean) => {
    trackActivity('study_session_ended', { type, title, completed });
  };

  const addSession = (sessionData: any) => {
    trackActivity('study_session_added', sessionData);
    const newSession: StudySession = {
      id: Date.now().toString(),
      type: sessionData.type || 'study',
      title: sessionData.title || 'Study Session',
      completed: sessionData.completed || false,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      duration: sessionData.duration || 30
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const getSessions = () => sessions;

  // Load user stats from Firebase Firestore
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;

      try {
        console.log('Loading stats for user:', user.id);
        
        const statsData: UserStatsData = await getUserStats(user.id) || {};
        console.log('Loaded stats:', statsData);

        // Calculate stats from Firebase data with safe property access
        const quizzesCompleted = statsData.quizzes_taken?.count || 0;
        const summariesGenerated = statsData.summaries_created?.count || 0;
        const notesCreated = statsData.notes_created?.count || 0;
        const mathProblemsSolved = statsData.math_problems_solved?.count || 0;
        const sessionCount = statsData.sessions_started?.count || 0;
        const doubtsResolved = statsData.doubts_resolved?.count || 0;
        const totalStudyHours = (statsData.total_study_time?.count || 0) / 3600;

        // Calculate streak (simplified - based on recent activity)
        const streakDays = Math.max(1, Math.min(7, sessionCount));

        const newStats = {
          totalStudyHours,
          sessionCount,
          quizzesCompleted,
          summariesGenerated,
          notesCreated,
          mathProblemsSolved,
          streakDays,
          doubtsResolved,
        };

        console.log('Calculated stats:', newStats);
        setStats(newStats);

      } catch (error) {
        console.error('Error loading user stats:', error);
        // Set some default stats so user doesn't see all zeros
        setStats(prev => ({
          ...prev,
          streakDays: 1,
        }));
      }
    };

    loadStats();

    // Set up real-time listener for stats
    let unsubscribe: (() => void) | null = null;
    if (user?.id) {
      try {
        unsubscribe = subscribeToUserStats(user.id, (updatedStats) => {
          console.log('Real-time stats update detected, updating state');
          
          const statsData: UserStatsData = updatedStats || {};
          const quizzesCompleted = statsData.quizzes_taken?.count || 0;
          const summariesGenerated = statsData.summaries_created?.count || 0;
          const notesCreated = statsData.notes_created?.count || 0;
          const mathProblemsSolved = statsData.math_problems_solved?.count || 0;
          const sessionCount = statsData.sessions_started?.count || 0;
          const doubtsResolved = statsData.doubts_resolved?.count || 0;
          const totalStudyHours = (statsData.total_study_time?.count || 0) / 3600;
          const streakDays = Math.max(1, Math.min(7, sessionCount));

          setStats({
            totalStudyHours,
            sessionCount,
            quizzesCompleted,
            summariesGenerated,
            notesCreated,
            mathProblemsSolved,
            streakDays,
            doubtsResolved,
          });
        });
      } catch (realtimeError) {
        console.warn('Real-time updates not available');
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id]);

  return {
    stats,
    trackActivity,
    trackSummaryGeneration,
    trackQuizCompletion, 
    trackNotesCreation,
    trackMathProblemSolved,
    startSession,
    endSession,
    addSession,
    getSessions,
  };
};
