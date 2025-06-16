
import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react"; // Renamed for clarity
import { useSupabase } from "@/lib/supabase"; // Import the new hook

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
  const { user } = useClerkAuth(); // Use Clerk's useAuth
  const supabase = useSupabase(); // Use the new Supabase hook
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
    if (!user || !supabase) { // Add supabase check
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      if (!supabase) return; // Ensure supabase is available for fetch
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
    let channel: any = null;
    if (supabase && user) { // Check supabase and user before subscribing
      channel = supabase
        .channel('user_stats_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Stats updated:', payload);
          fetchStats(); // fetchStats itself checks for supabase
        })
        .subscribe();
    }

    return () => {
      if (supabase && channel) { // Check supabase before removing channel
        supabase.removeChannel(channel);
      }
    };
  }, [user, supabase]); // Add supabase to dependency array

  const updateStat = async (statType: keyof UserStats, increment: number = 1) => {
    if (!user || !supabase) return; // Add supabase check

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
