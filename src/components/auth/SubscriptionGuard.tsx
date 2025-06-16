
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'; // Added imports
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { isSignedIn, isLoaded: clerkAuthLoaded } = useClerkAuth(); // Use Clerk auth
  const { user: clerkUser } = useUser(); // Use Clerk user
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (!clerkAuthLoaded || subLoading) return; // Updated loading check

    // If not authenticated, redirect to sign in (Handled by ProtectedRoute, commented out here)
    // if (!isSignedIn) {
    //   navigate('/signin', {
    //     state: { returnTo: location.pathname },
    //     replace: true
    //   });
    //   return;
    // }

    // If authenticated but no active subscription, redirect to pricing
    if (isSignedIn && clerkUser && !hasActiveSubscription) { // Updated condition
      // Allow access to pricing, signin, signup pages without subscription
      // Note: '/signin', '/signup' are no longer relevant with Clerk handling this via RedirectToSignIn
      const allowedPaths = ['/pricing', '/settings'];
      if (!allowedPaths.includes(location.pathname)) {
        navigate('/pricing', { replace: true });
        return;
      }
    }
  }, [isSignedIn, clerkUser, hasActiveSubscription, clerkAuthLoaded, subLoading, navigate, location.pathname]); // Updated dependency array

  // Show loading while checking auth and subscription
  if (!clerkAuthLoaded || subLoading) { // Updated loading check
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
