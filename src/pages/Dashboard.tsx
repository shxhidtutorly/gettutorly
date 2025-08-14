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
  Files,
  CheckCircle,
  ArrowRight,
  Youtube
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import ProgressCard from "@/components/dashboard/ProgressCard";

// --- Neon Brutalist UI Configuration ---
// No changes here
const neonColors = {
  cyan: { base: 'cyan-400', border: 'border-cyan-400', shadow: 'shadow-[4px_4px_0px_#00f7ff]', hoverShadow: 'hover:shadow-[6px_6px_0px_#00f7ff]', text: 'text-cyan-400' },
  green: { base: 'green-400', border: 'border-green-400', shadow: 'shadow-[4px_4px_0px_#22c55e]', hoverShadow: 'hover:shadow-[6px_6px_0px_#22c55e]', text: 'text-green-400' },
  pink: { base: 'pink-500', border: 'border-pink-500', shadow: 'shadow-[4px_4px_0px_#ec4899]', hoverShadow: 'hover:shadow-[6px_6px_0px_#ec4899]', text: 'text-pink-500' },
  yellow: { base: 'yellow-400', border: 'border-yellow-400', shadow: 'shadow-[4px_4px_0px_#facc15]', hoverShadow: 'hover:shadow-[6px_6px_0px_#facc15]', text: 'text-yellow-400' },
  purple: { base: 'purple-500', border: 'border-purple-500', shadow: 'shadow-[4px_4px_0px_#a855f7]', hoverShadow: 'hover:shadow-[6px_6px_0px_#a855f7]', text: 'text-purple-500' },
  blue: { base: 'blue-500', border: 'border-blue-500', shadow: 'shadow-[4px_4px_0px_#3b82f6]', hoverShadow: 'hover:shadow-[6px_6px_0px_#3b82f6]', text: 'text-blue-500' }
};
const featureColors = [ neonColors.cyan, neonColors.green, neonColors.pink, neonColors.yellow, neonColors.purple, neonColors.blue ];
const cardAnimation = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 30 } };

