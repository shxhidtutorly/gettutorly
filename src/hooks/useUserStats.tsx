
import { useState, useEffect } from 'react';
import { useUser } from "@/hooks/useUser";
import { getUserStats, updateUserStat } from '@/lib/firebase-db';

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

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const firebaseStats = await getUserStats(userId);
        
        const updatedStats: UserStats = {
          materials_created: firebaseStats.materials_created?.count || 0,
          notes_created: firebaseStats.notes_created?.count || 0,
          flashcards_created: firebaseStats.flashcards_created?.count || 0,
          quizzes_created: firebaseStats.quizzes_created?.count || 0,
          quizzes_taken: firebaseStats.quizzes_taken?.count || 0,
          summaries_created: firebaseStats.summaries_created?.count || 0,
          doubts_asked: firebaseStats.doubts_asked?.count || 0,
          audio_notes_created: firebaseStats.audio_notes_created?.count || 0,
          total_study_time: firebaseStats.total_study_time?.count || 0,
        };

        setStats(updatedStats);
      } catch (err) {
        console.error('❌ Error in fetchStats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const updateStat = async (statType: keyof UserStats, increment = 1) => {
    if (!userId) return;

    try {
      await updateUserStat(userId, statType, increment);
    } catch (err) {
      console.error('❌ Error updating stat:', err);
    }
  };

  return {
    stats,
    loading,
    updateStat
  };
};
