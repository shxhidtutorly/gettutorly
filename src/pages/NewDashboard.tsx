
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
  Brain,
  Zap,
  HelpCircle,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle,
  Calculator,
  Sparkles,
  StickyNote,
  Crown,
  MessageCircle,
  Upload,
  Headphones,
  BarChart3,
  TestTube,
  BookMarked,
  ArrowRight,
  Star,
  Rocket,
  Heart,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion, AnimatePresence } from "framer-motion";

const TutorlyDashboard = () => {
  const { currentUser, loading } = useAuth();
  const { stats } = useStudyTracking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getUserDisplayName = () => {
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Student';
  };

  const subscriptionStatus = currentUser?.profile?.subscription_status;
  const subscriptionPlan = currentUser?.profile?.subscription_plan;
  const hasActiveSubscription = subscriptionStatus === 'active';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-medium">Loading your learning hub...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
        >
          <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-white">Welcome to Tutorly</h2>
          <p className="text-white/80 text-lg mb-6">Your AI-powered learning companion awaits</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    );
  }

  const quickStats = [
    {
      label: "Study Time",
      value: `${stats.totalStudyHours.toFixed(1)}h`,
      icon: Clock,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      label: "Sessions",
      value: stats.sessionCount,
      icon: Target,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      label: "Streak",
      value: `${stats.streakDays} days`,
      icon: Flame,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/20 to-red-500/20"
    },
    {
      label: "Materials",
      value: stats.notesCreated + stats.summariesGenerated,
      icon: BookOpen,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-500/20 to-violet-500/20"
    }
  ];

  const learningTools = [
    {
      title: "AI Chat Assistant",
      description: "Get instant help with any subject",
      icon: MessageCircle,
      route: "/ai-assistant",
      gradient: "from-purple-500 to-indigo-500",
      category: "AI Tools"
    },
    {
      title: "Math Solver",
      description: "Solve complex math problems step-by-step",
      icon: Calculator,
      route: "/math-chat",
      gradient: "from-blue-500 to-cyan-500",
      category: "AI Tools"
    },
    {
      title: "Smart Notes",
      description: "Generate AI-powered study notes",
      icon: Brain,
      route: "/ai-notes",
      gradient: "from-green-500 to-emerald-500",
      category: "Content"
    },
    {
      title: "Flashcards",
      description: "Create and review interactive flashcards",
      icon: Zap,
      route: "/flashcards",
      gradient: "from-yellow-500 to-orange-500",
      category: "Study Tools"
    },
    {
      title: "Quiz Generator",
      description: "Test your knowledge with AI quizzes",
      icon: TestTube,
      route: "/quiz",
      gradient: "from-pink-500 to-rose-500",
      category: "Assessment"
    },
    {
      title: "Summarizer",
      description: "Instantly summarize any content",
      icon: StickyNote,
      route: "/summaries",
      gradient: "from-indigo-500 to-purple-500",
      category: "Content"
    },
    {
      title: "Audio Notes",
      description: "Convert speech to smart notes",
      icon: Headphones,
      route: "/audio-notes",
      gradient: "from-teal-500 to-cyan-500",
      category: "Content"
    },
    {
      title: "Study Library",
      description: "Organize your learning materials",
      icon: BookMarked,
      route: "/library",
      gradient: "from-violet-500 to-purple-500",
      category: "Organization"
    },
    {
      title: "Progress Tracker",
      description: "Monitor your learning journey",
      icon: BarChart3,
      route: "/progress",
      gradient: "from-emerald-500 to-green-500",
      category: "Analytics"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-center max-w-md mx-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, repeat: 3 }}
                >
                  <Heart className="w-16 h-16 text-white mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {getUserDisplayName()}!</h2>
                <p className="text-white/90">Ready to continue your learning journey?</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.h1 
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hello, {getUserDisplayName()}! 👋
              </motion.h1>
              <motion.p
                className="text-gray-300 text-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Your personalized learning hub is ready
              </motion.p>
            </div>
            
            {/* Subscription Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              {hasActiveSubscription ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{subscriptionPlan} Plan</span>
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full px-6 py-3 font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm border border-white/10 rounded-2xl p-4 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Learning Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 mb-6"
          >
            <Lightbulb className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold">Learning Tools</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningTools.map((tool, index) => (
              <motion.div
                key={tool.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -8 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setActiveCard(tool.title)}
                onHoverEnd={() => setActiveCard(null)}
                className="group cursor-pointer"
                onClick={() => navigate(tool.route)}
              >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl h-full overflow-hidden transition-all duration-300 hover:border-purple-500/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} bg-opacity-20`}>
                        <tool.icon className={`w-6 h-6 text-white`} />
                      </div>
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {tool.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center text-purple-400 text-sm font-medium">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 cursor-pointer"
            onClick={() => navigate('/study-plans')}
          >
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Study Plans</h3>
                <p className="text-gray-300">Organize your learning schedule</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
              Create New Plan
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 cursor-pointer"
            onClick={() => navigate('/doubt-chain')}
          >
            <div className="flex items-center gap-4 mb-4">
              <Brain className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Doubt Chain</h3>
                <p className="text-gray-300">Break down complex concepts</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-green-500/50 text-green-300 hover:bg-green-500/20">
              Ask Questions
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default TutorlyDashboard;