// No changes here
const BrutalLoader = () => { /* ... existing loader code ... */ };

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading, error: statsError } = useUserStats(user?.uid || null);
  const [isNewUser, setIsNewUser] = useState(false);

  // --- FIX 1: This effect for redirecting is fine, but keeping it for context.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  // --- FIX 2 (CRITICAL): Stabilize dependencies to prevent the infinite loop ---
  // We extract the specific values we need from the user object.
  const creationTime = user?.metadata?.creationTime;
  const lastSignInTime = user?.metadata?.lastSignInTime;

  useEffect(() => {
    if (creationTime && lastSignInTime) {
      const creationTimestamp = new Date(creationTime).getTime();
      const lastSignInTimestamp = new Date(lastSignInTime).getTime();
      setIsNewUser(Math.abs(lastSignInTimestamp - creationTimestamp) < 5 * 60 * 1000);
    }
  }, [creationTime, lastSignInTime]); // Now the effect only runs if these specific strings change.

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // --- FIX 3: Stabilize callback dependencies as a best practice ---
  const displayName = user?.displayName;
  const email = user?.email;

  const getUserDisplayName = useCallback(() => {
    if (displayName) return displayName;
    if (email) return email.split('@')[0];
    return "User";
  }, [displayName, email]); // Depends on stable primitive values.

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

  const featureCards = [
    { icon: Sparkles, title: "AI NOTES", desc: "Smart note generation from any content", route: "/ai-notes", color: featureColors[0] },
    { icon: MessageCircle, title: "MATH CHAT", desc: "Solve problems with step-by-step help", route: "/math-chat", color: featureColors[1] },
    { icon: Users, title: "AUDIO RECAP", desc: "Convert lectures to organized notes", route: "/audio-notes", color: featureColors[2] },
    { icon: HelpCircle, title: "DOUBT CHAIN", desc: "Break down complex concepts easily", route: "/doubt-chain", color: featureColors[3] },
    { icon: Zap, title: "SMART FLASHCARDS", desc: "Adaptive cards that evolve with you", route: "/flashcards", color: featureColors[4] },
    { icon: BookOpen, title: "INSTANT QUIZZES", desc: "Auto-generate tests from materials", route: "/quiz", color: featureColors[5] }
  ];
  const quickActions = [
    { title: "Summarize", desc: "Quickly summarize text", icon: StickyNote, route: "/summaries", color: neonColors.pink },
    { title: "Multi-Doc Session", desc: "Upload & study multiple documents", icon: Files, route: "/multi-doc-session", color: neonColors.purple },
    { title: "AI Assistant", desc: "Get personalized help", icon: Brain, route: "/ai-assistant", color: neonColors.cyan },
    { title: "YouTube Summarizer", desc: "Summarize YouTube videos", icon: Youtube, route: "/youtube-summarizer", color: neonColors.yellow },
  ];

  if (authLoading || statsLoading) {
    return <BrutalLoader />;
  }
  
  // Good practice to handle potential errors from your hook
  if (statsError) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono">
              <h1 className="text-2xl text-red-500">ERROR</h1>
              <p className="text-gray-400">Could not load dashboard stats.</p>
              <p className="text-gray-600 text-sm mt-2">{statsError}</p>
          </div>
      );
  }

  if (!user) {
    return null; // Should be redirected by the effect, but this is a safe fallback.
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-mono">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">{getWelcomeMessage()}</h1>
            <p className="text-gray-400 text-lg">Let's supercharge your learning today.</p>
          </motion.div>

          {/* --- Stats Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <ProgressCard title="Study Time" value={formatStudyTime(stats?.total_study_time || 0)} icon={<Clock className={`h-7 w-7 ${neonColors.blue.text}`} />} trend={`${stats?.sessions_this_month || 0} sessions this month`} className={`bg-gray-900 border-2 rounded-none ${neonColors.blue.border} ${neonColors.blue.shadow}`} />
            <ProgressCard title="Milestones" value={stats?.learning_milestones || 0} icon={<Award className={`h-7 w-7 ${neonColors.green.text}`} />} trend="Total achievements" className={`bg-gray-900 border-2 rounded-none ${neonColors.green.border} ${neonColors.green.shadow}`} />
            <ProgressCard title="Quizzes" value={stats?.quizzes_taken || 0} icon={<CheckCircle className={`h-7 w-7 ${neonColors.yellow.text}`} />} trend={`${stats?.average_quiz_score || 0}% avg score`} className={`bg-gray-900 border-2 rounded-none ${neonColors.yellow.border} ${neonColors.yellow.shadow}`} />
            <ProgressCard title="AI Notes" value={stats?.notes_created || 0} icon={<Sparkles className={`h-7 w-7 ${neonColors.purple.text}`} />} trend="Notes generated" className={`bg-gray-900 border-2 rounded-none ${neonColors.purple.border} ${neonColors.purple.shadow}`} />
          </div>

          {/* --- Main Feature Cards --- */}
          <div className="mb-12">
            <h2 className="text-3xl font-black mb-6 text-white">Core Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  variants={cardAnimation}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -5 }}
                  className={`group relative flex flex-col justify-between p-6 cursor-pointer bg-gray-900 border-2 rounded-none transition-all duration-200 ${feature.color.border} ${feature.color.shadow} ${feature.color.hoverShadow}`}
                  onClick={() => handleNavigation(feature.route)}
                  style={{ minHeight: "240px" }}
                >
                  <div>
                    <feature.icon className={`w-10 h-10 mb-4 ${feature.color.text}`} />
                    <h3 className="font-black text-2xl mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400 font-bold text-base">{feature.desc}</p>
                  </div>
                  <div className="flex items-center justify-end font-bold text-sm text-gray-400 group-hover:text-white transition-colors">
                    <span>EXPLORE</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* --- Quick Actions --- */}
          <div>
            <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-white">
              <Zap className="text-yellow-400 h-7 w-7" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(action.route)}
                  className={`group p-5 cursor-pointer bg-gray-900 border-2 rounded-none flex items-center gap-4 transition-all duration-200 ${action.color.border} ${action.color.shadow} ${action.color.hoverShadow}`}
                >
                  <action.icon className={`w-8 h-8 flex-shrink-0 ${action.color.text}`} />
                  <div>
                    <h3 className="font-black text-lg text-white">{action.title}</h3>
                    <p className="font-bold text-sm text-gray-400">{action.desc}</p>
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
