import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, CheckCircle, TrendingUp, Sparkles, Zap, StickyNote, Calculator, Users, HelpCircle, MessageCircle, Brain } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const { stats, loading: statsLoading } = useUserStats();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleNavigation = useCallback((path: string) => {
    const canvasElements = document.querySelectorAll('canvas');
    canvasElements.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension('WEBGL_lose_context')) {
        gl.getExtension('WEBGL_lose_context').loseContext();
      }
    });
    navigate(path);
  }, [navigate]);

  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
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

  // Extract stats only after loading check
  const {
    summaries_created = 0,
    notes_created = 0,
    quizzes_taken = 0,
    flashcards_created = 0,
    materials_created = 0,
    total_study_time = 0,
  } = stats || {};

  const totalStudyHours = total_study_time / 3600;

  const activityStats = useMemo(() => [
    {
      label: "Summaries",
      value: summaries_created,
      icon: "📝",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/60 to-blue-400/30",
    },
    {
      label: "AI Notes",
      value: notes_created,
      icon: "✨",
      color: "text-green-500",
      bg: "bg-gradient-to-br from-green-400/60 to-green-300/30",
    },
    {
      label: "Quizzes",
      value: quizzes_taken,
      icon: "❓",
      color: "text-yellow-500",
      bg: "bg-gradient-to-br from-yellow-400/60 to-yellow-300/30",
    },
    {
      label: "Flashcards",
      value: flashcards_created,
      icon: "⚡",
      color: "text-purple-500",
      bg: "bg-gradient-to-br from-purple-400/60 to-purple-300/30",
    },
  ], [summaries_created, notes_created, quizzes_taken, flashcards_created]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome back, {getUserDisplayName()} 👋</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Study Hours */}
          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Study Hours</p>
                  <p className="text-xl font-bold">
                    {totalStudyHours < 1
                      ? Math.round(totalStudyHours * 60) + " min"
                      : totalStudyHours.toFixed(1) + " h"}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Materials</p>
                  <p className="text-xl font-bold">{materials_created}</p>
                </div>
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Quizzes */}
          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Quizzes</p>
                  <p className="text-xl font-bold">{quizzes_taken}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          {/* Created Total */}
          <Card className="bg-[#121212] border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-xl font-bold">{summaries_created + notes_created + flashcards_created}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Today's Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activityStats.map((item, idx) => (
              <div key={idx} className={`rounded-lg p-4 ${item.bg}`}>
                <div className="text-2xl">{item.icon}</div>
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
