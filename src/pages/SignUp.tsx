import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import useFirebaseAuth from "@/hooks/useFirebaseAuth";

const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
const brutalistTransition = "transition-all duration-300 ease-in-out";
const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useFirebaseAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { name, email, password } = formData;
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(email, password, name);
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
    <div className="min-h-screen bg-stone-50 text-black font-mono flex items-center justify-center relative overflow-hidden">
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className={`w-16 h-16 bg-sky-200 border-4 border-black flex items-center justify-center ${brutalistShadow}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                <path d="M12 21a9 9 0 0 0 9-9c0-1.26-.41-2.5-1.19-3.44S17.65 6.5 16 6s-3.79-.58-5.75-1.11A9 9 0 0 0 3 12a9 9 0 0 0 9 9Z" />
                <path d="M8 10v4" />
                <path d="M12 8v8" />
                <path d="M16 6v12" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black">AI-LEARN</h1>
              <p className="text-sm font-bold text-stone-600">STUDY SMARTER. LEARN FASTER.</p>
            </div>
          </Link>
          <h2 className="text-4xl font-black mb-4 uppercase">JOIN THE MOVEMENT</h2>
          <p className="font-bold text-stone-700">Start your AI-powered learning journey today</p>
        </div>

        <div className={`bg-white p-8 space-y-4 ${brutalistShadow}`}>
          {error && (
            <div className="text-red-600 text-sm font-bold bg-red-100 border-2 border-red-400 p-2 brutal-shadow">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-black text-sm mb-2 uppercase">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-500" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`pl-12 font-bold h-12 bg-stone-100 ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-sm mb-2 uppercase">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-12 font-bold h-12 bg-stone-100 ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-sm mb-2 uppercase">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-500" />
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pl-12 font-bold h-12 bg-stone-100 ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full bg-amber-400 text-black font-black text-lg py-4 border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          <div className="relative flex justify-center items-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-stone-300"></span>
            </div>
            <div className="relative bg-white px-4 text-sm font-bold text-stone-600">OR</div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            type="button"
            className={`w-full border-4 border-black font-bold flex items-center justify-center gap-2 bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
            disabled={isSubmitting}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="font-bold text-stone-600 text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-500 hover:underline font-black">
              SIGN IN
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="outline" className={`font-black bg-white hover:bg-stone-100 border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
