
import { useState, useEffect } from 'react';
import { firebaseSecure } from '@/lib/firebase-secure';
import { orderBy } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  timestamp: any;
  type: 'info' | 'success' | 'warning' | 'reminder';
}

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = firebaseSecure.subscribeToUserData(
      `notifications/${userId}/messages`,
      (data) => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      // FIX: Use segment array for secureWrite to ensure even segments
      await firebaseSecure.secureWrite(['notifications', userId, 'messages'].join('/'), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!userId) return;

    try {
      // FIX: Use segment array for secureAdd to ensure even segments
      await firebaseSecure.secureAdd(['notifications', userId, 'messages'].join('/'), {
        ...notification,
        read: false
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    addNotification
  };
};
