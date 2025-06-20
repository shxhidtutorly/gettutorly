import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
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
  const { user, isLoaded: userLoaded } = useUser(); // Use isLoaded instead of loading for clarity
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoaded) return;

    if (!user) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, userLoaded]);

  const fetchSubscription = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // ✅ Check if the user has an active subscription
      const { data: hasActive, error: activeError } = await supabase.rpc('has_active_subscription', {
        p_user_id: user.id,
      });

      if (activeError) {
        console.error('[Subscription] Error checking active status:', activeError.message);
        setHasActiveSubscription(false);
      } else {
        setHasActiveSubscription(Boolean(hasActive));
      }

      // ✅ Fetch user subscription details
      const { data: subscriptionData, error: subError } = await supabase.rpc('get_user_subscription', {
        p_user_id: user.id,
      });

      if (subError) {
        console.error('[Subscription] Error fetching subscription:', subError.message);
        setSubscription(null);
      } else {
        setSubscription(subscriptionData?.[0] ?? null);
      }
    } catch (err) {
      console.error('[Subscription] Unexpected error:', err);
      setHasActiveSubscription(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const createTrialSubscription = async (planName: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase.from('subscriptions').insert([
        {
          user_id: user.id,
          plan_name: planName,
          status: 'trialing',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

      if (error) {
        console.error('[Subscription] Error creating trial:', error.message);
        return false;
      }

      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('[Subscription] Unexpected error on trial creation:', err);
      return false;
    }
  };

  return {
    subscription,
    hasActiveSubscription,
    loading: loading || !userLoaded,
    fetchSubscription,
    createTrialSubscription,
  };
};
