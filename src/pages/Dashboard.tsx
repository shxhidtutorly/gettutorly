import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  Calendar,
  Brain,
  Zap,
  HelpCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Calculator,
  Sparkles,
  StickyNote,
  MessageCircle,
  Users,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import ProgressCard from "@/components/dashboard/ProgressCard";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  // FIX: Pass user?.uid to useUserStats so stats load for the logged-in user
  const { stats, loading } = useUserStats(user?.uid || null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  // Check if user is new (first time login)
  useEffect(() => {
    if (user?.metadata?.creationTime && user?.metadata?.lastSignInTime) {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
      const timeDiff = Math.abs(lastSignInTime - creationTime);
      // If less than 5 minutes difference, consider as new user
      setIsNewUser(timeDiff < 5 * 60 * 1000);
    }
  }, [user]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  }, [user]);

  const getWelcomeMessage = useCallback(() => {
    const name = getUserDisplayName();
    if (isNewUser) {
      return `Welcome to Tutorly, ${name}! 🎉`;
    }
    return `Welcome back, ${name}! 👋`;
  }, [getUserDisplayName, isNewUser]);

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const studyTools = useMemo(() => [
    {
      title: "Math Chat",
      desc: "Solve math problems with AI",
      icon: <Calculator className="h-6 w-6 md:h-8 md:w-8 text-purple-400 mx-auto mb-2" />,
      route: "/math-chat"
    },
    {
      title: "AI Notes",
      desc: "Generate smart notes from files",
      icon: <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-blue-400 mx-auto mb-2" />,
      route: "/ai-notes"
    },
    {
      title: "Audio Recap",
      desc: "Convert audio to notes",
      icon: <Users className="h-6 w-6 md:h-8 md:w-8 text-green-400 mx-auto mb-2" />,
      route: "/audio-notes"
    },
    {
      title: "Summarize",
      desc: "Quickly summarize any text",
      icon: <StickyNote className="h-6 w-6 md:h-8 md:w-8 text-pink-400 mx-auto mb-2" />,
      route: "/summaries"
    },
    {
      title: "Flashcards",
      desc: "Create and review flashcards",
      icon: <Zap className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 mx-auto mb-2" />,
      route: "/flashcards"
    },
    {
      title: "Tests & Quiz",
      desc: "Test your knowledge",
      icon: <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-red-400 mx-auto mb-2" />,
      route: "/quiz"
    },
  ], []);

  const quickActions = useMemo(() => [
    {
      title: "Doubt Chain",
      desc: "Break down complex concepts",
      icon: <Brain className="h-6 w-6 md:h-8 md:w-8 text-cyan-400 mx-auto mb-2" />,
      route: "/doubt-chain"
    },
    {
      title: "Library",
      desc: "Browse your materials",
      icon: <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-indigo-400 mx-auto mb-2" />,
      route: "/library"
    },
    {
      title: "AI Assistant",
      desc: "Get personalized help",
      icon: <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 mx-auto mb-2" />,
      route: "/ai-assistant"
    },
    {
      title: "Progress",
      desc: "Track your learning",
      icon: <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-orange-400 mx-auto mb-2" />,
      route: "/progress"
    }
  ], []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-xl md:text-3xl font-bold mb-2">
              {getWelcomeMessage()}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Here's your learning progress overview</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 md:mb-8">
            <ProgressCard
              title="Study Time"
              value={formatStudyTime(stats?.total_study_time || 0)}
              icon={<Clock className="h-6 w-6 text-blue-400" />}
              color="blue"
              trend={`${stats?.sessions_this_month || 0} sessions this month`}
            />
            
            <ProgressCard
              title="Learning Milestones"
              value={stats?.learning_milestones || 0}
              icon={<Award className="h-6 w-6 text-green-400" />}
              color="green"
              trend="Total achievements"
            />

            <ProgressCard
              title="Quizzes"
              value={stats?.quizzes_taken || 0}
              icon={<CheckCircle className="h-6 w-6 text-yellow-400" />}
              color="yellow"
              trend={`${stats?.average_quiz_score || 0}% avg score`}
            />

            <ProgressCard
              title="AI Notes"
              value={stats?.notes_created || 0}
              icon={<Sparkles className="h-6 w-6 text-purple-400" />}
              color="purple"
              trend="Notes generated"
            />
          </div>

          {/* Study Tools Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-pink-400 h-5 w-5" />
              Study Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
              {studyTools.map((tool, idx) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className="bg-[#121212] border-slate-700 hover:border-slate-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group"
                    onClick={() => handleNavigation(tool.route)}
                  >
                    <CardContent className="p-4 md:p-6 text-center">
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {tool.icon}
                      </div>
                      <h3 className="font-medium text-sm md:text-base text-white">{tool.title}</h3>
                      <p className="text-xs md:text-sm text-gray-400">{tool.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyan-400 h-5 w-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="bg-[#121212] border-slate-700 hover:border-slate-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                    onClick={() => handleNavigation(action.route)}
                  >
                    <CardContent className="p-4 md:p-6 text-center">
                      {action.icon}
                      <h3 className="font-medium text-sm md:text-base text-white">{action.title}</h3>
                      <p className="text-xs md:text-sm text-gray-400">{action.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
