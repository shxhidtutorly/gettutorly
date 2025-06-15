
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (authLoading || subLoading) return;

    // If not authenticated, redirect to sign in
    if (!user) {
      navigate('/signin', { 
        state: { returnTo: location.pathname },
        replace: true 
      });
      return;
    }

    // If authenticated but no active subscription, redirect to pricing
    if (user && !hasActiveSubscription) {
      // Allow access to pricing, signin, signup pages without subscription
      const allowedPaths = ['/pricing', '/signin', '/signup', '/settings'];
      if (!allowedPaths.includes(location.pathname)) {
        navigate('/pricing', { replace: true });
        return;
      }
    }
  }, [user, hasActiveSubscription, authLoading, subLoading, navigate, location.pathname]);

  // Show loading while checking auth and subscription
  if (authLoading || subLoading) {
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
