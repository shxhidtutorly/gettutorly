
import { useState, useEffect } from 'react';

interface StudyStats {
  streakDays: number;
  totalStudyHours: number;
  sessionCount: number;
  quizzesCompleted: number;
  summariesGenerated: number;
  notesCreated: number;
}

export const useStudyTracking = () => {
  const [stats, setStats] = useState<StudyStats>({
    streakDays: 0,
    totalStudyHours: 0,
    sessionCount: 0,
    quizzesCompleted: 0,
    summariesGenerated: 0,
    notesCreated: 0,
  });

  const [currentSession, setCurrentSession] = useState<{
    startTime: Date;
    activity: string;
  } | null>(null);

  // Load stats from localStorage on mount
  useEffect(() => {
    loadStats();
    updateStreak();
  }, []);

  const loadStats = () => {
    const savedStats = localStorage.getItem('tutorly-study-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const saveStats = (newStats: StudyStats) => {
    localStorage.setItem('tutorly-study-stats', JSON.stringify(newStats));
    setStats(newStats);
  };

  const updateStreak = () => {
    const lastActiveDate = localStorage.getItem('tutorly-last-active');
    const today = new Date().toDateString();
    
    if (lastActiveDate === today) {
      return; // Already active today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActiveDate === yesterday.toDateString()) {
      // Consecutive day - increment streak
      setStats(prev => {
        const newStats = { ...prev, streakDays: prev.streakDays + 1 };
        saveStats(newStats);
        return newStats;
      });
    } else if (lastActiveDate !== today) {
      // Streak broken - reset to 1
      setStats(prev => {
        const newStats = { ...prev, streakDays: 1 };
        saveStats(newStats);
        return newStats;
      });
    }

    localStorage.setItem('tutorly-last-active', today);
  };

  const startSession = (activity: string = 'study') => {
    setCurrentSession({
      startTime: new Date(),
      activity
    });
  };

  const endSession = (activity: string, details: string, completed: boolean = true) => {
    if (currentSession) {
      const endTime = new Date();
      const duration = (endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60 * 60); // hours
      
      setStats(prev => {
        const newStats = {
          ...prev,
          totalStudyHours: prev.totalStudyHours + duration,
          sessionCount: prev.sessionCount + 1
        };
        saveStats(newStats);
        return newStats;
      });

      // Store session data
      const session = {
        activity,
        details,
        duration: duration * 60, // minutes
        timestamp: new Date().toISOString(),
        completed
      };

      const sessions = JSON.parse(localStorage.getItem('tutorly-sessions') || '[]');
      sessions.push(session);
      localStorage.setItem('tutorly-sessions', JSON.stringify(sessions));

      setCurrentSession(null);
    }
  };

  const trackQuizCompletion = () => {
    setStats(prev => {
      const newStats = { ...prev, quizzesCompleted: prev.quizzesCompleted + 1 };
      saveStats(newStats);
      return newStats;
    });
  };

  const trackSummaryGeneration = () => {
    setStats(prev => {
      const newStats = { ...prev, summariesGenerated: prev.summariesGenerated + 1 };
      saveStats(newStats);
      return newStats;
    });
  };

  const trackNotesCreation = () => {
    setStats(prev => {
      const newStats = { ...prev, notesCreated: prev.notesCreated + 1 };
      saveStats(newStats);
      return newStats;
    });
  };

  return {
    stats,
    startSession,
    endSession,
    trackQuizCompletion,
    trackSummaryGeneration,
    trackNotesCreation
  };
};
