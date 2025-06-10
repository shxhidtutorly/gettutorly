import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StudyStats {
  totalStudyHours: number;
  sessionCount: number;
  quizzesCompleted: number;
  summariesGenerated: number;
  notesCreated: number;
  mathProblemsSolved: number;
  streakDays: number;
}

export interface StudySession {
  id: string;
  type: string;
  title: string;
  completed: boolean;
  date: string;
}

export const useStudyTracking = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StudyStats>({
    totalStudyHours: 0,
    sessionCount: 0,
    quizzesCompleted: 0,
    summariesGenerated: 0,
    notesCreated: 0,
    mathProblemsSolved: 0,
    streakDays: 1,
  });

  const [sessions, setSessions] = useState<StudySession[]>([]);

  // Track activity
  const trackActivity = async (activityType: string, details: any = {}) => {
    if (!currentUser?.clerkUserId) return; // Use clerkUserId instead of id

    try {
      // Insert activity log
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          clerk_user_id: currentUser.clerkUserId, // Use clerk_user_id
          action: activityType,
          details: details,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking activity:', error);
        return;
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
      date: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const getSessions = () => sessions;

  // Load user stats
  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser?.clerkUserId) return; // Use clerkUserId instead of id

      try {
        // Get activity logs for stats calculation
        const { data: activities, error } = await supabase
          .from('user_activity_logs')
          .select('action, details, timestamp')
          .eq('clerk_user_id', currentUser.clerkUserId) // Use clerk_user_id
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error loading stats:', error);
          return;
        }

        // Calculate stats from activities
        const quizzesCompleted = activities?.filter(a => a.action === 'quiz_completed').length || 0;
        const summariesGenerated = activities?.filter(a => a.action === 'summary_generated').length || 0;
        const notesCreated = activities?.filter(a => 
          a.action === 'notes_created' || 
          a.action === 'ai_notes_generated' ||
          a.action === 'material_uploaded'
        ).length || 0;
        const mathProblemsSolved = activities?.filter(a => a.action === 'math_problem_solved').length || 0;
        const sessionCount = activities?.filter(a => a.action === 'study_session_started').length || 0;

        // Calculate study time from progress records
        const { data: progressData } = await supabase
          .from('study_progress')
          .select('time_spent')
          .eq('clerk_user_id', currentUser.clerkUserId); // Use clerk_user_id

        const totalStudyHours = (progressData?.reduce((total, p) => total + (p.time_spent || 0), 0) || 0) / 3600;

        // Calculate streak (simplified - just based on recent activity)
        const recentActivities = activities?.filter(a => {
          const activityDate = new Date(a.timestamp);
          const daysDiff = Math.floor((Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }) || [];

        const streakDays = Math.max(1, Math.min(7, recentActivities.length));

        setStats({
          totalStudyHours,
          sessionCount,
          quizzesCompleted,
          summariesGenerated,
          notesCreated,
          mathProblemsSolved,
          streakDays,
        });

      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };

    loadStats();
  }, [currentUser?.clerkUserId]); // Use clerkUserId instead of id

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
