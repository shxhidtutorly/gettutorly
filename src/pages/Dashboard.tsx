// FILE: src/pages/Dashboard.tsx
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
  ArrowRight,
  Files,
  Youtube,
  Sun,
  Moon,
  Plus,
  Upload,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import ProgressCard from "@/components/dashboard/ProgressCard";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useUserStats(user?.uid || null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.metadata?.creationTime && user?.metadata?.lastSignInTime) {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
      setIsNewUser(Math.abs(lastSignInTime - creationTime) < 5 * 60 * 1000);
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
    return isNewUser ? `Welcome, ${name}! 🎉` : `Welcome back, ${name}! 👋`;
  }, [getUserDisplayName, isNewUser]);
  
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const featureCards = [
    { icon: Sparkles, title: "AI NOTES", desc: "Smart note generation from any content", route: "/ai-notes", count: stats?.notes_created || 0 },
    { icon: MessageCircle, title: "MATH CHAT", desc: "Solve problems with step-by-step help", route: "/math-chat", count: stats?.math_problems_solved || 0 },
    { icon: Users, title: "AUDIO RECAP", desc: "Convert lectures to organized notes", route: "/audio-notes", count: stats?.audio_sessions || 0 },
    { icon: HelpCircle, title: "DOUBT CHAIN", desc: "Break down complex concepts easily", route: "/doubt-chain", count: stats?.doubts_resolved || 0 },
    { icon: Zap, title: "SMART FLASHCARDS", desc: "Adaptive cards that evolve with you", route: "/flashcards", count: stats?.flashcards_created || 0 },
    { icon: BookOpen, title: "INSTANT QUIZZES", desc: "Auto-generate tests from materials", route: "/quiz", count: stats?.quizzes_taken || 0 }
  ];

  const quickActions = [
    { title: "Summarize", desc: "Quickly summarize text", icon: StickyNote, route: "/summaries" },
    { title: "Multi-Doc Session", desc: "Upload & study multiple documents", icon: Files, route: "/multi-doc-session" },
    { title: "AI Assistant", desc: "Get personalized help", icon: Brain, route: "/ai-assistant" },
    { title: "AI Content Processor", desc: "Scrape study materials from URL", icon: Files, route: "/aicontentprocessor" },
  ];

  if (authLoading || statsLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-mono ${
        theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-100'
      }`}>
        <div className="w-16 h-16 mb-8">
          <motion.div
            className="w-full h-full border-4 border-black"
            style={{ backgroundColor: '#00e6c4' }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
        <div className="text-xl font-black tracking-wider">LOADING TUTORLY...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const themeClasses = theme === 'light' 
    ? 'bg-stone-100 text-stone-900'
    : 'bg-zinc-900 text-zinc-100';

  const panelClasses = theme === 'light'
    ? 'bg-white border-black'
    : 'bg-zinc-800 border-zinc-300';

  const mutedTextClasses = theme === 'light' 
    ? 'text-stone-600' 
    : 'text-zinc-400';

  return (
    <div className={`min-h-screen flex flex-col font-mono ${themeClasses}`}>
      <Navbar />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          
          {/* Header with theme toggle */}
          <div className="flex justify-between items-start mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                {getWelcomeMessage()}
              </h1>
              <p className={`text-lg ${mutedTextClasses}`}>
                Let's supercharge your learning today.
              </p>
            </motion.div>
            
            <button
              onClick={toggleTheme}
              className={`p-3 border-4 border-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
              style={{ 
                boxShadow: '4px 4px 0px #000',
                backgroundColor: theme === 'light' ? '#fff' : '#27272a'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "STUDY TIME", value: formatStudyTime(stats?.total_study_time || 0), icon: Clock, trend: `${stats?.sessions_this_month || 0} sessions`, accent: '#00e6c4' },
              { title: "MILESTONES", value: stats?.learning_milestones || 0, icon: Award, trend: "Total achievements", accent: '#ff5a8f' },
              { title: "QUIZ SCORE", value: `${stats?.average_quiz_score || 0}%`, icon: CheckCircle, trend: `${stats?.quizzes_taken || 0} completed`, accent: '#00e6c4' },
              { title: "AI NOTES", value: stats?.notes_created || 0, icon: Sparkles, trend: "Notes generated", accent: '#ff5a8f' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`p-6 border-4 border-black ${panelClasses}`}
                style={{ 
                  boxShadow: `6px 6px 0px ${stat.accent}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className="w-8 h-8" style={{ color: stat.accent }} />
                  <BarChart3 className={`w-5 h-5 ${mutedTextClasses}`} />
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold tracking-wide mb-2">{stat.title}</div>
                <div className={`text-xs ${mutedTextClasses}`}>{stat.trend}</div>
              </motion.div>
            ))}
          </div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`p-8 mb-12 border-4 border-black ${panelClasses}`}
            style={{ boxShadow: '8px 8px 0px #00e6c4' }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">UPLOAD FIRST MATERIAL</h2>
                <p className={`text-lg ${mutedTextClasses}`}>
                  Start by uploading your first study material to this study set.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleNavigation('/upload')}
                  className="px-8 py-4 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-3px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center gap-2"
                  style={{ 
                    backgroundColor: '#00e6c4',
                    color: '#000',
                    boxShadow: '4px 4px 0px #000'
                  }}
                >
                  <Upload className="w-5 h-5" />
                  UPLOAD MATERIALS
                </button>
                <button
                  onClick={() => handleNavigation('/generate')}
                  className={`px-6 py-4 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  GENERATE FROM TOPIC
                </button>
              </div>
            </div>
          </motion.div>

          {/* Feature Tiles */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tight">CORE TOOLS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((feature, idx) => (
                <motion.button
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 1 }}
                  onClick={() => handleNavigation(feature.route)}
                  className={`group p-6 text-left border-4 border-black transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                  style={{ 
                    boxShadow: `4px 4px 0px ${idx % 2 === 0 ? '#ff5a8f' : '#00e6c4'}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <feature.icon 
                      className="w-8 h-8" 
                      style={{ color: idx % 2 === 0 ? '#ff5a8f' : '#00e6c4' }} 
                    />
                    <div 
                      className="px-3 py-1 border-2 border-black font-black text-sm"
                      style={{ 
                        backgroundColor: idx % 2 === 0 ? '#ff5a8f' : '#00e6c4',
                        color: '#000'
                      }}
                    >
                      {feature.count}
                    </div>
                  </div>
                  <h3 className="font-black text-xl mb-2 tracking-wide">{feature.title}</h3>
                  <p className={`${mutedTextClasses} font-bold mb-4`}>{feature.desc}</p>
                  <div className="flex items-center justify-end text-sm font-black tracking-wider group-hover:translate-x-1 transition-transform">
                    EXPLORE <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 tracking-tight">
              <Zap className="w-7 h-7" style={{ color: '#00e6c4' }} />
              QUICK ACTIONS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(action.route)}
                  className={`group p-5 text-left border-4 border-black flex items-center gap-4 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                  style={{ 
                    boxShadow: '3px 3px 0px #000',
                  }}
                >
                  <action.icon className="w-6 h-6 flex-shrink-0" style={{ color: '#ff5a8f' }} />
                  <div>
                    <h3 className="font-black text-lg tracking-wide">{action.title}</h3>
                    <p className={`${mutedTextClasses} font-bold text-sm`}>{action.desc}</p>
                  </div>
                </motion.button>
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
