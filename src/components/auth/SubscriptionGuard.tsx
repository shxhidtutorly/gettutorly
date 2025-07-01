
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, isLoaded: isAuthLoaded } = useUser();
  const { hasActiveSubscription, loading: isSubLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const allowedPublicPaths = ['/pricing', '/signin', '/signup', '/settings', '/'];

  useEffect(() => {
  if (!isAuthLoaded || isSubLoading) return;

  const isPublicPath = allowedPublicPaths.includes(location.pathname);

  // Bypass subscription redirect in development mode
  const isDev = import.meta.env?.MODE === 'development' || process.env.NODE_ENV === 'development';

  if (!user) {
    if (!isPublicPath) {
      navigate('/signin', {
        state: { returnTo: location.pathname },
        replace: true,
      });
    }
    return;
  }

  if (!isDev && user && !hasActiveSubscription && !isPublicPath) {
    navigate('/pricing', { replace: true });
  }
}, [user, isAuthLoaded, hasActiveSubscription, isSubLoading, location.pathname, navigate]);
  if (!isAuthLoaded || isSubLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
