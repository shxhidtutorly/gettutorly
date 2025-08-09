import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calculator,
  Sparkles,
  StickyNote,
  MessageCircle,
  Users,
  HelpCircle,
  Zap,
  Brain,
  TrendingUp,
  CheckCircle,
  Award,
  Clock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import ProgressCard from "@/components/dashboard/ProgressCard";

// BRUTALIST COLOR PALETTE
const brutalColors = [
  { bg: "bg-white", text: "text-black", border: "brutal-border", hover: "hover:scale-[1.03]", icon: "text-black" },
  { bg: "bg-purple-500", text: "text-white", border: "brutal-border", hover: "hover:scale-[1.03]", icon: "text-white" },
  { bg: "bg-blue-600", text: "text-white", border: "brutal-border", hover: "hover:scale-[1.03]", icon: "text-white" },
  { bg: "bg-green-600", text: "text-white", border: "brutal-border", hover: "hover:scale-[1.03]", icon: "text-white" },
  { bg: "bg-orange-500", text: "text-white", border: "brutal-border", hover: "hover:scale-[1.03]", icon: "text-white" },
  { bg: "bg-red-500", text: "text-white", border: "brutal-border", hover: "hover:scale-[1.03]", icon: "text-white" },
];

const brutalistCardAnim = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, loading } = useUserStats(user?.uid || null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.metadata?.creationTime && user?.metadata?.lastSignInTime) {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
      const timeDiff = Math.abs(lastSignInTime - creationTime);
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
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Brutalist Feature Cards (matches landing)
  const featureCards = [
    {
      icon: <Sparkles className="w-12 h-12 mb-4" />,
      title: "AI NOTES",
      desc: "Smart note generation from any content",
      route: "/ai-notes",
      color: brutalColors[0]
    },
    {
      icon: <MessageCircle className="w-12 h-12 mb-4" />,
      title: "MATH CHAT",
      desc: "Solve problems with step-by-step help",
      route: "/math-chat",
      color: brutalColors[1]
    },
    {
      icon: <Users className="w-12 h-12 mb-4" />,
      title: "AUDIO RECAP",
      desc: "Convert lectures to organized notes",
      route: "/audio-notes",
      color: brutalColors[2]
    },
    {
      icon: <HelpCircle className="w-12 h-12 mb-4" />,
      title: "DOUBT CHAIN",
      desc: "Break down complex concepts easily",
      route: "/doubt-chain",
      color: brutalColors[3]
    },
    {
      icon: <Zap className="w-12 h-12 mb-4" />,
      title: "SMART FLASHCARDS",
      desc: "Adaptive cards that evolve with you",
      route: "/flashcards",
      color: brutalColors[4]
    },
    {
      icon: <BookOpen className="w-12 h-12 mb-4" />,
      title: "INSTANT QUIZZES",
      desc: "Auto-generate tests from materials",
      route: "/quiz",
      color: brutalColors[5]
    }
  ];

  // Quick Actions (keep smaller, but brutalist)
  const quickActions = [
    {
      title: "Summarize",
      desc: "Quickly summarize any text",
      icon: <StickyNote className="h-8 w-8 mb-2 text-pink-400" />,
      route: "/summaries",
      bg: "bg-pink-600 text-white"
    },
    {
      title: "Library",
      desc: "Browse your materials",
      icon: <BookOpen className="h-8 w-8 mb-2 text-indigo-400" />,
      route: "/library",
      bg: "bg-indigo-600 text-white"
    },
    {
      title: "AI Assistant",
      desc: "Get personalized help",
      icon: <Brain className="h-8 w-8 mb-2 text-cyan-400" />,
      route: "/ai-assistant",
      bg: "bg-cyan-600 text-white"
    },
    {
      title: "Progress",
      desc: "Track your learning",
      icon: <TrendingUp className="h-8 w-8 mb-2 text-orange-400" />,
      route: "/progress",
      bg: "bg-orange-600 text-white"
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-mono">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111] text-white font-mono">
      <Navbar />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-black mb-2 text-white">{getWelcomeMessage()}</h1>
            <p className="text-gray-300 text-base md:text-lg">Here's your learning progress overview</p>
          </motion.div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            <ProgressCard
              title="Study Time"
              value={formatStudyTime(stats?.total_study_time || 0)}
              icon={<Clock className="h-7 w-7 text-blue-400" />}
              color="blue"
              trend={`${stats?.sessions_this_month || 0} sessions this month`}
              className="brutal-border bg-[#181818] text-white"
            />
            <ProgressCard
              title="Learning Milestones"
              value={stats?.learning_milestones || 0}
              icon={<Award className="h-7 w-7 text-green-400" />}
              color="green"
              trend="Total achievements"
              className="brutal-border bg-[#181818] text-white"
            />
            <ProgressCard
              title="Quizzes"
              value={stats?.quizzes_taken || 0}
              icon={<CheckCircle className="h-7 w-7 text-yellow-400" />}
              color="yellow"
              trend={`${stats?.average_quiz_score || 0}% avg score`}
              className="brutal-border bg-[#181818] text-white"
            />
            <ProgressCard
              title="AI Notes"
              value={stats?.notes_created || 0}
              icon={<Sparkles className="h-7 w-7 text-purple-400" />}
              color="purple"
              trend="Notes generated"
              className="brutal-border bg-[#181818] text-white"
            />
          </div>

          {/* BRUTALIST FEATURE CARDS */}
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {featureCards.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial="initial"
                  animate="animate"
                  variants={brutalistCardAnim}
                  transition={{ ...brutalistCardAnim.transition, delay: idx * 0.08 }}
                >
                  <div
                    className={`relative p-8 cursor-pointer transition-all duration-150 ${feature.color.bg} ${feature.color.text} ${feature.color.border} ${feature.color.hover} brutal-shadow group`}
                    onClick={() => handleNavigation(feature.route)}
                    style={{
                      minHeight: "260px",
                      borderWidth: "4px",
                      borderRadius: "0px",
                      boxShadow: "6px 6px 0 0 #000"
                    }}
                  >
                    <div className={`absolute top-6 right-6 ${feature.color.icon} opacity-40`}>
                      {feature.icon}
                    </div>
                    <div className="mb-10">
                      <div className={`w-12 h-12 mb-4`}></div>
                    </div>
                    <h3 className="font-black text-2xl mb-2">{feature.title}</h3>
                    <p className="font-bold text-base mb-6">{feature.desc}</p>
                    <div className="flex items-center justify-between mt-8 font-black text-base group-hover:underline">
                      <span>EXPLORE {feature.title}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2 text-white">
              <TrendingUp className="text-cyan-400 h-6 w-6" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.09 + 0.3 }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`p-6 cursor-pointer brutal-border brutal-shadow transition-all duration-200 font-black ${action.bg}`}
                    onClick={() => handleNavigation(action.route)}
                    style={{
                      borderWidth: "4px",
                      borderRadius: "0px",
                      boxShadow: "6px 6px 0 0 #000"
                    }}
                  >
                    <div className="mb-2">{action.icon}</div>
                    <h3 className="font-black text-lg mb-1">{action.title}</h3>
                    <p className="font-bold text-sm mb-3">{action.desc}</p>
                  </div>
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
