import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const SignUpPage = () => {
  const { user, signUp, signInWithGoogle } = useFirebaseAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password || !displayName) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(email, password, displayName);
    if (result.error) {
      setError(result.error.message || "Signup failed");
    }

    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error.message || "Google sign-up failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Join Tutorly
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create your account to start learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-full bg-gray-700" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px w-full bg-gray-700" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border-gray-700 hover:bg-gray-800 text-white"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
