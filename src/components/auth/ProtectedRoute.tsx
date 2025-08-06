
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import { cleanupWebGLContexts } from "@/lib/webgl-cleanup";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, loading, error] = useAuthState(auth);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Auth error:", error);
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
