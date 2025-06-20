
import { useState, useEffect } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  is_trial: boolean;
}

export const useSubscription = () => {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, authLoading]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if user has active subscription
      const { data: hasActive, error: hasActiveError } = await supabase
        .rpc('has_active_subscription', { p_user_id: user.id });

      if (hasActiveError) {
        console.error('Error checking subscription status:', hasActiveError);
        setHasActiveSubscription(false);
      } else {
        setHasActiveSubscription(hasActive || false);
      }

      // Get subscription details
      const { data: subData, error: subError } = await supabase
        .rpc('get_user_subscription', { p_user_id: user.id });

      if (subError) {
        console.error('Error fetching subscription:', subError);
        setSubscription(null);
      } else if (subData && subData.length > 0) {
        setSubscription(subData[0]);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setHasActiveSubscription(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const createTrialSubscription = async (planName: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          plan_name: planName,
          status: 'trialing',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (error) {
        console.error('Error creating trial subscription:', error);
        return false;
      }

      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }
  };

  return {
    subscription,
    hasActiveSubscription,
    loading: loading || authLoading,
    fetchSubscription,
    createTrialSubscription
  };
};
