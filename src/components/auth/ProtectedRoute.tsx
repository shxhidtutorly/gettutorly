
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cleanupWebGLContexts } from "@/lib/webgl-cleanup";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

const ProtectedRoute = ({ children, requireSubscription = true }: ProtectedRouteProps) => {
  const { user, isLoaded: authLoaded } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const location = useLocation();

  // Global WebGL cleanup on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      cleanupWebGLContexts();
    };

    handleRouteChange();
    
    return () => {
      cleanupWebGLContexts();
    };
  }, [location.pathname]);

  // Show loading while auth or subscription is loading
  if (!authLoaded || (requireSubscription && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // Redirect to pricing if subscription is required but not active
  if (requireSubscription && !hasActiveSubscription) {
    return <Navigate to="/pricing" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
