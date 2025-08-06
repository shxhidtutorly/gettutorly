import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, isLoaded: authLoaded } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for both auth and subscription to load
    if (!authLoaded || subLoading) return;

    // If not logged in, go to signin
    if (!user) {
      if (location.pathname !== '/signin' && location.pathname !== '/signup' && location.pathname !== '/') {
        navigate('/signin', {
          state: { returnTo: location.pathname },
          replace: true,
        });
      }
      return;
    }

    // Check subscription status and route accordingly
    if (user) {
      const urlParams = new URLSearchParams(location.search);
      const subSuccess = urlParams.get('sub') === 'success';
      
      // Special routes that don't require subscription
      const freeRoutes = ['/pricing', '/profile', '/signin', '/signup', '/'];
      const isOnFreeRoute = freeRoutes.includes(location.pathname);
      
      // If payment successful or has active subscription
      if (subSuccess || hasActiveSubscription) {
        // Redirect to dashboard if on auth/pricing pages
        if (location.pathname === '/signin' || location.pathname === '/signup' || location.pathname === '/pricing') {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // No active subscription, redirect to pricing unless already on a free route
        if (!isOnFreeRoute) {
          navigate('/pricing', { replace: true });
        }
      }
    }
  }, [user, authLoaded, hasActiveSubscription, subLoading, location.pathname, location.search, navigate]);

  return <>{children}</>;
};

export default SubscriptionGuard;
