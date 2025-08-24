import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const publicPaths = ['/', '/signin', '/signup'];

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, isLoaded: isAuthLoaded } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = !isAuthLoaded || subLoading;

  useEffect(() => {
    // Do nothing if we are still loading authentication or subscription status
    if (isLoading) return;

    const isPublicPath = publicPaths.includes(location.pathname);
    const isPricingPage = location.pathname === '/pricing';
    const isDashboardPage = location.pathname === '/dashboard';

    // 1. If user is NOT logged in and not on a public path, redirect to signin
    if (!user && !isPublicPath) {
      navigate('/signin', {
        state: { returnTo: location.pathname },
        replace: true,
      });
      return;
    }

    // 2. If user IS logged in and has NO active subscription
    if (user && !hasActiveSubscription) {
      // If they are not already on the pricing page, redirect them
      if (!isPricingPage) {
        navigate('/pricing', { replace: true });
      }
      return;
    }

    // 3. If user IS logged in and HAS an active subscription
    if (user && hasActiveSubscription) {
      // If they are on the pricing page, they don't need to be, so redirect to dashboard
      if (isPricingPage) {
        navigate('/dashboard', { replace: true });
      }
      // If they are on a public path (like signin/signup), redirect them to the dashboard
      if (isPublicPath && location.pathname !== '/') {
        navigate('/dashboard', { replace: true });
      }
    }

    // All other cases (e.g., user is logged in, has subscription, and is on a protected route)
    // will simply render the children without a redirect.
  }, [isLoading, user, hasActiveSubscription, navigate, location.pathname]);

  // Display a loading indicator or nothing while data is being fetched
  if (isLoading) {
    return null; // Or a loading spinner component
  }

  // Render the children if no redirect is needed
  return <>{children}</>;
};

export default SubscriptionGuard;
