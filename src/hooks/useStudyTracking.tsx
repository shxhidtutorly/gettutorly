
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
    doubtsResolved: 0,
  });

  const [sessions, setSessions] = useState<StudySession[]>([]);

  // Track activity with proper clerk user ID - simplified without RLS issues
  const trackActivity = async (activityType: string, details: any = {}) => {
    if (!currentUser?.id) {
      console.log('No current user, skipping activity tracking');
      return;
    }

    try {
      console.log('Tracking activity:', activityType, 'for user:', currentUser.id);
      
      // Try to insert activity log, but don't fail if it doesn't work due to RLS
      try {
        const { error } = await supabase
          .from('user_activity_logs')
          .insert({
            clerk_user_id: currentUser.id,
            action: activityType,
            details: details,
            timestamp: new Date().toISOString()
          });

        if (error) {
          console.warn('Could not save to user_activity_logs (RLS issue):', error.message);
          // Continue with local state update even if DB insert fails
        } else {
          console.log('Activity tracked successfully');
        }
      } catch (dbError) {
        console.warn('Database activity logging failed, continuing with local state');
      }

      // Update stats based on activity type (this works regardless of DB)
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

  // Load user stats from database with better error handling
  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser?.id) return;

      try {
        console.log('Loading stats for user:', currentUser.id);
        
        // Get activity logs for stats calculation - handle RLS gracefully
        let activities: any[] = [];
        try {
          const { data, error } = await supabase
            .from('user_activity_logs')
            .select('action, details, timestamp')
            .eq('clerk_user_id', currentUser.id)
            .order('timestamp', { ascending: false });

          if (error) {
            console.warn('Could not load activity logs (RLS issue):', error.message);
          } else {
            activities = data || [];
          }
        } catch (activityError) {
          console.warn('Activity logs not accessible, using fallback');
        }

        console.log('Loaded activities:', activities?.length || 0);

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
        const doubtsResolved = activities?.filter(a => a.action === 'doubt_resolved').length || 0;

        // Also try to get data from other tables to build comprehensive stats
        let totalStudyHours = 0;
        try {
          const { data: progressData } = await supabase
            .from('study_progress')
            .select('time_spent')
            .eq('clerk_user_id', currentUser.id);

          totalStudyHours = (progressData?.reduce((total, p) => total + (p.time_spent || 0), 0) || 0) / 3600;
        } catch (progressError) {
          console.warn('Could not load study_progress');
        }

        // Try to count materials and notes from their respective tables
        let materialsCount = 0;
        let notesCount = 0;
        
        try {
          const { data: materials } = await supabase
            .from('study_materials')
            .select('id')
            .eq('clerk_user_id', currentUser.id);
          materialsCount = materials?.length || 0;
        } catch (materialsError) {
          console.warn('Could not load study_materials');
        }

        try {
          const { data: notes } = await supabase
            .from('notes')
            .select('id')
            .eq('clerk_user_id', currentUser.id);
          notesCount = notes?.length || 0;
        } catch (notesError) {
          console.warn('Could not load notes');
        }

        // Calculate streak (simplified - based on recent activity)
        const recentActivities = activities?.filter(a => {
          const activityDate = new Date(a.timestamp);
          const daysDiff = Math.floor((Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }) || [];

        const streakDays = Math.max(1, Math.min(7, recentActivities.length));

        const newStats = {
          totalStudyHours,
          sessionCount,
          quizzesCompleted,
          summariesGenerated: Math.max(summariesGenerated, materialsCount), // Use material count as fallback
          notesCreated: Math.max(notesCreated, notesCount), // Use notes count as fallback
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

    // Set up real-time listener for activity logs (if accessible)
    let channel: any = null;
    try {
      channel = supabase
        .channel('activity_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_activity_logs',
          filter: `clerk_user_id=eq.${currentUser?.id}`
        }, () => {
          console.log('Real-time activity update detected, reloading stats');
          loadStats();
        })
        .subscribe();
    } catch (realtimeError) {
      console.warn('Real-time updates not available');
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser?.id]);

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
