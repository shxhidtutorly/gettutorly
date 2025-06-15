
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
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
  const { user } = useAuth();
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

  // Track activity using study_sessions table
  const trackActivity = async (activityType: string, details: any = {}) => {
    if (!user?.id) {
      console.log('No current user, skipping activity tracking');
      return;
    }

    try {
      console.log('Tracking activity:', activityType, 'for user:', user.id);
      
      // Create a study session entry
      try {
        const { error } = await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            session_type: activityType,
            duration: details.duration || 0,
            material_id: details.material_id || null,
            started_at: new Date().toISOString()
          });

        if (error) {
          console.warn('Could not save to study_sessions:', error.message);
        } else {
          console.log('Activity tracked successfully');
        }
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

  // Load user stats from database with better error handling
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;

      try {
        console.log('Loading stats for user:', user.id);
        
        // Get study sessions for stats calculation
        let sessions: any[] = [];
        try {
          const { data, error } = await supabase
            .from('study_sessions')
            .select('session_type, duration, started_at')
            .eq('user_id', user.id)
            .order('started_at', { ascending: false });

          if (error) {
            console.warn('Could not load study sessions:', error.message);
          } else {
            sessions = data || [];
          }
        } catch (sessionError) {
          console.warn('Study sessions not accessible, using fallback');
        }

        console.log('Loaded sessions:', sessions?.length || 0);

        // Calculate stats from sessions
        const quizzesCompleted = sessions?.filter(s => s.session_type === 'quiz_completed').length || 0;
        const summariesGenerated = sessions?.filter(s => s.session_type === 'summary_generated').length || 0;
        const notesCreated = sessions?.filter(s => 
          s.session_type === 'notes_created' || 
          s.session_type === 'ai_notes_generated' ||
          s.session_type === 'material_uploaded'
        ).length || 0;
        const mathProblemsSolved = sessions?.filter(s => s.session_type === 'math_problem_solved').length || 0;
        const sessionCount = sessions?.filter(s => s.session_type === 'study_session_started').length || 0;
        const doubtsResolved = sessions?.filter(s => s.session_type === 'doubt_resolved').length || 0;

        // Calculate total study time from sessions
        const totalStudyHours = (sessions?.reduce((total, s) => total + (s.duration || 0), 0) || 0) / 3600;

        // Try to count materials and notes from their respective tables
        let materialsCount = 0;
        let notesCount = 0;
        
        try {
          const { data: materials } = await supabase
            .from('study_materials')
            .select('id')
            .eq('user_id', user.id);
          materialsCount = materials?.length || 0;
        } catch (materialsError) {
          console.warn('Could not load study_materials');
        }

        try {
          const { data: notes } = await supabase
            .from('notes')
            .select('id')
            .eq('user_id', user.id);
          notesCount = notes?.length || 0;
        } catch (notesError) {
          console.warn('Could not load notes');
        }

        // Calculate streak (simplified - based on recent activity)
        const recentSessions = sessions?.filter(s => {
          const sessionDate = new Date(s.started_at);
          const daysDiff = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }) || [];

        const streakDays = Math.max(1, Math.min(7, recentSessions.length));

        const newStats = {
          totalStudyHours,
          sessionCount,
          quizzesCompleted,
          summariesGenerated: Math.max(summariesGenerated, materialsCount),
          notesCreated: Math.max(notesCreated, notesCount),
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

    // Set up real-time listener for study sessions
    let channel: any = null;
    try {
      channel = supabase
        .channel('session_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `user_id=eq.${user?.id}`
        }, () => {
          console.log('Real-time session update detected, reloading stats');
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
