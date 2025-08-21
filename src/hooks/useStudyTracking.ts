import { useState, useCallback, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase-firestore";
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

// ----------------- Types -----------------
interface StudySession {
  userId: string;
  sessionType: string;
  activity?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
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

// ----------------- Hook -----------------
export const useStudyTracking = () => {
  const [user] = useAuthState(auth);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = useMemo(() => user?.uid, [user?.uid]);

  // -------- Update user stats --------
  const updateUserStats = useCallback(
    async (statType: keyof UserStats, incrementBy: number = 1) => {
      if (!userId) return;
      try {
        const userStatsRef = doc(db, "user_stats", userId);
        const userStatsDoc = await getDoc(userStatsRef);

        if (!userStatsDoc.exists()) {
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
          [statType]: increment(incrementBy),
        });
      } catch (err) {
        console.error("Error updating user stats:", err);
      }
    },
    [userId]
  );

  // -------- Start a session --------
  const startSession = useCallback(
    (sessionType: string = "general", content?: string) => {
      if (!userId) return;

      const session: StudySession = {
        userId,
        sessionType,
        activity: content,
        startTime: new Date(),
        duration: 0,
        isCompleted: false,
      };

      setCurrentSession(session);
      updateUserStats("sessions_started");
    },
    [userId, updateUserStats]
  );

  // -------- End a session (quiz calls this) --------
  const endSession = useCallback(
    async (sessionType?: string, activity?: string, wasCompleted: boolean = true) => {
      if (!userId) throw new Error("No user logged in");

      const session = currentSession || {
        userId,
        sessionType: sessionType || "general",
        activity: activity || null, // fallback instead of undefined
        startTime: new Date(),
        duration: 0,
        isCompleted: wasCompleted,
      };

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000); // seconds

      try {
        setIsLoading(true);

        const sessionData = {
          ...session,
          endTime,
          duration,
          isCompleted: wasCompleted,
          createdAt: serverTimestamp(),
        };

        const sessionRef = doc(db, "study_sessions", `${userId}_${Date.now()}`);
        await setDoc(sessionRef, sessionData);

        if (duration > 0) {
          await updateUserStats("total_study_time", duration);
        }

        setCurrentSession(null);
      } catch (err) {
        console.error("Error ending session:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, userId, updateUserStats]
  );

  // -------- Tracking helpers --------
  const trackQuizCompleted = useCallback(() => updateUserStats("quizzes_taken"), [updateUserStats]);
  const trackSummaryCreated = useCallback(() => updateUserStats("summaries_created"), [updateUserStats]);
  const trackNoteCreated = useCallback(() => updateUserStats("notes_created"), [updateUserStats]);
  const trackMathProblemSolved = useCallback(() => updateUserStats("math_problems_solved"), [updateUserStats]);
  const trackDoubtResolved = useCallback(() => updateUserStats("doubts_resolved"), [updateUserStats]);

  const trackActivity = useCallback(
    (activityType: string) => {
      switch (activityType) {
        case "quiz_completed":
          trackQuizCompleted();
          break;
        case "summary_generated":
          trackSummaryCreated();
          break;
        case "note_created":
          trackNoteCreated();
          break;
        case "math_problem_solved":
          trackMathProblemSolved();
          break;
        case "doubt_resolved":
          trackDoubtResolved();
          break;
      }
    },
    [trackQuizCompleted, trackSummaryCreated, trackNoteCreated, trackMathProblemSolved, trackDoubtResolved]
  );

  // -------- Return API --------
  return {
    currentSession,
    isLoading,
    isSessionActive: !!currentSession,
    startSession,
    endSession,
    trackQuizCompleted,
    trackSummaryCreated,
    trackNoteCreated,
    trackMathProblemSolved,
    trackDoubtResolved,
    trackActivity,
  };
};
