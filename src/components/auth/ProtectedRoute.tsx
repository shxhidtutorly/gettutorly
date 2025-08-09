//import { Navigate, useLocation } from "react-router-dom";
//import { useEffect } from "react";
//import { cleanupWebGLContexts } from "@/lib/webgl-cleanup";
//import { useUser } from "@/hooks/useUser";
//import { useSubscription } from "@/hooks/useSubscription";

//interface ProtectedRouteProps {
 // children: React.ReactNode;
//}

//const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
 // const { user, isLoaded, loading: authLoading } = useUser();
//  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  //const location = useLocation();

  // Global WebGL cleanup on route changes
 // useEffect(() => {
    //const handleRouteChange = () => {
      //cleanupWebGLContexts();
    //};

    //handleRouteChange();
    //return () => {
      //cleanupWebGLContexts();
    //};
  //}, [location.pathname]);

  // Show unified loading until both auth and subscription are ready
  //if (!isLoaded || authLoading || subLoading) {
    //return (
      //<div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        //<div className="text-center">
          //<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          //<p className="text-lg">Loading your dashboard...</p>
        //</div>
      //</div>
    //);
  //}

  // Not authenticated
  //if (!user) {
    //return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  //}

  // Authenticated but no active subscription
 // if (!hasActiveSubscription) {
   // return <Navigate to="/pricing" state={{ from: location.pathname }} replace />;
//  }

  //return <>{children}</>;
//};

//export default ProtectedRoute;
