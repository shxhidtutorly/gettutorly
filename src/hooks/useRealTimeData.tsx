
import { useState, useEffect } from 'react';
import { useUser } from "@/hooks/useUser";
import { useToast } from '@/hooks/use-toast';
import { getUserStudyMaterials, subscribeToStudyMaterials, subscribeToUserStats } from '@/lib/firebase-db';

interface UserStat {
  count: number;
  last_updated: string;
}

interface UserStats {
  [key: string]: UserStat;
}

export const useRealTimeStudyMaterials = () => {
  const { user } = useUser();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchMaterials = async () => {
      try {
        const data = await getUserStudyMaterials(user.id);
        setMaterials(data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast({
          title: "Error",
          description: "Failed to fetch study materials",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();

    // Set up real-time subscription
    const unsubscribe = subscribeToStudyMaterials(user.id, (updatedMaterials) => {
      setMaterials(updatedMaterials);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user, toast]);

  return { materials, loading };
};

export const useRealTimeStudySessions = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        // Implement getUserStudySessions in firebase-db.ts if needed
        setSessions([]);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch study sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, toast]);

  return { sessions, loading };
};

export const useRealTimeUserStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user stats",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription
    const unsubscribe = subscribeToUserStats(user.id, (updatedStats: UserStats) => {
      setStats(Object.entries(updatedStats).map(([key, value]) => ({
        stat_type: key,
        count: value.count,
        last_updated: value.last_updated
      })));
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user, toast]);

  return { stats, loading };
};
