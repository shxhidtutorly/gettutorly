// src/pages/SignupPage.tsx
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, Lock, User, Brain } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

// Firebase imports for self-contained component
import { initializeApp } from '@lib/firebase.ts';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';

// Helper function to create a unique userId for anonymous sign-in
function generateRandomUserId() {
  return 'anon-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function SignupPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [auth, setAuth] = useState(null);
  const [firebaseApp, setFirebaseApp] = useState(null);

  // Initialize Firebase and set up auth listener
  useEffect(() => {
    // Check for firebase config and initialize
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    if (!firebaseConfig) {
      console.error("Firebase config is missing.");
      return;
    }
    const app = initializeApp(firebaseConfig);
    const authInstance = getAuth(app);
    setFirebaseApp(app);
    setAuth(authInstance);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(authInstance, (authUser) => {
      // If user is logged in, navigate to the pricing page
      if (authUser) {
        navigate("/pricing");
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  const signUp = async (email, password, name) => {
    if (!auth) return { error: { message: "Firebase Auth not initialized." } };
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // You can add more user data to Firestore here if needed.
      return { user };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) return { error: { message: "Firebase Auth not initialized." } };
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      return { user };
    } catch (error) {
      return { error };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const { name, email, password } = formData
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    const result = await signUp(email, password, name)
    if (result.error) {
      setError(result.error.message || "Signup failed")
    }

    setIsSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsSubmitting(true)
    const result = await signInWithGoogle()
    if (result.error) {
      setError(result.error.message || "Google sign-up failed")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-mono flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-purple-500 border-4 border-black brutal-shadow flex items-center justify-center rounded-lg">
              <Brain className="w-8 h-8 text-white"/>
            </div>
            <div>
              <h1 className="text-3xl font-black">TUTORLY</h1>
              <p className="text-sm font-bold text-gray-600">STUDY SMARTER. LEARN FASTER.</p>
            </div>
          </Link>

          <h2 className="text-4xl font-black mb-4">JOIN TUTORLY</h2>
          <p className="font-bold text-gray-700">Start your AI-powered learning journey today</p>
        </div>

        <div className="bg-white p-8 border-4 border-black brutal-shadow space-y-4 rounded-lg">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-md text-sm font-bold">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-black text-sm mb-2">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 font-bold border-4 border-black h-12 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-sm mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 font-bold border-4 border-black h-12 rounded-lg"
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 font-bold border-4 border-black h-12 rounded-lg"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black text-lg py-4 brutal-button rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-600">OR</p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full border-4 border-black font-bold flex items-center justify-center gap-2 brutal-button rounded-lg"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="font-bold text-gray-600 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-500 hover:text-purple-600 font-black">
              SIGN IN
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="outline" className="font-black brutal-button hover:bg-gray-100 bg-transparent rounded-lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
