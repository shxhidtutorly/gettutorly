import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cleanupWebGLContexts } from "@/lib/webgl-cleanup";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { useSubscription } from "@/hooks/useSubscription";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoaded } = useUnifiedAuth();
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

  // Single loading check - wait for auth to be fully loaded
  if (!isLoaded) {
    return null;
  }

  // If no user, redirect to signin
  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // Wait for subscription loading to complete
  if (subLoading) {
    return null;
  }

  // Subscription check disabled for development
  // if (!hasActiveSubscription) {
  //   return <Navigate to="/pricing" state={{ from: location.pathname }} replace />;
  // }

  // If a user exists and all checks pass, render the children.
  return <>{children}</>;
};

export default ProtectedRoute;
