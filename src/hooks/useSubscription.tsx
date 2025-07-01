import { useEffect, useState } from "react";
import { useUser } from "./useUser";

// True in all development environments (Vite, Next.js, etc)
const IS_DEV = Boolean(
  typeof import.meta !== "undefined"
    ? import.meta.env.DEV
    : process.env.NODE_ENV === "development"
);

export const useSubscription = () => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // This value is computed based on the subscription state
  const hasActiveSubscription = !!subscription && !subscription.is_expired;

  useEffect(() => {
    // BYPASS: Always "subscribed" in dev, NEVER call API
    if (IS_DEV) {
      setSubscription({ plan_name: "Pro", is_trial: true, is_expired: false });
      setLoading(false);
      return;
    }

    // In production, fetch real subscription
    if (!isLoaded || !user) return;

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/subscription?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch subscription");
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
      setSubscription({ plan_name: planName, is_trial: true, is_expired: false });
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
