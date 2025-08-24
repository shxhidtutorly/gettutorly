import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cleanupWebGLContexts } from "@/lib/webgl-cleanup";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoaded, loading: authLoading } = useUser();
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

  // 1. Show a loading screen until both auth and subscription data are loaded
  if (!isLoaded || authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your content...</p>
        </div>
      </div>
    );
  }

  // 2. If no user is authenticated, redirect to the sign-in page
  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // 3. If the user is authenticated but has no active subscription, redirect to the pricing page
  if (!hasActiveSubscription) {
    return <Navigate to="/pricing" state={{ from: location.pathname }} replace />;
  }

  // 4. If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
