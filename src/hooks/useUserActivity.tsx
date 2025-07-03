
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserActivity {
  sessionStart: Date;
  sessionEnd?: Date;
  duration?: number;
  page: string;
  userId: string;
  timestamp: Date;
}

export const useUserActivity = (userId: string | null) => {
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track session start
  const startSession = async (page: string) => {
    if (!userId) return;
    
    try {
      const sessionRef = collection(db, 'userActivity', userId, 'sessions');
      await addDoc(sessionRef, {
        sessionStart: new Date(),
        page,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  // Calculate weekly hours
  const calculateWeeklyHours = async () => {
    if (!userId) return 0;

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const sessionsRef = collection(db, 'userActivity', userId, 'sessions');
      const q = query(
        sessionsRef,
        where('timestamp', '>=', oneWeekAgo),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      let totalMinutes = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.duration) {
          totalMinutes += data.duration;
        } else if (data.sessionStart && data.sessionEnd) {
          const start = data.sessionStart.toDate();
          const end = data.sessionEnd.toDate();
          totalMinutes += (end - start) / (1000 * 60); // Convert to minutes
        }
      });

      return totalMinutes / 60; // Convert to hours
    } catch (error) {
      console.error('Error calculating weekly hours:', error);
      return 0;
    }
  };

  // Check if user is new
  const checkUserStatus = async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New user - create profile
        await setDoc(userRef, {
          firstLoginDate: new Date(),
          lastLoginDate: new Date(),
          isNewUser: true
        }, { merge: true });
        setIsNewUser(true);
      } else {
        const userData = userSnap.data();
        const firstLogin = userData.firstLoginDate?.toDate();
        const now = new Date();
        
        // Consider user "new" if first login was within last 24 hours
        if (firstLogin && (now.getTime() - firstLogin.getTime()) < 24 * 60 * 60 * 1000) {
          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }

        // Update last login
        await updateDoc(userRef, {
          lastLoginDate: new Date()
        });
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  useEffect(() => {
    const loadUserActivity = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await checkUserStatus();
      const hours = await calculateWeeklyHours();
      setWeeklyHours(hours);
      setLoading(false);
    };

    loadUserActivity();
  }, [userId]);

  // Track page visits
  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      startSession(window.location.pathname);
    }
  }, [userId]);

  return { weeklyHours, isNewUser, loading, startSession };
};
