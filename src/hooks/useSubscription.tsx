
import { useState, useEffect } from 'react';
import { useUser } from "@/hooks/useUser";

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  is_trial: boolean;
}

export const useSubscription = () => {
  const { user, isLoaded: userLoaded } = useUser();
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

      // 🔧 TEMPORARY BYPASS FOR DEV — always allow access
      console.warn('[DEV] Bypassing subscription check — REMOVE IN PRODUCTION');
      setHasActiveSubscription(true);
      setSubscription({
        id: 'dev-sub-id',
        plan_name: 'dev_plan',
        status: 'active',
        trial_end_date: null,
        subscription_end_date: null,
        is_trial: true,
      });
      return;

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
      // Mock trial creation for dev
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
