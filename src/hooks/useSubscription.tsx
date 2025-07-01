import { useEffect, useState } from "react";
import { useUser } from "./useUser";

const IS_DEV = import.meta.env.DEV ?? process.env.NODE_ENV === "development";

export const useSubscription = () => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasActiveSubscription = !!subscription && !subscription.is_expired;

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchSubscription = async () => {
      if (IS_DEV) {
        console.warn("[DEV] Mocking subscription response");
        setSubscription({ plan_name: "Pro", is_trial: true, is_expired: false });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/subscription?userId=${user.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch subscription");
        }
        const data = await res.json();
        setSubscription(data);
      } catch (error) {
        console.error("[Subscription] Unexpected error:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, isLoaded]);

  const createTrialSubscription = async (planName: string) => {
    if (IS_DEV) {
      console.warn("[DEV] Skipping real trial creation");
      return true;
    }

    try {
      const res = await fetch("/api/subscription/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planName }),
      });

      return res.ok;
    } catch (error) {
      console.error("Trial creation failed:", error);
      return false;
    }
  };

  return {
    subscription,
    hasActiveSubscription,
    createTrialSubscription,
    loading,
  };
};
