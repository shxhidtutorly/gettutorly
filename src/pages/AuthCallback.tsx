
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (!accessToken && !refreshToken && !type) {
          // No auth parameters found, check for other standard auth flows
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (data.session) {
            // User is authenticated, redirect to dashboard
            navigate('/dashboard');
          } else {
            // No session, redirect to landing page
            navigate('/');
          }
          return;
        }
        
        // For OAuth or magic link login
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          // Successfully set the session, redirect to dashboard
          navigate('/dashboard');
          return;
        }
        
        // For email confirmation or password recovery
        if (type === 'recovery') {
          navigate('/reset-password');
          return;
        }
        
        // Default redirect to dashboard
        navigate('/dashboard');
        
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        // Redirect to home page after a short delay on error
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-destructive text-xl">Authentication Error</div>
            <p className="mt-4">{error}</p>
            <p className="mt-2">Redirecting to home page...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
