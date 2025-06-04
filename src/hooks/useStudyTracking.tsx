
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface StudySession {
  id: string;
  type: 'summary' | 'notes' | 'quiz' | 'snap-solve';
  title: string;
  duration: number;
  timestamp: string;
  completed: boolean;
}

export interface StudyStats {
  streakDays: number;
  totalStudyHours: number;
  sessionCount: number;
  quizzesCompleted: number;
  summariesGenerated: number;
  notesCreated: number;
  snapSolveUsed: number;
  lastActivityDate: string;
}

export const useStudyTracking = () => {
  const { currentUser } = useAuth();
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [stats, setStats] = useState<StudyStats>({
    streakDays: 0,
    totalStudyHours: 0,
    sessionCount: 0,
    quizzesCompleted: 0,
    summariesGenerated: 0,
    notesCreated: 0,
    snapSolveUsed: 0,
    lastActivityDate: ''
  });

  const getStorageKey = (key: string) => `tutorly_${currentUser?.id}_${key}`;

  // Load stats from localStorage
  const loadStats = useCallback(() => {
    if (!currentUser) return;

    const savedStats = localStorage.getItem(getStorageKey('stats'));
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [currentUser]);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: StudyStats) => {
    if (!currentUser) return;
    
    localStorage.setItem(getStorageKey('stats'), JSON.stringify(newStats));
    setStats(newStats);
  }, [currentUser]);

  // Calculate and update streak
  const updateStreak = useCallback(() => {
    if (!currentUser) return;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    setStats(prev => {
      let newStreakDays = prev.streakDays;
      
      if (prev.lastActivityDate === today) {
        // Already active today, no change
        return prev;
      } else if (prev.lastActivityDate === yesterday) {
        // Consecutive day, increment streak
        newStreakDays = prev.streakDays + 1;
      } else if (prev.lastActivityDate !== today) {
        // Streak broken or first time, reset to 1
        newStreakDays = 1;
      }

      const newStats = {
        ...prev,
        streakDays: newStreakDays,
        lastActivityDate: today
      };
      
      saveStats(newStats);
      return newStats;
    });
  }, [currentUser, saveStats]);

  // Start session tracking
  const startSession = useCallback(() => {
    setSessionStartTime(Date.now());
    updateStreak();
  }, [updateStreak]);

  // End session and calculate duration
  const endSession = useCallback((type: StudySession['type'], title: string, completed = true) => {
    if (!sessionStartTime || !currentUser) return;

    const duration = Math.round((Date.now() - sessionStartTime) / 1000 / 60); // minutes
    const session: StudySession = {
      id: Date.now().toString(),
      type,
      title,
      duration,
      timestamp: new Date().toISOString(),
      completed
    };

    // Save session to localStorage
    const sessionsKey = getStorageKey('sessions');
    const savedSessions = localStorage.getItem(sessionsKey);
    const sessions = savedSessions ? JSON.parse(savedSessions) : [];
    sessions.push(session);
    localStorage.setItem(sessionsKey, JSON.stringify(sessions));

    // Update stats
    setStats(prev => {
      const newStats = {
        ...prev,
        sessionCount: prev.sessionCount + 1,
        totalStudyHours: prev.totalStudyHours + (duration / 60)
      };
      
      saveStats(newStats);
      return newStats;
    });

    setSessionStartTime(null);
    return session;
  }, [sessionStartTime, currentUser, saveStats]);

  // Track specific activities
  const trackQuizCompletion = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, quizzesCompleted: prev.quizzesCompleted + 1 };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  const trackSummaryGeneration = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, summariesGenerated: prev.summariesGenerated + 1 };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  const trackNotesCreation = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, notesCreated: prev.notesCreated + 1 };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  const trackSnapSolveUsage = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, snapSolveUsed: prev.snapSolveUsed + 1 };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Get all sessions
  const getSessions = useCallback((): StudySession[] => {
    if (!currentUser) return [];
    
    const sessionsKey = getStorageKey('sessions');
    const savedSessions = localStorage.getItem(sessionsKey);
    return savedSessions ? JSON.parse(savedSessions) : [];
  }, [currentUser]);

  // Initialize on user login
  useEffect(() => {
    if (currentUser) {
      loadStats();
      startSession(); // Start tracking when component mounts
    }
  }, [currentUser, loadStats, startSession]);

  return {
    stats,
    startSession,
    endSession,
    trackQuizCompletion,
    trackSummaryGeneration,
    trackNotesCreation,
    trackSnapSolveUsage,
    getSessions,
    isSessionActive: sessionStartTime !== null
  };
};
