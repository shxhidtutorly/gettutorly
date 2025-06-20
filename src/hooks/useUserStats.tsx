import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
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

const defaultStats: UserStats = {
  materials_created: 0,
  notes_created: 0,
  flashcards_created: 0,
  quizzes_created: 0,
  quizzes_taken: 0,
  summaries_created: 0,
  doubts_asked: 0,
  audio_notes_created: 0,
  total_study_time: 0,
};

export const useUserStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('stat_type, count')
          .eq('user_id', user.id); // Clerk ID as TEXT

        if (error) {
          console.error('❌ Error fetching stats:', error);
          return;
        }

        const statsMap: Partial<UserStats> = {};

        data?.forEach(stat => {
          if (stat.stat_type in defaultStats) {
            statsMap[stat.stat_type as keyof UserStats] = stat.count;
          }
        });

        setStats(prev => ({ ...prev, ...statsMap }));
      } catch (err) {
        console.error('❌ Error in fetchStats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log("🔁 Real-time update received. Refetching stats...");
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const updateStat = async (statType: keyof UserStats, increment = 1) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('update_user_stat', {
        p_user_id: user.id,
        p_stat_type: statType,
        p_increment: increment
      });

      if (error) {
        console.error('❌ Error updating stat:', error);
      }
    } catch (err) {
      console.error('❌ Error calling update_user_stat RPC:', err);
    }
  };

  return {
    stats,
    loading,
    updateStat
  };
};
