
import { useState, useCallback, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-firestore";

interface StudySession {
  userId: string;
  sessionType: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  content?: string;
  isCompleted: boolean;
}

interface UserStats {
  quizzes_taken: number;
  summaries_created: number;
  notes_created: number;
  math_problems_solved: number;
  sessions_started: number;
  doubts_resolved: number;
  total_study_time: number;
}

export const useStudyTracking = () => {
  const [user] = useAuthState(auth);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = useMemo(() => user?.uid, [user?.uid]);

  const updateUserStats = useCallback(async (statType: keyof UserStats, incrementBy: number = 1) => {
    if (!userId) return;

    try {
      const userStatsRef = doc(db, 'user_stats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (!userStatsDoc.exists()) {
        // Initialize stats document
        const initialStats: UserStats = {
          quizzes_taken: 0,
          summaries_created: 0,
          notes_created: 0,
          math_problems_solved: 0,
          sessions_started: 0,
          doubts_resolved: 0,
          total_study_time: 0,
        };
        await setDoc(userStatsRef, initialStats);
      }
      
      await updateDoc(userStatsRef, {
        [statType]: increment(incrementBy)
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }, [userId]);

  const startSession = useCallback((sessionType: string = 'general', content?: string) => {
    if (!userId) return;

    const session: StudySession = {
      userId,
      sessionType,
      startTime: new Date(),
      duration: 0,
      content,
      isCompleted: false,
    };

    setCurrentSession(session);
    updateUserStats('sessions_started');
  }, [userId, updateUserStats]);

  const endSession = useCallback(async (sessionType?: string, content?: string, wasCompleted: boolean = true) => {
    if (!currentSession && !sessionType) return;

    const session = currentSession || {
      userId: userId!,
      sessionType: sessionType!,
      startTime: new Date(),
      duration: 0,
      content,
      isCompleted: wasCompleted,
    };

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    try {
      setIsLoading(true);
      
      // Save session to Firestore
      const sessionData = {
        ...session,
        endTime,
        duration,
        isCompleted: wasCompleted,
      };

      const sessionRef = doc(db, 'study_sessions', `${userId}_${Date.now()}`);
      await setDoc(sessionRef, sessionData);

      // Update total study time
      if (duration > 0) {
        await updateUserStats('total_study_time', duration);
      }

      setCurrentSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, userId, updateUserStats]);

  const trackQuizCompleted = useCallback(() => {
    updateUserStats('quizzes_taken');
  }, [updateUserStats]);

  const trackSummaryCreated = useCallback(() => {
    updateUserStats('summaries_created');
  }, [updateUserStats]);

  const trackNoteCreated = useCallback(() => {
    updateUserStats('notes_created');
  }, [updateUserStats]);

  const trackMathProblemSolved = useCallback(() => {
    updateUserStats('math_problems_solved');
  }, [updateUserStats]);

  const trackDoubtResolved = useCallback(() => {
    updateUserStats('doubts_resolved');
  }, [updateUserStats]);

  // Add aliases for backwards compatibility
  const trackQuizCompletion = trackQuizCompleted;
  const trackSummaryGeneration = trackSummaryCreated;
  const trackNotesCreation = trackNoteCreated;
  const trackActivity = useCallback((activityType: string, data?: any) => {
    // Generic activity tracker
    switch(activityType) {
      case 'quiz_completed':
        trackQuizCompleted();
        break;
      case 'summary_generated':
        trackSummaryCreated();
        break;
      case 'note_created':
        trackNoteCreated();
        break;
      case 'math_problem_solved':
        trackMathProblemSolved();
        break;
      case 'doubt_resolved':
        trackDoubtResolved();
        break;
      default:
        console.log('Activity tracked:', activityType, data);
    }
  }, [trackQuizCompleted, trackSummaryCreated, trackNoteCreated, trackMathProblemSolved, trackDoubtResolved]);

  return {
    currentSession,
    isLoading,
    startSession,
    endSession,
    trackQuizCompleted,
    trackSummaryCreated,
    trackNoteCreated,
    trackMathProblemSolved,
    trackDoubtResolved,
    // Aliases for backwards compatibility
    trackQuizCompletion,
    trackSummaryGeneration,
    trackNotesCreation,
    trackActivity,
  };
};
