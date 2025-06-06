import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface StudySession {
  id: string;
  type: 'notes' | 'summary' | 'quiz' | 'doubt-chain' | 'math';
  title: string;
  duration: number; // in minutes
  timestamp: string;
  completed: boolean;
}

export interface StudyStats {
  totalStudyHours: number;
  sessionCount: number;
  streakDays: number;
  quizzesCompleted: number;
  summariesGenerated: number;
  notesCreated: number;
  doubtsResolved: number;
  conceptsUnderstood: number;
  mathProblemsSolved: number;
  weeklyGoalProgress: number; // out of 20 concepts
}

export interface DailyUsage {
  date: string;
  timeSpent: number; // in minutes
  activeSessions: number;
}

export const useStudyTracking = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StudyStats>({
    totalStudyHours: 0,
    sessionCount: 0,
    streakDays: 0,
    quizzesCompleted: 0,
    summariesGenerated: 0,
    notesCreated: 0,
    doubtsResolved: 0,
    conceptsUnderstood: 0,
    mathProblemsSolved: 0,
    weeklyGoalProgress: 0
  });
  
  const [currentSession, setCurrentSession] = useState<{
    startTime: number;
    type?: string;
    title?: string;
  } | null>(null);

  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);

  // Load stats from localStorage
  const loadStats = useCallback(() => {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    const savedStats = localStorage.getItem(`study_stats_${userId}`);
    const savedUsage = localStorage.getItem(`daily_usage_${userId}`);
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    if (savedUsage) {
      setDailyUsage(JSON.parse(savedUsage));
    }
  }, [currentUser]);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: StudyStats) => {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    localStorage.setItem(`study_stats_${userId}`, JSON.stringify(newStats));
    setStats(newStats);
  }, [currentUser]);

  // Save daily usage
  const saveDailyUsage = useCallback((newUsage: DailyUsage[]) => {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    localStorage.setItem(`daily_usage_${userId}`, JSON.stringify(newUsage));
    setDailyUsage(newUsage);
  }, [currentUser]);

  // Track time spent in app
  const updateDailyUsage = useCallback((timeSpent: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    setDailyUsage(prev => {
      const existingIndex = prev.findIndex(usage => usage.date === today);
      const newUsage = [...prev];
      
      if (existingIndex >= 0) {
        newUsage[existingIndex].timeSpent += timeSpent;
        newUsage[existingIndex].activeSessions += 1;
      } else {
        newUsage.push({
          date: today,
          timeSpent,
          activeSessions: 1
        });
      }
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const filtered = newUsage.filter(usage => 
        new Date(usage.date) > thirtyDaysAgo
      );
      
      saveDailyUsage(filtered);
      return filtered;
    });
  }, [saveDailyUsage]);

  // Calculate streak
  const calculateStreak = useCallback(() => {
    const sortedUsage = [...dailyUsage].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedUsage.length; i++) {
      const usageDate = new Date(sortedUsage[i].date);
      const diffDays = Math.floor((today.getTime() - usageDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [dailyUsage]);

  // Start a study session
  const startSession = useCallback(() => {
    const now = Date.now();
    setCurrentSession({ startTime: now });
    
    // Track visibility changes to pause/resume timing
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is hidden, pause session
        setCurrentSession(prev => prev ? { ...prev, pausedAt: Date.now() } : null);
      } else {
        // App is visible, resume session
        setCurrentSession(prev => {
          if (prev && 'pausedAt' in prev) {
            const { pausedAt, ...sessionWithoutPause } = prev as any;
            return sessionWithoutPause;
          }
          return prev;
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // End a study session
  const endSession = useCallback((type: string, title: string, completed: boolean) => {
    if (!currentSession) return;
    
    const duration = Math.round((Date.now() - currentSession.startTime) / (1000 * 60)); // minutes
    
    // Update daily usage
    updateDailyUsage(duration);
    
    // Update stats
    const newStats = { ...stats };
    newStats.totalStudyHours += duration / 60;
    newStats.sessionCount += 1;
    newStats.streakDays = calculateStreak();
    
    saveStats(newStats);
    setCurrentSession(null);
    
    // Save session to history
    const session: StudySession = {
      id: Date.now().toString(),
      type: type as any,
      title,
      duration,
      timestamp: new Date().toISOString(),
      completed
    };
    
    if (currentUser) {
      const userId = currentUser.id;
      const existingSessions = JSON.parse(localStorage.getItem(`sessions_${userId}`) || '[]');
      const newSessions = [session, ...existingSessions].slice(0, 100); // Keep last 100
      localStorage.setItem(`sessions_${userId}`, JSON.stringify(newSessions));
    }
  }, [currentSession, stats, updateDailyUsage, calculateStreak, saveStats, currentUser]);

  // Tracking functions for different activities
  const trackQuizCompletion = useCallback(() => {
    const newStats = { ...stats, quizzesCompleted: stats.quizzesCompleted + 1 };
    saveStats(newStats);
  }, [stats, saveStats]);

  const trackSummaryGeneration = useCallback(() => {
    const newStats = { ...stats, summariesGenerated: stats.summariesGenerated + 1 };
    saveStats(newStats);
  }, [stats, saveStats]);

  const trackNotesCreation = useCallback(() => {
    const newStats = { ...stats, notesCreated: stats.notesCreated + 1 };
    saveStats(newStats);
  }, [stats, saveStats]);

  const trackDoubtResolved = useCallback(() => {
    const newStats = { ...stats, doubtsResolved: stats.doubtsResolved + 1 };
    saveStats(newStats);
  }, [stats, saveStats]);

  const trackConceptUnderstood = useCallback(() => {
    const newStats = { 
      ...stats, 
      conceptsUnderstood: stats.conceptsUnderstood + 1,
      weeklyGoalProgress: Math.min(20, stats.weeklyGoalProgress + 1)
    };
    saveStats(newStats);
  }, [stats, saveStats]);

  const trackMathProblemSolved = useCallback(() => {
    const newStats = { ...stats, mathProblemsSolved: stats.mathProblemsSolved + 1 };
    saveStats(newStats);
  }, [stats, saveStats]);

  // Get sessions
  const getSessions = useCallback((): StudySession[] => {
    if (!currentUser) return [];
    
    const userId = currentUser.id;
    const sessions = JSON.parse(localStorage.getItem(`sessions_${userId}`) || '[]');
    return sessions.map((session: any) => ({
      ...session,
      timestamp: new Date(session.timestamp).toISOString()
    }));
  }, [currentUser]);

  // Get last 7 days usage
  const getWeeklyUsage = useCallback(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(date => {
      const usage = dailyUsage.find(u => u.date === date);
      return {
        date,
        timeSpent: usage?.timeSpent || 0,
        activeSessions: usage?.activeSessions || 0
      };
    });
  }, [dailyUsage]);

  // Load stats on mount and user change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Update streak calculation when daily usage changes
  useEffect(() => {
    if (dailyUsage.length > 0) {
      const newStreak = calculateStreak();
      if (newStreak !== stats.streakDays) {
        const newStats = { ...stats, streakDays: newStreak };
        saveStats(newStats);
      }
    }
  }, [dailyUsage, calculateStreak, stats, saveStats]);

  return {
    stats,
    dailyUsage,
    currentSession,
    startSession,
    endSession,
    trackQuizCompletion,
    trackSummaryGeneration,
    trackNotesCreation,
    trackDoubtResolved,
    trackConceptUnderstood,
    trackMathProblemSolved,
    getSessions,
    getWeeklyUsage
  };
};
