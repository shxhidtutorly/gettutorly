
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-firestore";

export const useFeatureData = <T,>(
  userId: string | null,
  collectionName: string,
  realtime: boolean = false
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching ${collectionName} for user:`, userId);
      
      const q = query(collection(db, collectionName), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      console.log(`Loaded ${collectionName}:`, results);
      setData(results);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(`Failed to fetch ${collectionName}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, collectionName]);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    if (realtime) {
      // Set up real-time listener
      const q = query(collection(db, collectionName), where("userId", "==", userId));
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          
          console.log(`Real-time ${collectionName} update:`, results);
          setData(results);
          setLoading(false);
        },
        (err) => {
          console.error(`Real-time ${collectionName} error:`, err);
          setError(`Failed to fetch ${collectionName}`);
          setLoading(false);
        }
      );

      return unsubscribe;
    } else {
      // One-time fetch
      fetchData();
    }
  }, [userId, collectionName, realtime, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useUserSessions = (userId: string | null) => {
  return useFeatureData<any>(userId, "study_sessions", false);
};
