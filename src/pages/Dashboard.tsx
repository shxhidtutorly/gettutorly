
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
import { useUserStats } from "@/hooks/useUserStats";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useUserActivity } from "@/hooks/useUserActivity";
import ProgressCard from "@/components/dashboard/ProgressCard";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useUserStats(user?.uid || null);
  const { weeklyHours, isNewUser, loading: activityLoading } = useUserActivity(user?.uid || null);

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

  const formatStudyTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}min`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const learningMilestones = useMemo(() => {
    if (!stats) return 0;
    const {
      summaries_created = 0,
      notes_created = 0,
      quizzes_taken = 0,
      flashcards_created = 0,
    } = stats;
    return summaries_created + notes_created + quizzes_taken + flashcards_created;
  }, [stats]);

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

  if (statsLoading || activityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
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
              title="Study Hours"
              value={formatStudyTime(weeklyHours)}
              icon={<Clock className="h-6 w-6 text-blue-400" />}
              color="blue"
              trend="+2.5hrs this week"
            />
            
            <ProgressCard
              title="Learning Milestones"
              value={learningMilestones}
              icon={<Award className="h-6 w-6 text-green-400" />}
              color="green"
              trend="+12 this month"
            />

            <ProgressCard
              title="Quizzes"
              value={stats?.quizzes_taken || 0}
              icon={<CheckCircle className="h-6 w-6 text-yellow-400" />}
              color="yellow"
              trend="85% avg score"
            />

            <ProgressCard
              title="AI Notes"
              value={stats?.notes_created || 0}
              icon={<Sparkles className="h-6 w-6 text-purple-400" />}
              color="purple"
              trend="+5 this week"
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
