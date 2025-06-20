
import { useEffect } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate, useLocation } from 'react-router-dom';

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading
    if (loading) return;

    // Only redirect authenticated users if they're on auth pages
    if (user && (location.pathname === '/signin' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthStateHandler;
