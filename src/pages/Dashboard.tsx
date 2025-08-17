import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import { useTranslation } from "react-i18next";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import {
  BookOpen,
  Sparkles,
  MessageCircle,
  Users,
  HelpCircle,
  Zap,
  StickyNote,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  Files,
  Brain,
  Upload,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useUserStats();
  const { t } = useTranslation();
  const { language: userLanguage } = useUserLanguage();

  const [isNewUser, setIsNewUser] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Determine if the user is new based on their stats
    if (!statsLoading && stats) {
      const hasStats = stats.total_study_time > 0 ||
                       stats.learning_milestones > 0 ||
                       stats.notes_created > 0 ||
                       stats.quizzes_taken > 0 ||
                       stats.flashcards_created > 0 ||
                       stats.math_chat_sessions > 0 ||
                       stats.audio_recaps_created > 0 ||
                       stats.doubt_chains_used > 0;
      setIsNewUser(!hasStats);
    }
  }, [stats, statsLoading]);

  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  }, [user]);

  const getWelcomeMessage = useCallback(() => {
    const name = getUserDisplayName();
    return isNewUser ? `${t('dashboard.welcomeNew', { name })} 🎉` : `${t('dashboard.welcomeBack', { name })} 👋`;
  }, [getUserDisplayName, isNewUser, t]);

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}${t('dashboard.min')}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}${t('dashboard.h')} ${remainingMinutes}${t('dashboard.m')}` : `${hours}${t('dashboard.h')}`;
  };

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
        <div className="text-xl font-black tracking-wider">{t('common.loading')} TUTORLY...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const featureCards = [
    { 
      icon: Sparkles, 
      title: t('navigation.aiNotes'), 
      desc: t('dashboard.aiNotesDesc'), 
      route: "/ai-notes", 
      count: stats?.notes_created || 0 
    },
    { 
      icon: MessageCircle, 
      title: t('navigation.mathChat'), 
      desc: t('dashboard.mathChatDesc'), 
      route: "/math-chat", 
      count: stats?.math_chat_sessions || 0 
    },
    { 
      icon: Users, 
      title: t('navigation.audioRecap'), 
      desc: t('dashboard.audioRecapDesc'), 
      route: "/audio-notes", 
      count: stats?.audio_recaps_created || 0 
    },
    { 
      icon: HelpCircle, 
      title: t('navigation.doubtChain'), 
      desc: t('dashboard.doubtChainDesc'), 
      route: "/doubt-chain", 
      count: stats?.doubt_chains_used || 0 
    },
    { 
      icon: Zap, 
      title: t('navigation.flashcards'), 
      desc: t('dashboard.flashcardsDesc'), 
      route: "/flashcards", 
      count: stats?.flashcards_created || 0 
    },
    { 
      icon: BookOpen, 
      title: t('navigation.quiz'), 
      desc: t('dashboard.quizDesc'), 
      route: "/quiz", 
      count: stats?.quizzes_taken || 0 
    }
  ];

  const quickActions = [
    { title: t('dashboard.summarize'), desc: t('dashboard.summarizeDesc'), icon: StickyNote, route: "/summaries" },
    { title: t('dashboard.multiDoc'), desc: t('dashboard.multiDocDesc'), icon: Files, route: "/multi-doc-session" },
    { title: t('dashboard.aiAssistant'), desc: t('dashboard.aiAssistantDesc'), icon: Brain, route: "/ai-assistant" },
    { title: t('dashboard.contentProcessor'), desc: t('dashboard.contentProcessorDesc'), icon: Files, route: "/aicontentprocessor" },
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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {getWelcomeMessage()}
              </h1>
              <p className={`text-lg ${mutedTextClasses}`}>
              {t('dashboard.subtitle')}
            </p>
            </div>
          </motion.div>
          
          {isNewUser ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`p-8 mb-12 border-4 border-black ${panelClasses}`}
              style={{ boxShadow: '8px 8px 0px #00e6c4' }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black mb-2">{t('dashboard.uploadFirstMaterial')}</h2>
                  <p className={`text-lg ${mutedTextClasses}`}>
                    {t('dashboard.uploadFirstMaterialDesc')}
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
                    {t('dashboard.uploadMaterials')}
                  </button>
                  <button
                    onClick={() => handleNavigation('/generate')}
                    className={`px-6 py-4 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 ${panelClasses}`}
                    style={{ boxShadow: '4px 4px 0px #000' }}
                  >
                    {t('dashboard.generateFromTopic')}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { 
                    title: t('dashboard.studyTime'), 
                    value: formatStudyTime(stats?.total_study_time || 0), 
                    icon: Clock, 
                    trend: `${stats?.sessions_this_month || 0} ${t('dashboard.sessions')}`, 
                    accent: '#00e6c4' 
                  },
                  { 
                    title: t('dashboard.milestones'), 
                    value: stats?.learning_milestones || 0, 
                    icon: Award, 
                    trend: t('dashboard.totalAchievements'), 
                    accent: '#ff5a8f' 
                  },
                  { 
                    title: t('dashboard.quizScore'), 
                    value: `${stats?.average_quiz_score || 0}%`, 
                    icon: CheckCircle, 
                    trend: `${stats?.quizzes_taken || 0} ${t('dashboard.completed')}`, 
                    accent: '#00e6c4' 
                  },
                  { 
                    title: t('dashboard.aiNotes'), 
                    value: stats?.notes_created || 0, 
                    icon: Sparkles, 
                    trend: t('dashboard.notesGenerated'), 
                    accent: '#ff5a8f' 
                  }
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

              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tight">{t('dashboard.coreTools')}</h2>
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
                        {t('dashboard.explore')} <ArrowRight className="w-4 h-4 ml-2" />
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
            </>
          )}

        </div>
      </main>

      <Footer />
      <BottomNav theme={theme} />
    </div>
  );
};

export default Dashboard;
