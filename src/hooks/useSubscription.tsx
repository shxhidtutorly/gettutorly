import { useEffect, useState } from "react";
import { useUser } from "./useUser";

export const useSubscription = () => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasActiveSubscription = !!subscription && !subscription.is_expired;

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    // Listen to Firestore subscription document
    let unsub: any;
    (async () => {
      try {
        setLoading(true);
        const { db } = await import("@/lib/firebase");
        const { doc, onSnapshot } = await import("firebase/firestore");
        const ref = doc(db, "users", user.id, "subscription", "current");
        unsub = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setSubscription(snap.data());
          } else {
            setSubscription(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("[Subscription] Firestore error:", err);
          setSubscription(null);
          setLoading(false);
        });
      } catch (error) {
        console.error("[Subscription] Unexpected error:", error);
        setSubscription(null);
        setLoading(false);
      }
    })();

    return () => unsub && unsub();
  }, [user, isLoaded]);


  const createTrialSubscription = async (planName: string) => {
    if (!user) return false;
    
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
