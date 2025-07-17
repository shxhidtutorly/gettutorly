
import { useState, useEffect } from 'react';
import { firebaseSecure } from '@/lib/firebase-secure';
import { Timestamp, orderBy, where } from 'firebase/firestore';

export const useUserActivity = (userId: string | null) => {
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        setLoading(true);

        // Check if user is new (created within last 24 hours)
        // FIX: Use segment array for secureRead to ensure even segments
        const userProfile = await firebaseSecure.secureRead(['users', userId].join('/'));
        if (userProfile?.created_at) {
          const createdTime = userProfile.created_at.toMillis ? userProfile.created_at.toMillis() : userProfile.created_at;
          const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
          setIsNewUser(createdTime > dayAgo);
        }

        // Calculate weekly hours from last 7 days
        const weekAgo = Timestamp.fromMillis(Date.now() - (7 * 24 * 60 * 60 * 1000));
        
        // FIX: Use segment array for secureQuery to ensure even segments
        const sessions = await firebaseSecure.secureQuery(['userActivity', userId, 'sessions'].join('/'));

        const totalMinutes = sessions.reduce((total, session) => {
          return total + (session.duration || 0);
        }, 0);

        setWeeklyHours(totalMinutes / 60); // Convert to hours

      } catch (error) {
        console.error('Error fetching user activity:', error);
        setWeeklyHours(0);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId]);

  return { weeklyHours, isNewUser, loading };
};
