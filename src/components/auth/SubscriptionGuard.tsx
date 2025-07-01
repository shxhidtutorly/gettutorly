import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, isLoaded: isAuthLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to load
    if (!isAuthLoaded) return;

    // If not logged in, go to signin
    if (!user) {
      if (location.pathname !== '/signin') {
        navigate('/signin', {
          state: { returnTo: location.pathname },
          replace: true,
        });
      }
      return;
    }

    // IF AUTHENTICATED, ALWAYS GO TO DASHBOARD
    if (user && location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isAuthLoaded, location.pathname, navigate]);

  return <>{children}</>;
};

export default SubscriptionGuard;
