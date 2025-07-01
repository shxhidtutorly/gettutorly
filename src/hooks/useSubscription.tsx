const fetchSubscription = async () => {
  if (!user?.id) return;

  try {
    setLoading(true);

    // ✅ Safe bypass only in development
    if (process.env.NODE_ENV === 'development') {
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
    }

    // 🟡 TODO: Replace with real subscription fetch logic for production
    const res = await fetch(`/api/subscription?userId=${user.id}`);
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
