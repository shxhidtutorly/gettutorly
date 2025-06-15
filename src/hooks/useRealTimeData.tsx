
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getUserStudyMaterials } from '@/lib/database';

export const useRealTimeStudyMaterials = () => {
  const { user } = useAuth();
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
    const channel = supabase
      .channel('study_materials_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_materials',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchMaterials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return { materials, loading };
};

export const useRealTimeStudySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
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

    // Set up real-time subscription
    const channel = supabase
      .channel('study_sessions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_sessions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return { sessions, loading };
};

export const useRealTimeUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .order('last_updated', { ascending: false });

        if (error) throw error;
        setStats(data || []);
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
    const channel = supabase
      .channel('user_stats_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_stats',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return { stats, loading };
};
