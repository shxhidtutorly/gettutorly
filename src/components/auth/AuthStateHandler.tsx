
import { useEffect } from 'react';
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate, useLocation } from 'react-router-dom';

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded: authLoaded } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait until both auth and subscription checks are loaded
    if (!authLoaded || subLoading) return;

    // Redirect signed-in users away from auth pages based on subscription status
    const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
    if (user && isAuthPage) {
      // Check subscription and route accordingly
      if (hasActiveSubscription) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/pricing', { replace: true });
      }
    }
  }, [user, authLoaded, hasActiveSubscription, subLoading, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthStateHandler;
