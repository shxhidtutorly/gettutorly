import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, isLoaded: isAuthLoaded } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to load
    if (!isAuthLoaded || subLoading) return;

    // If not logged in, go to signin
    if (!user) {
      if (location.pathname !== '/signin' && location.pathname !== '/signup') {
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
      
      // If payment successful or has active subscription, go to dashboard
      if (subSuccess || hasActiveSubscription) {
        if (location.pathname !== '/dashboard') {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // No active subscription, redirect to pricing
        if (location.pathname !== '/pricing' && location.pathname !== '/signin' && location.pathname !== '/signup') {
          navigate('/pricing', { replace: true });
        }
      }
    }
  }, [user, isAuthLoaded, hasActiveSubscription, subLoading, location.pathname, location.search, navigate]);

  return <>{children}</>;
};

export default SubscriptionGuard;
