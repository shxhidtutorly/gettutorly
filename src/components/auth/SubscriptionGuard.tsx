import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, isLoaded: isAuthLoaded, loading: authLoading } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for both auth and subscription to load
    if (!isAuthLoaded || authLoading || subLoading) return;

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

    // If logged in, route based on subscription
   // const urlParams = new URLSearchParams(location.search);
   // const subSuccess = urlParams.get('sub') === 'success';

    //if (subSuccess || hasActiveSubscription) {
      //if (location.pathname !== '/dashboard') {
       // navigate('/dashboard', { replace: true });
    //  }
    //} else {
     // if (
       // location.pathname !== '/pricing' &&
        //location.pathname !== '/signin' &&
        //location.pathname !== '/signup'
      //) {
        //navigate('/pricing', { replace: true });
      //}
    //}
  //}, [user, isAuthLoaded, authLoading, hasActiveSubscription, subLoading, location.pathname, location.search, navigate]);

  // Prevent flash while loading
  if (!isAuthLoaded || authLoading || subLoading) return null;

  return <>{children}</>;
};

export default SubscriptionGuard;
