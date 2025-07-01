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

  const isDev = import.meta.env.DEV || process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!userLoaded) return;

    if (isDev) {
      setHasActiveSubscription(true);
      setSubscription({
        id: 'dev-sub-id',
        plan_name: 'dev_plan',
        status: 'active',
        trial_end_date: null,
        subscription_end_date: null,
        is_trial: true,
      });
      setLoading(false);
      return;
    }

    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoaded]);

  const fetchSubscription = async () => {
    if (isDev) return; // Prevent API call in dev
    if (!user?.id) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/subscription?userId=${user.id}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      if (data?.status === 'active') {
        setHasActiveSubscription(true);
        setSubscription(data);
      } else {
        setHasActiveSubscription(false);
        setSubscription(null);
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
    if (isDev) return true; // Always succeed in dev
    if (!user?.id) return false;

    try {
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
