import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cleanupWebGLContexts } from "@/lib/webgl-cleanup";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";
import BrutalLoader from '@/components/BrutalLoader'; // Assuming you have a BrutalLoader component

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoaded, loading: authLoading } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const location = useLocation();

  // WebGL cleanup logic. This is fine and unrelated to the flickering.
  useEffect(() => {
    const handleRouteChange = () => {
      cleanupWebGLContexts();
    };
    handleRouteChange();
    return () => {
      cleanupWebGLContexts();
    };
  }, [location.pathname]);

  // --- FIX: Consolidated Loading State ---
  // A single, unambiguous loading state check to prevent race conditions.
  // The component should only proceed once isLoaded is explicitly true.
  if (!isLoaded) {
    return <BrutalLoader />;
  }

  // --- FIX: Simplified Navigation Logic ---
  // The component only reaches this point once isLoaded is true.
  // Therefore, we can reliably check the user status.
  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // Handle subscription loading only after the user is authenticated.
  // This prevents the flicker between the loader and the content.
  if (subLoading) {
     return <BrutalLoader />;
  }

  // Subscription check disabled for development
  // if (!hasActiveSubscription) {
  //  return <Navigate to="/pricing" state={{ from: location.pathname }} replace />;
  // }

  // If a user exists and all checks pass, render the children.
  return <>{children}</>;
};

export default ProtectedRoute;
