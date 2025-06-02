
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUserStudyProgress, 
  getUserStudyMaterials, 
  getUserActivityLogs 
} from '@/lib/database';

export const useRealTimeStudyProgress = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    const fetchProgress = async () => {
      try {
        const data = await getUserStudyProgress();
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

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel('study_progress_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_progress',
        filter: `user_id=eq.${currentUser.id}`
      }, (payload) => {
        console.log('Study progress realtime update:', payload);
        fetchProgress();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to study progress changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to study progress changes');
        }
      });

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
        const data = await getUserStudyMaterials();
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
        const data = await getUserActivityLogs();
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
