
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { getUserStats, subscribeToUserStats } from '@/lib/firebase-firestore';

interface UserStats {
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
  const { user } = useUser();
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
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        const userStats = await getUserStats(user.id);
        
        const formattedStats: UserStats = {
          materials_created: userStats.materials_created?.count || 0,
          notes_created: userStats.notes_created?.count || 0,
          flashcards_created: userStats.flashcards_created?.count || 0,
          quizzes_created: userStats.quizzes_created?.count || 0,
          quizzes_taken: userStats.quizzes_taken?.count || 0,
          summaries_created: userStats.summaries_created?.count || 0,
          doubts_asked: userStats.doubts_asked?.count || 0,
          audio_notes_created: userStats.audio_notes_created?.count || 0,
          total_study_time: userStats.total_study_time?.count || 0,
        };
        
        setStats(formattedStats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Set up real-time subscription
    const unsubscribe = subscribeToUserStats(user.id, (updatedStats) => {
      const formattedStats: UserStats = {
        materials_created: updatedStats.materials_created?.count || 0,
        notes_created: updatedStats.notes_created?.count || 0,
        flashcards_created: updatedStats.flashcards_created?.count || 0,
        quizzes_created: updatedStats.quizzes_created?.count || 0,
        quizzes_taken: updatedStats.quizzes_taken?.count || 0,
        summaries_created: updatedStats.summaries_created?.count || 0,
        doubts_asked: updatedStats.doubts_asked?.count || 0,
        audio_notes_created: updatedStats.audio_notes_created?.count || 0,
        total_study_time: updatedStats.total_study_time?.count || 0,
      };
      
      setStats(formattedStats);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.id]);

  return { stats, loading };
};
