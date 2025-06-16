
import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react"; // Renamed for clarity
import { useSupabase } from "@/lib/supabase"; // Import the new hook
import { useToast } from '@/components/ui/use-toast';
import { getUserStudyMaterials } from '@/lib/database';

export const useRealTimeStudyMaterials = () => {
  const { user } = useClerkAuth(); // Use Clerk's useAuth
  const supabase = useSupabase(); // Use the new Supabase hook
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !supabase) return; // Add supabase check

    const fetchMaterials = async () => {
      try {
        // Assuming getUserStudyMaterials will be updated to use the new supabase client
        // or we pass supabase client to it. For now, this might break if getUserStudyMaterials
        // still uses the old client internally.
        const data = await getUserStudyMaterials(user.id, supabase); // Pass supabase client
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
        // Re-fetch with the current supabase client
        fetchMaterials();
      })
      .subscribe();

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, toast, supabase]); // Add supabase to dependency array

  return { materials, loading };
};

export const useRealTimeStudySessions = () => {
  const { user } = useClerkAuth(); // Use Clerk's useAuth
  const supabase = useSupabase(); // Use the new Supabase hook
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !supabase) return; // Add supabase check

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
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, toast, supabase]); // Add supabase to dependency array

  return { sessions, loading };
};

export const useRealTimeUserStats = () => {
  const { user } = useClerkAuth(); // Use Clerk's useAuth
  const supabase = useSupabase(); // Use the new Supabase hook
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !supabase) return; // Add supabase check

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
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, toast, supabase]); // Add supabase to dependency array

  return { stats, loading };
};
