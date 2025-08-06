
import { useEffect } from 'react';
import { useUser } from "@/hooks/useUser";
import { useNavigate, useLocation } from 'react-router-dom';

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait until Firebase auth is fully loaded
    if (!isLoaded) return;

    // Redirect signed-in users away from auth pages
    const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
    if (user && isAuthPage) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoaded, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthStateHandler;
