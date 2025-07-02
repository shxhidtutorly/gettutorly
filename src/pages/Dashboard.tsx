import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Calculator,
  Sparkles,
  StickyNote,
  Zap,
  HelpCircle,
  Brain,
  TrendingUp,
  MessageCircle,
  Users
} from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const { stats, loading: statsLoading } = useUserStats(user?.uid ?? null);

  const handleNavigation = useCallback((path: string) => {
    const canvasElements = document.querySelectorAll("canvas");
    canvasElements.forEach((canvas) => {
      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
      if (gl && gl.getExtension("WEBGL_lose_context")) {
        gl.getExtension("WEBGL_lose_context").loseContext();
      }
    });
    navigate(path);
  }, [navigate]);

  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/signin");
    return null;
  }

  const summaries_created = stats?.summaries_created ?? 0;
  const notes_created = stats?.notes_created ?? 0;
  const quizzes_taken = stats?.quizzes_taken ?? 0;
  const flashcards_created = stats?.flashcards_created ?? 0;
  const materials_created = stats?.materials_created ?? 0;
  const total_study_time = stats?.total_study_time ?? 0;
  const totalStudyHours = total_study_time / 3600;

  const activityStats = [
    {
      label: "Summaries",
      value: summaries_created,
      color: "text-blue-500",
      icon: "📝",
      bg: "bg-gradient-to-br from-blue-500/60 to-blue-400/30",
    },
    {
      label: "AI Notes",
      value: notes_created,
      color: "text-green-500",
      icon: "✨",
      bg: "bg-gradient-to-br from-green-400/60 to-green-300/30",
    },
    {
      label: "Quizzes",
      value: quizzes_taken,
      color: "text-yellow-500",
      icon: "❓",
      bg: "bg-gradient-to-br from-yellow-400/60 to-yellow-300/30",
    },
    {
      label: "Flashcards",
      value: flashcards_created,
      color: "text-purple-500",
      icon: "⚡",
      bg: "bg-gradient-to-br from-purple-400/60 to-purple-300/30",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      <main className="flex-1 py-4 md:py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <h1 className="text-xl font-bold mb-4">Welcome back, {getUserDisplayName()} 👋</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Study Hours</p>
              <p className="text-xl font-bold">
                {totalStudyHours < 1
                  ? Math.round(totalStudyHours * 60) + " min"
                  : totalStudyHours.toFixed(1) + " h"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Materials</p>
              <p className="text-xl font-bold">{materials_created}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Quizzes</p>
              <p className="text-xl font-bold">{quizzes_taken}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-xl font-bold">{summaries_created + notes_created + flashcards_created}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-[#121212] border-slate-700">
            <CardHeader>
              <CardTitle>Today's Activity 🌟</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {activityStats.map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`rounded-lg p-4 ${stat.bg} flex flex-col items-center`}
                  >
                    <span className="text-2xl mb-1">{stat.icon}</span>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
