
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Temporarily disable authentication check
  // When authentication is re-enabled, uncomment the following code:
  /*
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page with return URL
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }
  */

  // For now, just render the children without checking authentication
  return <>{children}</>;
};

export default ProtectedRoute;
