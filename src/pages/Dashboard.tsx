
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  Calendar,
  FileText,
  Brain,
  Zap,
  BookMarked,
  HelpCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Calculator,
  Sparkles,
  StickyNote,
  MessageCircle,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { stats, loading: statsLoading } = useUserStats();
  const navigate = useNavigate();

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Show loading state while authentication is being checked
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

  // Show sign-in message only after loading is complete and user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Tutorly</h2>
          <p className="text-lg mb-6">Please sign in to view your dashboard.</p>
          <Button onClick={() => navigate('/signin')}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  // Activity stats with clean icons
  const activityStats = [
    {
      label: "Summaries",
      value: stats.summaries_created,
      color: "text-blue-500",
      icon: "📝",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-400/10",
    },
    {
      label: "AI Notes",
      value: stats.notes_created,
      color: "text-green-500",
      icon: "✨",
      bg: "bg-gradient-to-br from-green-400/20 to-green-300/10",
    },
    {
      label: "Quizzes",
      value: stats.quizzes_taken,
      color: "text-yellow-500",
      icon: "❓",
      bg: "bg-gradient-to-br from-yellow-400/20 to-yellow-300/10",
    },
    {
      label: "Flashcards",
      value: stats.flashcards_created,
      color: "text-purple-500",
      icon: "⚡",
      bg: "bg-gradient-to-br from-purple-400/20 to-purple-300/10",
    },
  ];

  // Study Tools including Summarize and Notes Chat
  const studyTools = [
    {
      title: "Math Chat",
      desc: "Solve math problems with AI",
      icon: <Calculator className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/math-chat"
    },
    {
      title: "AI Notes",
      desc: "Generate smart notes from files",
      icon: <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/ai-notes-generator"
    },
    {
      title: "Audio Recap",
      desc: "Convert audio to notes",
      icon: <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />,
      route: "/audio-notes"
    },
    {
      title: "Summarize",
      desc: "Quickly summarize any text",
      icon: <StickyNote className="h-6 w-6 text-pink-400 mx-auto mb-2" />,
      route: "/summaries"
    },
    {
      title: "Flashcards",
      desc: "Create and review flashcards",
      icon: <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/flashcards"
    },
    {
      title: "Tests & Quiz",
      desc: "Test your knowledge",
      icon: <HelpCircle className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/quiz"
    },
  ];

  const quickActions = [
    {
      title: "Doubt Chain",
      desc: "Break down complex concepts",
      icon: <Brain className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/doubt-chain"
    },
    {
      title: "Library",
      desc: "Browse your materials",
      icon: <BookOpen className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/library"
    },
    {
      title: "AI Assistant",
      desc: "Get personalized help",
      icon: <MessageCircle className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/ai-assistant"
    },
    {
      title: "Insights",
      desc: "Track your learning",
      icon: <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
      route: "/progress"
    }
  ];

  const totalStudyHours = stats.total_study_time / 3600; // Convert seconds to hours

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white w-full overflow-x-hidden">
      <Navbar />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto w-full">
        <div className="space-y-6">

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  Welcome back, {getUserDisplayName()}! <span className="animate-waving-hand text-2xl origin-bottom">👋</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">Here's your learning progress overview</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Study Hours */}
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 2px 32px #2563eb44' }} whileTap={{ scale: 0.97 }}>
              <Card className="bg-[#121212] border-slate-700 hover:border-slate-600 transition-all shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Study Hours</p>
                      <p className="text-xl font-bold flex items-center gap-1">
                        {totalStudyHours < 1
                          ? Math.round(totalStudyHours * 60)
                          : Number(totalStudyHours).toFixed(1)}
                        {totalStudyHours < 1 ? "min" : "h"}
                      </p>
                    </div>
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Materials */}
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 2px 32px #10b98144' }} whileTap={{ scale: 0.97 }}>
              <Card className="bg-[#121212] border-slate-700 hover:border-slate-600 transition-all shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Materials</p>
                      <p className="text-xl font-bold">{stats.materials_created}</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quizzes */}
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 2px 32px #facc1544' }} whileTap={{ scale: 0.97 }}>
              <Card className="bg-[#121212] border-slate-700 hover:border-slate-600 transition-all shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Quizzes</p>
                      <p className="text-xl font-bold">{stats.quizzes_taken}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Created */}
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 2px 32px #a78bfa44' }} whileTap={{ scale: 0.97 }}>
              <Card className="bg-[#121212] border-slate-700 hover:border-slate-600 transition-all shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Created</p>
                      <p className="text-xl font-bold">
                        {stats.summaries_created + stats.notes_created + stats.flashcards_created}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Summary */}
          <div className="mb-6">
            <Card className="bg-[#121212] border-slate-700 shadow-xl">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <Sparkles className="text-yellow-400 animate-pulse h-5 w-5 mr-1" />
                <CardTitle className="text-lg flex items-center gap-1">
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {activityStats.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * idx + 0.16, type: "spring", stiffness: 120 }}
                    >
                      <div className={`rounded-lg p-4 ${stat.bg} shadow-md flex flex-col items-center justify-center`}>
                        <span className="text-2xl mb-1">{stat.icon}</span>
                        <p className={`text-xl font-extrabold ${stat.color} mb-0`}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 font-semibold">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Tools Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-pink-400 animate-pulse h-5 w-5" />
              Study Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {studyTools.map((tool, idx) => (
                <motion.div
                  key={tool.title}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 4px 32px #38bdf8bb',
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 160 }}
                >
                  <Card
                    className="bg-[#121212] border-slate-700 hover:border-slate-600 cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => navigate(tool.route)}
                  >
                    <CardContent className="p-4 text-center flex flex-col items-center">
                      {tool.icon}
                      <h3 className="font-medium text-sm">{tool.title}</h3>
                      <p className="text-xs text-gray-400">{tool.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-cyan-400 animate-pulse h-5 w-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02, boxShadow: '0 2px 28px #3b82f6aa' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 160 }}
                >
                  <Card
                    className="bg-[#121212] border-slate-700 hover:border-slate-600 cursor-pointer shadow-md"
                    onClick={() => navigate(action.route)}
                  >
                    <CardContent className="p-4 text-center flex flex-col items-center">
                      {action.icon}
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-400">{action.desc}</p>
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

      {/* Custom CSS for waving hand */}
      <style>{`
        @keyframes wave {
          0% { transform: rotate(0.0deg);}
          10% { transform: rotate(14deg);}
          20% { transform: rotate(-8deg);}
          30% { transform: rotate(14deg);}
          40% { transform: rotate(-4deg);}
          50% { transform: rotate(10.0deg);}
          60% { transform: rotate(0.0deg);}
          100% { transform: rotate(0.0deg);}
        }
        .animate-waving-hand {
          display: inline-block;
          animation: wave 2s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
