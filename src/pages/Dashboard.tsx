import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useUserStats } from "@/hooks/useUserStats";
import { useRandomStats } from "@/hooks/useRandomStats"; // Import the new hook

// Updated Icons from Lucide React for a modern, consistent look
import {
  BookOpen,
  Sparkles,
  MessageCircle,
  Award,
  HelpCircle,
  Zap,
  StickyNote,
  Clock,
  CheckCircle,
  ArrowRight,
  Files,
  Brain,
  Upload,
  BarChart3,
  Lightbulb, // A new icon for a new card
  LineChart, // Replaced BarChart3 with something more fitting for a trend
  User, // For AI Assistant
  NotebookPen, // For AI Notes
  MessageSquare, // For Math Chat
  FileText, // For Summarize
  FileStack, // For Multi-doc
  Wand2, // For Content Processor
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

// Helper function to check if the user is new (e.g., created in the last 2 days)
const isNewUserCheck = (user) => {
  if (!user || !user.metadata || !user.metadata.creationTime) return false;
  const creationDate = new Date(user.metadata.creationTime);
  const now = new Date();
  const diffInDays = (now.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
  return diffInDays < 2;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isNewUser = useMemo(() => isNewUserCheck(user), [user]);
  const { stats: firebaseStats, loading: statsLoading } = useUserStats();
  const { stats: mockStats, loading: mockStatsLoading } = useRandomStats(isNewUser);

  const [theme, setTheme] = useState("dark"); // Default to dark theme

  // Determine which stats to display
  const displayedStats = useMemo(() => {
    // If we have actual Firebase stats, use them.
    // Otherwise, use the random mock stats logic.
    return (firebaseStats && Object.keys(firebaseStats).length > 0) ? firebaseStats : mockStats;
  }, [firebaseStats, mockStats]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  }, [user]);

  const getWelcomeMessage = useCallback(() => {
    const name = getUserDisplayName();
    return `${t('dashboard.welcomeBack', { name })} 👋`;
  }, [getUserDisplayName, t]);

  const formatStudyTime = (minutes) => {
    if (!minutes) return `0${t('dashboard.min')}`;
    if (minutes < 60) return `${minutes}${t('dashboard.min')}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}${t('dashboard.h')} ${remainingMinutes}${t('dashboard.m')}` : `${hours}${t('dashboard.h')}`;
  };

  const dashboardLoading = authLoading || (isNewUser ? mockStatsLoading : statsLoading);

  if (dashboardLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-mono ${
        theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-100'
      }`}>
        <motion.div
          className="w-16 h-16 border-4 border-black mb-8 rounded-full"
          style={{ backgroundColor: '#00e6c4' }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <div className="text-xl font-black tracking-wider text-center">{t('common.loading')} TUTORLY...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const featureCards = [
    {
      icon: NotebookPen,
      title: t('navigation.aiNotes'),
      desc: t('dashboard.aiNotesDesc'),
      route: "/ai-notes",
      count: displayedStats?.notes_created || 0,
      accent: "#ff5a8f",
    },
    {
      icon: MessageSquare,
      title: t('navigation.mathChat'),
      desc: t('dashboard.mathChatDesc'),
      route: "/math-chat",
      count: displayedStats?.math_chat_sessions || 0,
      accent: "#00e6c4",
    },
    {
      icon: Lightbulb,
      title: t('navigation.audioRecap'),
      desc: t('dashboard.audioRecapDesc'),
      route: "/audio-notes",
      count: displayedStats?.audio_recaps_created || 0,
      accent: "#ff5a8f",
    },
    {
      icon: HelpCircle,
      title: t('navigation.doubtChain'),
      desc: t('dashboard.doubtChainDesc'),
      route: "/doubt-chain",
      count: displayedStats?.doubt_chains_used || 0,
      accent: "#00e6c4",
    },
    {
      icon: Zap,
      title: t('navigation.flashcards'),
      desc: t('dashboard.flashcardsDesc'),
      route: "/flashcards",
      count: displayedStats?.flashcards_created || 0,
      accent: "#ff5a8f",
    },
    {
      icon: BookOpen,
      title: t('navigation.quiz'),
      desc: t('dashboard.quizDesc'),
      route: "/quiz",
      count: displayedStats?.quizzes_taken || 0,
      accent: "#00e6c4",
    }
  ];

  const quickActions = [
    { title: t('dashboard.summarize'), desc: t('dashboard.summarizeDesc'), icon: FileText, route: "/summaries", accent: "#00e6c4" },
    { title: "TUTOR ME", desc: t('dashboard.multiDocDesc'), icon: FileStack, route: "/multi-doc-session", accent: "#ff5a8f" },
    { title: t('dashboard.aiAssistant'), desc: t('dashboard.aiAssistantDesc'), icon: User, route: "/ai-assistant", accent: "#00e6c4" },
    { title: t('dashboard.contentProcessor'), desc: t('dashboard.contentProcessorDesc'), icon: Wand2, route: "/aicontentprocessor", accent: "#ff5a8f" },
  ];

  const themeClasses = theme === 'light' ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-100';
  const panelClasses = theme === 'light' ? 'bg-white border-black' : 'bg-zinc-800 border-zinc-300';
  const mutedTextClasses = theme === 'light' ? 'text-stone-600' : 'text-zinc-400';

  return (
    <div className={`min-h-screen flex flex-col font-mono ${themeClasses}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              {getWelcomeMessage()}
            </h1>
            <p className={`text-lg ${mutedTextClasses}`}>
              {t('dashboard.subtitle')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: t('dashboard.studyTime'),
                value: formatStudyTime(displayedStats?.total_study_time || 0),
                icon: Clock,
                trend: `${displayedStats?.sessions_this_month || 0} ${t('dashboard.sessions')}`,
                accent: '#00e6c4'
              },
              {
                title: t('dashboard.milestones'),
                value: displayedStats?.learning_milestones || 0,
                icon: Award,
                trend: t('dashboard.totalAchievements'),
                accent: '#ff5a8f'
              },
              {
                title: t('dashboard.quizScore'),
                value: `${displayedStats?.average_quiz_score || 0}%`,
                icon: CheckCircle,
                trend: `${displayedStats?.quizzes_taken || 0} ${t('dashboard.completed')}`,
                accent: '#00e6c4'
              },
              {
                title: t('dashboard.aiNotes'),
                value: displayedStats?.notes_created || 0,
                icon: NotebookPen,
                trend: t('dashboard.notesGenerated'),
                accent: '#ff5a8f'
              }
            ].map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`p-6 border-4 border-black ${panelClasses} relative overflow-hidden`}
                style={{
                  boxShadow: `6px 6px 0px ${stat.accent}`,
                }}
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.05 }}
                  className="flex items-start justify-between mb-4">
                  <stat.icon className="w-8 h-8" style={{ color: stat.accent }} />
                  <LineChart className={`w-5 h-5 ${mutedTextClasses}`} />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.05 }}
                  className="text-4xl font-black mb-2 leading-none"
                >
                  {stat.value}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.05 }}
                  className="text-sm font-bold tracking-wide mb-2"
                >
                  {stat.title}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + idx * 0.05 }}
                  className={`text-xs ${mutedTextClasses}`}
                >
                  {stat.trend}
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tight">{t('dashboard.coreTools')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((feature, idx) => (
                <motion.button
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ y: -3, boxShadow: `6px 6px 0px ${feature.accent}` }}
                  whileTap={{ y: 1, scale: 0.98 }}
                  onClick={() => handleNavigation(feature.route)}
                  className={`group p-6 text-left border-4 border-black transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                  style={{
                    boxShadow: `4px 4px 0px ${feature.accent}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <feature.icon
                      className="w-8 h-8 transition-transform group-hover:rotate-12"
                      style={{ color: feature.accent }}
                    />
                    <div
                      className="px-3 py-1 border-2 border-black font-black text-sm"
                      style={{
                        backgroundColor: feature.accent,
                        color: '#000'
                      }}
                    >
                      {feature.count}
                    </div>
                  </div>
                  <h3 className="font-black text-xl mb-2 tracking-wide">{feature.title}</h3>
                  <p className={`${mutedTextClasses} font-bold mb-4`}>{feature.desc}</p>
                  <div className="flex items-center justify-end text-sm font-black tracking-wider group-hover:translate-x-1 transition-transform">
                    {t('dashboard.explore')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 tracking-tight">
              <Zap className="w-7 h-7" style={{ color: '#00e6c4' }} />
              {t('dashboard.quickActions')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ x: 3, boxShadow: `4px 4px 0px ${action.accent}` }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(action.route)}
                  className={`group p-5 text-left border-4 border-black flex items-center gap-4 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                  style={{
                    boxShadow: '3px 3px 0px #000',
                  }}
                >
                  <action.icon className="w-6 h-6 flex-shrink-0 transition-transform group-hover:rotate-12" style={{ color: action.accent }} />
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
      <BottomNav theme={theme} />
    </div>
  );
};

export default Dashboard;
