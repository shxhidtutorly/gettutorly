
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useRealTimeStudyProgress = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('study_progress')
          .select('*')
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        setProgress(data || []);
      } catch (error) {
        console.error('Error fetching progress:', error);
        toast({
          title: "Error",
          description: "Failed to fetch study progress",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();

    // Set up real-time subscription
    const channel = supabase
      .channel('study_progress_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_progress',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        fetchProgress();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, toast]);

  return { progress, loading };
};

export const useRealTimeStudyMaterials = () => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    const fetchMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
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
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        fetchMaterials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, toast]);

  return { materials, loading };
};

export const useRealTimeUserActivity = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('timestamp', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user activities",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_activity_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_activity_logs',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, toast]);

  return { activities, loading };
};
