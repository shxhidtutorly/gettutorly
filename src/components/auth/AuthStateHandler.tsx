import { useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from 'react-router-dom';

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded) return;

    // List of auth-related routes to redirect away from when user is signed in
    const authPages = [
      '/signin',
      '/signup',
      '/reset-password',
      '/verify-email',
      '/forgot-password',
      '/magic-link'
    ];

    const isAuthPage = authPages.includes(location.pathname);

    if (user && isAuthPage) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoaded, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthStateHandler;
