import { useEffect, useState } from "react";
import { useUser } from "./useUser";

export const useSubscription = () => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasActiveSubscription = !!subscription && !subscription.is_expired;

  useEffect(() => {
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
    try {
      const res = await fetch("/api/subscription/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planName }),
      });
      if (!res.ok) throw new Error("Failed to create trial subscription");
      const data = await res.json();
      setSubscription(data);
      return true;
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
