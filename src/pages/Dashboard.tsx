// Dashboard.tsx (updated)
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  BookOpen,
  Sparkles,
  MessageCircle,
  Users,
  HelpCircle,
  Zap,
  Brain,
  StickyNote,
  Clock,
  Award,
  Files,
  CheckCircle,
  ArrowRight,
  Youtube
} from "lucide-react";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { motion } from "framer-motion";
import ProgressCard from "@/components/dashboard/ProgressCard";

const Dashboard = () => {
  const { user, firebaseUser, isLoaded } = useUnifiedAuth();
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false);

  // Debounce isLoaded to avoid quick flickers when auth toggles briefly.
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (isLoaded) {
      // small delay prevents UI flicker if isLoaded toggles quickly
      t = setTimeout(() => setAuthReady(true), 120);
    } else {
      setAuthReady(false);
    }
    return () => { if (t) clearTimeout(t); };
  }, [isLoaded]);

  // If authReady but no user — safe redirect (ProtectedRoute may still handle it,
  // but having this avoids showing a blank page while route logic runs)
  useEffect(() => {
    if (authReady && !user) {
      navigate("/signin");
    }
  }, [authReady, user, navigate]);

  useEffect(() => {
    if (firebaseUser?.metadata?.creationTime && firebaseUser?.metadata?.lastSignInTime) {
      const creationTime = new Date(firebaseUser.metadata.creationTime).getTime();
      const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime).getTime();
      setIsNewUser(Math.abs(lastSignInTime - creationTime) < 5 * 60 * 1000);
    }
  }, [firebaseUser]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const getUserDisplayName = useCallback(() => {
    if (user?.fullName) return user.fullName;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  }, [user]);

  const getWelcomeMessage = useCallback(() => {
    const name = getUserDisplayName();
    return isNewUser ? `Welcome, ${name}! 🎉` : `Welcome back, ${name}! 👋`;
  }, [getUserDisplayName, isNewUser]);

  // Loader component
  const BrutalLoader = () => {
    const loadingText = "LOADING_DASHBOARD...".split("");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono">
        <div className="w-24 h-24 mb-6">
          <motion.div
            className="w-full h-full bg-cyan-400"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180],
              borderRadius: ["20%", "50%", "20%"],
            }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        </div>
        <div className="flex items-center justify-center space-x-1">
          {loadingText.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 1, 0], y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              className={`text-xl font-black ${char === '_' ? 'text-green-400' : 'text-gray-400'}`}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    );
  };

  // If auth not ready, show loader (prevents blank)
  if (!authReady) {
    return <BrutalLoader />;
  }

  // If auth ready but user missing, show loader while redirect happens
  if (!user) {
    return <BrutalLoader />;
  }

  // ... rest of your original render unchanged ...
  // (I kept your existing UI code below, omitted here for brevity)
  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-mono">
      {/* ... your existing main + Footer + BottomNav ... */}
      {/* paste your original JSX here unchanged */}
    </div>
  );
};

export default Dashboard;