
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-firestore";

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
  const [user, loading] = useAuthState(auth);
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async (userId: string) => {
    if (!userId) return;
    
    console.log('Loading stats for user:', userId);
    setIsLoading(true);
    
    try {
      // Get aggregated stats from user_stats collection first
      const userStatsRef = doc(db, 'user_stats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      let aggregatedStats: Partial<UserStats> = {};
      if (userStatsDoc.exists()) {
        aggregatedStats = userStatsDoc.data() as Partial<UserStats> || {};
      }

      // Fallback to counting individual collections if aggregated stats don't exist
      const [
        materialsSnapshot,
        notesSnapshot,
        flashcardsSnapshot,
        quizzesSnapshot,
        summariesSnapshot,
        doubtsSnapshot,
        audioNotesSnapshot
      ] = await Promise.all([
        getDocs(query(collection(db, 'study_materials'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'notes'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'flashcards'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'quizzes'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'summaries'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'doubt_chain'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'audio_notes'), where('userId', '==', userId)))
      ]);

      const newStats: UserStats = {
        materials_created: aggregatedStats.materials_created ?? materialsSnapshot.size,
        notes_created: aggregatedStats.notes_created ?? notesSnapshot.size,
        flashcards_created: aggregatedStats.flashcards_created ?? flashcardsSnapshot.size,
        quizzes_created: aggregatedStats.quizzes_created ?? quizzesSnapshot.size,
        quizzes_taken: aggregatedStats.quizzes_taken ?? 0,
        summaries_created: aggregatedStats.summaries_created ?? summariesSnapshot.size,
        doubts_asked: aggregatedStats.doubts_asked ?? doubtsSnapshot.size,
        audio_notes_created: aggregatedStats.audio_notes_created ?? audioNotesSnapshot.size,
        total_study_time: aggregatedStats.total_study_time ?? 0,
      };

      setStats(newStats);
      console.log('Loaded stats:', newStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize the effect dependencies to prevent unnecessary re-runs
  const userId = useMemo(() => user?.uid, [user?.uid]);

  useEffect(() => {
    if (!loading && userId) {
      fetchStats(userId);
    } else if (!loading && !userId) {
      setIsLoading(false);
    }
  }, [fetchStats, userId, loading]);

  return { stats, loading: isLoading };
};
