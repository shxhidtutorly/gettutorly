import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  BookOpen,
  Sparkles,
  MessageCircle,
  Users,
  HelpCircle,
  Zap,
  TrendingUp,
  Brain,
  StickyNote,
  Clock,
  Award,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import ProgressCard from "@/components/dashboard/ProgressCard";
import { Button } from "@/components/ui/button";

// --- Neon Brutalist UI Configuration ---

// 1. NEON COLOR PALETTE
const neonColors = {
  cyan: {
    base: 'cyan-400',
    border: 'border-cyan-400',
    shadow: 'shadow-[4px_4px_0px_#00f7ff]',
    hoverShadow: 'hover:shadow-[6px_6px_0px_#00f7ff]',
    text: 'text-cyan-400',
  },
  green: {
    base: 'green-400',
    border: 'border-green-400',
    shadow: 'shadow-[4px_4px_0px_#22c55e]',
    hoverShadow: 'hover:shadow-[6px_6px_0px_#22c55e]',
    text: 'text-green-400',
  },
  pink: {
    base: 'pink-500',
    border: 'border-pink-500',
    shadow: 'shadow-[4px_4px_0px_#ec4899]',
    hoverShadow: 'hover:shadow-[6px_6px_0px_#ec4899]',
    text: 'text-pink-500',
  },
  yellow: {
    base: 'yellow-400',
    border: 'border-yellow-400',
    shadow: 'shadow-[4px_4px_0px_#facc15]',
    hoverShadow: 'hover:shadow-[6px_6px_0px_#facc15]',
    text: 'text-yellow-400',
  },
  purple: {
    base: 'purple-500',
    border: 'border-purple-500',
    shadow: 'shadow-[4px_4px_0px_#a855f7]',
    hoverShadow: 'hover:shadow-[6px_6px_0px_#a855f7]',
    text: 'text-purple-500',
  },
  blue: {
    base: 'blue-500',
    border: 'border-blue-500',
    shadow: 'shadow-[4px_4px_0px_#3b82f6]',
    hoverShadow: 'hover:shadow-[6px_6px_0px_#3b82f6]',
    text: 'text-blue-500',
  }
};

const featureColors = [
  neonColors.cyan,
  neonColors.green,
  neonColors.pink,
  neonColors.yellow,
  neonColors.purple,
  neonColors.blue,
];

// 2. ANIMATION VARIANTS
const cardAnimation = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
};

// 3. CUSTOM LOADER COMPONENT
const BrutalLoader = () => {
  const loadingText = "LOADING_DASHBOARD...".split("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono">
      <div className="w-24 h-24 mb-6">
        <motion.div
          className="w-full h-full bg-cyan-400"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="flex space-x-1">
        {loadingText.map((char, index) => (
          <motion.span
            key={index}
            className="text-cyan-400 font-bold"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

// 4. FEATURE CARDS DATA
const featureCards = [
  {
    title: "AI Notes Generator",
    description: "Transform any text into comprehensive study notes with AI",
    icon: StickyNote,
    path: "/ai-notes",
    color: neonColors.cyan,
  },
  {
    title: "Math Solver",
    description: "Get step-by-step solutions to complex math problems",
    icon: Brain,
    path: "/math-chat",
    color: neonColors.green,
  },
  {
    title: "Audio Recap",
    description: "Convert audio recordings into detailed study materials",
    icon: MessageCircle,
    path: "/audio-recap",
    color: neonColors.pink,
  },
  {
    title: "Study Plans",
    description: "Create and track personalized study schedules",
    icon: Clock,
    path: "/study-plans",
    color: neonColors.yellow,
  },
  {
    title: "Flashcards",
    description: "Generate interactive flashcards from your study materials",
    icon: Zap,
    path: "/flashcards",
    color: neonColors.purple,
  },
  {
    title: "Progress Tracking",
    description: "Monitor your learning progress with detailed analytics",
    icon: TrendingUp,
    path: "/progress",
    color: neonColors.blue,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useUserStats();

  // FIXED: Handle loading states properly
  const isLoading = authLoading || statsLoading;

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getTotalCreated = () => {
    if (!stats) return 0;
    return (stats.materials_created || 0) + 
           (stats.notes_created || 0) + 
           (stats.quizzes_taken || 0) + 
           (stats.flashcards_created || 0);
  };

  // FIXED: Handle navigation with proper error handling
  const handleNavigation = useCallback((path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [navigate]);

  // FIXED: Show loading state while authentication or stats are loading
  if (isLoading) {
    return <BrutalLoader />;
  }

  // FIXED: Handle unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome back, {user.displayName || user.email?.split('@')[0] || 'Student'}!
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Ready to continue your learning journey?
            </motion.p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className={`bg-gray-900 border-2 ${neonColors.cyan.border} ${neonColors.cyan.shadow} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Study Time</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {formatStudyTime(stats.total_study_time || 0)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
              </div>

              <div className={`bg-gray-900 border-2 ${neonColors.green.border} ${neonColors.green.shadow} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Materials Created</p>
                    <p className="text-2xl font-bold text-green-400">
                      {getTotalCreated()}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className={`bg-gray-900 border-2 ${neonColors.pink.border} ${neonColors.pink.shadow} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Sessions This Month</p>
                    <p className="text-2xl font-bold text-pink-500">
                      {stats.sessions_this_month || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-pink-500" />
                </div>
              </div>

              <div className={`bg-gray-900 border-2 ${neonColors.yellow.border} ${neonColors.yellow.shadow} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Learning Milestones</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {stats.learning_milestones || 0}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={cardAnimation}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-900 border-2 ${feature.color.border} ${feature.color.shadow} ${feature.color.hoverShadow} p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1`}
                onClick={() => handleNavigation(feature.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className={`h-8 w-8 ${feature.color.text}`} />
                  <ArrowRight className={`h-5 w-5 ${feature.color.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Click to explore</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => handleNavigation('/ai-notes')}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Notes
              </Button>
              <Button 
                onClick={() => handleNavigation('/math-chat')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Solve Math
              </Button>
              <Button 
                onClick={() => handleNavigation('/study-plans')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
              <Button 
                onClick={() => handleNavigation('/progress')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Progress
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
