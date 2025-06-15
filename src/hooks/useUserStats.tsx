
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  materials_created: number;
  notes_created: number;
  flashcards_created: number;
  quizzes_created: number;
  quizzes_taken: number;
  summaries_created: number;
  doubts_asked: number;
  audio_notes_created: number;
  total_study_time: number;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    materials_created: 0,
    notes_created: 0,
    flashcards_created: 0,
    quizzes_created: 0,
    quizzes_taken: 0,
    summaries_created: 0,
    doubts_asked: 0,
    audio_notes_created: 0,
    total_study_time: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('stat_type, count')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching stats:', error);
          return;
        }

        const statsMap: Partial<UserStats> = {};
        data?.forEach(stat => {
          statsMap[stat.stat_type as keyof UserStats] = stat.count;
        });

        setStats(prev => ({ ...prev, ...statsMap }));
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_stats_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_stats',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Stats updated:', payload);
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateStat = async (statType: keyof UserStats, increment: number = 1) => {
    if (!user) return;

    try {
      await supabase.rpc('update_user_stat', {
        p_user_id: user.id,
        p_stat_type: statType,
        p_increment: increment
      });
    } catch (error) {
      console.error('Error updating stat:', error);
    }
  };

  return { stats, loading, updateStat };
};
