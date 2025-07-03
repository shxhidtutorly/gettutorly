
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WeeklyData {
  day: string;
  hours: number;
}

interface MonthlyData {
  name: string;
  hours: number;
}

interface ProgressData {
  materialsProgress: number;
  streak: number;
  weeklyProgress: number;
}

export const useProgressData = (userId: string | null) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({
    materialsProgress: 0,
    streak: 0,
    weeklyProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgressData = async () => {
      try {
        // Generate sample weekly data (7 days)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyHours = days.map(day => ({
          day,
          hours: Math.floor(Math.random() * 5) + 1 // Random hours 1-5
        }));

        // Generate sample monthly data (4 weeks)
        const monthlyHours = [
          { name: 'Week 1', hours: 12 },
          { name: 'Week 2', hours: 18 },
          { name: 'Week 3', hours: 15 },
          { name: 'Week 4', hours: 22 }
        ];

        // Calculate progress metrics
        const materialsProgress = Math.floor(Math.random() * 100);
        const streak = Math.floor(Math.random() * 30) + 1;
        const weeklyProgress = Math.floor(Math.random() * 100);

        setWeeklyData(weeklyHours);
        setMonthlyData(monthlyHours);
        setProgressData({
          materialsProgress,
          streak,
          weeklyProgress
        });

      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [userId]);

  return { weeklyData, monthlyData, progressData, loading };
};
