import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const SignInPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useFirebaseAuth();
  const { user, isLoaded } = useUser();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This useEffect handles the redirection logic after authentication
  useEffect(() => {
    if (isLoaded && user && !subLoading) {
      if (hasActiveSubscription) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/pricing", { state: { fromSignIn: true }, replace: true });
      }
    }
  }, [user, isLoaded, hasActiveSubscription, subLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error.message || "Login failed");
    }

    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error.message || "Google login failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-mono flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-purple-500 brutal-border flex items-center justify-center">
              <img src="https://dllyfsbuxrjyiatfcegk.supabase.co/storage/v1/object/public/tutorly%20images/1000118018.jpg" alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black">TUTORLY</h1>
              <p className="text-sm font-bold text-gray-600">STUDY SMARTER. LEARN FASTER.</p>
            </div>
          </Link>
          <h2 className="text-4xl font-black mb-4">WELCOME BACK</h2>
          <p className="font-bold text-gray-700">Sign in to continue your learning journey</p>
        </div>

        <div className="bg-white p-8 brutal-border space-y-4">
          {error && (
            <div className="text-red-600 text-sm font-bold">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-black text-sm mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 font-bold brutal-border h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-sm mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 font-bold brutal-border h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black text-lg py-4 brutal-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-600">OR</p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full border font-bold flex items-center justify-center gap-2 brutal-button"
            disabled={isSubmitting}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="font-bold text-gray-600 text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-500 hover:text-purple-600 font-black">
              SIGN UP
            </Link>
          </p>
        </div>
        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="outline" className="font-black brutal-button hover:bg-gray-100 bg-transparent">
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
