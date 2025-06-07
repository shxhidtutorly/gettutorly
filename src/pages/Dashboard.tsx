
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
  Award,
  Brain,
  Zap,
  BookMarked,
  HelpCircle,
  Flame,
  TrendingUp,
  Camera,
  Clock,
  CheckCircle,
  Calculator,
  Sparkles,
  StickyNote
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion, AnimatePresence } from "framer-motion";

// Simplified Confetti component to prevent animation issues
const Confetti = () => (
  <div
    style={{
      position: "absolute",
      top: -10,
      right: 0,
      zIndex: 1,
      pointerEvents: "none",
      width: 70,
      height: 50,
    }}
  >
    <svg viewBox="0 0 70 50" width="70" height="50">
      <circle cx="10" cy="10" r="3" fill="#fbbf24" />
      <circle cx="25" cy="20" r="2" fill="#60a5fa" />
      <circle cx="40" cy="8" r="2.5" fill="#a7f3d0" />
      <circle cx="60" cy="15" r="3" fill="#f472b6" />
      <circle cx="35" cy="35" r="2.5" fill="#fcd34d" />
      <circle cx="55" cy="28" r="2" fill="#f87171" />
    </svg>
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { stats } = useStudyTracking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);

  // Confetti appears on mount for Today's Activity
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  const getUserDisplayName = () => {
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  if (!currentUser) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  // Cool emoji icons for stats
  const activityStats = [
    {
      label: "Summaries",
      value: stats.summariesGenerated,
      color: "text-blue-500",
      emoji: "📝",
      bg: "bg-gradient-to-br from-blue-500/60 to-blue-400/30",
    },
    {
      label: "AI Notes",
      value: stats.notesCreated,
      color: "text-green-500",
      emoji: "🧠",
      bg: "bg-gradient-to-br from-green-400/60 to-green-300/30",
    },
    {
      label: "Quizzes",
      value: stats.quizzesCompleted,
      color: "text-yellow-500",
      emoji: "❓",
      bg: "bg-gradient-to-br from-yellow-400/60 to-yellow-300/30",
    },
    {
      label: "Math Problems",
      value: stats.mathProblemsSolved,
      color: "text-purple-500",
      emoji: "➗",
      bg: "bg-gradient-to-br from-purple-400/60 to-purple-300/30",
    },
  ];

  // Study Tools including Summarize
  const studyTools = [
    {
      title: "Math Chat",
      desc: "Solve math problems with AI",
      icon: <Calculator className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/math-chat"
    },
    {
      title: "AI Notes",
      desc: "Generate smart notes from files",
      icon: <Brain className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/ai-notes"
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
      icon: <Zap className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/flashcards"
    },
    {
      title: "Quizzes",
      desc: "Test your knowledge",
      icon: <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/quiz"
    },
  ];

  const quickActions = [
    {
      title: "AI Doubt Chain",
      desc: "Break down complex concepts",
      icon: <Brain className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/doubt-chain"
    },
    {
      title: "Create Plan",
      desc: "Plan your study sessions",
      icon: <Calendar className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/study-plans"
    },
    {
      title: "AI Assistant",
      desc: "Get personalized help",
      icon: <Brain className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/ai-assistant"
    },
    {
      title: "View Progress",
      desc: "Track your learning",
      icon: <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
      route: "/progress"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white relative">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
              Welcome back, {getUserDisplayName()}! 
              <span 
                className="text-2xl animate-bounce"
                style={{
                  display: 'inline-block',
                  animationDuration: '2s',
                  animationIterationCount: 'infinite'
                }}
              >
                👋
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Here's your learning progress overview</p>
          </motion.div>

          {/* Study Streak */}
          <motion.div
            className="flex items-center gap-2 mb-6 md:mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 110, delay: 0.2 }}
          >
            <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-400 animate-pulse" />
            <span className="font-semibold text-orange-300 text-sm md:text-base flex items-center gap-1">
              {stats.streakDays}-day streak!
              <span className="ml-1 text-base">🔥</span>
            </span>
            <Badge className="ml-2 bg-orange-600/30 border-orange-400 text-orange-100 text-xs">
              Keep it up!
            </Badge>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {/* Study Hours */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="dark:bg-card transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/30">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Study Hours</p>
                      <p className="text-lg md:text-2xl font-bold flex items-center gap-1">
                        {stats.totalStudyHours.toFixed(1)}h 
                        <span className="text-blue-400">⏰</span>
                      </p>
                    </div>
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sessions */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="dark:bg-card transition-all shadow-lg shadow-green-900/20 hover:shadow-green-500/30">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Sessions</p>
                      <p className="text-lg md:text-2xl font-bold flex items-center gap-1">
                        {stats.sessionCount} 
                        <span className="text-green-400">🎯</span>
                      </p>
                    </div>
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quizzes */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="dark:bg-card transition-all shadow-lg shadow-yellow-900/20 hover:shadow-yellow-500/30">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Quizzes</p>
                      <p className="text-lg md:text-2xl font-bold flex items-center gap-1">
                        {stats.quizzesCompleted} 
                        <span className="text-yellow-400">❓</span>
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Summaries */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="dark:bg-card transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-500/30">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Created</p>
                      <p className="text-lg md:text-2xl font-bold flex items-center gap-1">
                        {stats.summariesGenerated + stats.notesCreated} 
                        <span className="text-purple-400">📝</span>
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Summary */}
          <div className="mb-6 md:mb-8 relative">
            <Card className="dark:bg-card shadow-xl border-0 relative overflow-visible">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <Sparkles className="text-yellow-400 animate-pulse h-5 w-5 mr-1" />
                <CardTitle className="text-base md:text-lg flex items-center gap-1">
                  Today's Activity
                  <span className="text-xl ml-1">🌟</span>
                </CardTitle>
                {showConfetti && (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1.15, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="relative"
                  >
                    <Confetti />
                  </motion.div>
                )}
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
                      <div className={`rounded-lg p-4 md:p-6 ${stat.bg} shadow-md flex flex-col items-center justify-center`}>
                        <span className="text-2xl md:text-3xl mb-1">{stat.emoji}</span>
                        <p className={`text-xl md:text-2xl font-extrabold ${stat.color} mb-0`}>
                          {stat.value}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground font-semibold">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Tools Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-pink-400 animate-pulse h-5 w-5" />
              Study Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {studyTools.map((tool, idx) => (
                <motion.div
                  key={tool.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 160 }}
                >
                  <Card
                    className="cursor-pointer dark:bg-card transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={() => navigate(tool.route)}
                  >
                    <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
                      {tool.icon}
                      <h3 className="font-medium text-sm md:text-base">{tool.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{tool.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 md:mt-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="text-cyan-400 animate-pulse h-5 w-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 160 }}
                >
                  <Card
                    className="cursor-pointer dark:bg-card shadow-md hover:shadow-lg"
                    onClick={() => navigate(action.route)}
                  >
                    <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
                      {action.icon}
                      <h3 className="font-medium text-sm md:text-base">{action.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{action.desc}</p>
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
