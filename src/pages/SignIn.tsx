import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  useSignIn,
  useUser,
  useAuth
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (env: string) => void;
      };
      Setup: (config: { token: string }) => void;
      Checkout: {
        open: (config: {
          items: { priceId: string; quantity: number }[];
          customer?: { email?: string };
          customData?: Record<string, any>;
          successUrl?: string;
          cancelUrl?: string;
          settings?: {
            allowLogout?: boolean;
            displayMode?: string;
            theme?: string;
            locale?: string;
          };
        }) => void;
      };
    };
  }
}

const SignInPage = () => {
  const { isSignedIn, user } = useUser();
  const { signIn, isLoaded } = useSignIn();
  const { getToken } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    if (isSignedIn && location.pathname === '/signin') {
      const state = location.state as any;
      const redirectTo = state?.returnTo || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isSignedIn, navigate, location]);

  useEffect(() => {
    const state = location.state as any;
    if (state?.autoCheckout) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          window.Paddle.Environment.set('production');
          window.Paddle.Setup({
            token: 'live_70323ea9dfbc69d45414c712687'
          });
          setPaddleLoaded(true);
        }
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [location.state]);

  const openPaddleCheckout = () => {
    if (!user || !paddleLoaded || !window.Paddle) return;

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: 'pri_01jxq0pfrjcd0gkj08cmqv6rb1', quantity: 1 }],
        customer: { email: user?.primaryEmailAddress?.emailAddress || '' },
        customData: {
          user_id: user.id,
          planName: 'Basic Plan'
        },
        successUrl: 'https://gettutorly.com/pricing?sub=success',
        cancelUrl: 'https://gettutorly.com/pricing?sub=cancel',
        settings: {
          allowLogout: false,
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en'
        }
      });
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      toast({
        title: "Payment Error",
        description: "Failed to open checkout, please try again"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!isLoaded) return;

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        const state = location.state as any;

        if (state?.autoCheckout) {
          toast({
            title: "Login successful!",
            description: "Opening checkout..."
          });

          setTimeout(() => {
            paddleLoaded ? openPaddleCheckout() : navigate('/pricing', { replace: true });
          }, 1000);
        } else {
          const redirectTo = state?.returnTo || '/dashboard';
          navigate(redirectTo, { replace: true });
        }
      } else {
        setError("Unknown login status");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    const state = location.state as any;
    const redirectTo = state?.returnTo || "/dashboard";

    window.location.href = `https://clerk.gettutorly.com/oauth/google?redirect_url=${window.location.origin}${redirectTo}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome Back to Tutorly
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="..." />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
