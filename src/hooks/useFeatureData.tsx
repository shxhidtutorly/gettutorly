
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
      
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef, 
        where("userId", "==", userId),
        orderBy("created_at", "desc")
      );
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
      // Real-time subscription
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef, 
        where("userId", "==", userId),
        orderBy("created_at", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        setData(results);
        setLoading(false);
      }, (err) => {
        console.error(`Error in real-time ${collectionName}:`, err);
        setError(`Failed to fetch ${collectionName}`);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      fetchData();
    }
  }, [userId, collectionName, realtime, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
