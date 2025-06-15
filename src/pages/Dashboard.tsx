import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { 
  BookOpen, 
  Brain, 
  Target, 
  Clock, 
  TrendingUp, 
  Zap,
  FileText,
  Users,
  Award,
  Calendar,
  MessageCircle,
  Sparkles,
  Menu,
  X,
  Star,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import CountUp from "react-countup";

interface StudyStats {
  totalStudyTime?: number;
  completedMaterials?: number;
  totalMaterials?: number;
  averageScore?: number;
  streak?: number;
  notesCreated?: number;
  quizzesCompleted?: number;
}

const TutorlyDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalStudyTime: 124,
    completedMaterials: 12,
    totalMaterials: 18,
    averageScore: 87,
    streak: 7,
    notesCreated: 23,
    quizzesCompleted: 15
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedStats = localStorage.getItem('tutorly-study-stats');
    if (savedStats) {
      setStudyStats(JSON.parse(savedStats));
    }
  }, []);

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressPercentage = () => {
    if (!studyStats.totalMaterials || studyStats.totalMaterials === 0) return 0;
    return Math.round((studyStats.completedMaterials || 0) / studyStats.totalMaterials * 100);
  };

  const quickActions = [
    {
      title: "AI Notes Generator",
      description: "Transform any content into smart study notes",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      bgGlow: "group-hover:shadow-blue-500/25",
      path: "/ai-notes-generator"
    },
    {
      title: "Smart Flashcards",
      description: "Create and review AI-powered flashcards",
      icon: Brain,
      color: "from-emerald-500 to-teal-600", 
      bgGlow: "group-hover:shadow-emerald-500/25",
      path: "/flashcards"
    },
    {
      title: "Interactive Quiz",
      description: "Test your knowledge with adaptive quizzes",
      icon: Target,
      color: "from-orange-500 to-red-500",
      bgGlow: "group-hover:shadow-orange-500/25",
      path: "/quiz"
    },
    {
      title: "Study Progress",
      description: "Track your learning journey",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgGlow: "group-hover:shadow-purple-500/25",
      path: "/progress"
    },
    {
      title: "AI Assistant",
      description: "Get instant help with any subject",
      icon: MessageCircle,
      color: "from-cyan-500 to-blue-500",
      bgGlow: "group-hover:shadow-cyan-500/25",
      path: "/ai-assistant"
    },
    {
      title: "Study Plans",
      description: "Personalized learning schedules",
      icon: Calendar,
      color: "from-indigo-500 to-purple-500",
      bgGlow: "group-hover:shadow-indigo-500/25",
      path: "/study-plans"
    }
  ];

  const statCards = [
    {
      title: "Study Time",
      value: formatStudyTime(studyStats.totalStudyTime || 0),
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Materials", 
      value: `${studyStats.completedMaterials || 0}/${studyStats.totalMaterials || 0}`,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Quizzes",
      value: studyStats.quizzesCompleted || 0,
      icon: Target,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20", 
      borderColor: "border-emerald-200 dark:border-emerald-800"
    },
    {
      title: "Streak",
      value: `${studyStats.streak || 0} days`,
      icon: Zap,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.aside
              initial={isMobile ? { x: -300 } : { x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${
                isMobile ? "fixed top-0 left-0 h-full z-50 w-80" : "relative w-80"
              } bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col shadow-xl`}
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Dashboard
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back!</p>
                    </div>
                  </motion.div>
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-3">
                    Quick Actions
                  </p>
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.title}
                      onClick={() => {
                        navigate(action.path);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 group"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-slate-400 truncate">{action.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(true)}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  )}
                  <div>
                    <motion.h1 
                      className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome to Tutorly
                    </motion.h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                      Your AI-powered learning companion. Track progress, generate notes, and master any subject.
                    </p>
                  </div>
                </div>
                <motion.div 
                  className="flex gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <Button
                    onClick={() => navigate("/pricing")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Upgrade to Pro
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            >
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300 rounded-2xl backdrop-blur-sm`}>
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-slate-600 dark:text-slate-400 text-xs lg:text-sm font-medium uppercase tracking-wide">
                            {stat.title}
                          </p>
                          <motion.p 
                            className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                          >
                            {typeof stat.value === 'number' ? (
                              <CountUp end={stat.value} duration={2} />
                            ) : (
                              stat.value
                            )}
                          </motion.p>
                        </div>
                        <motion.div 
                          className={`w-12 lg:w-14 h-12 lg:h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                          whileHover={{ rotate: 5 }}
                        >
                          <stat.icon className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-lg lg:text-xl">
                    <motion.div 
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <TrendingUp className="w-5 h-5 text-white" />
                    </motion.div>
                    Learning Progress
                    {getProgressPercentage() > 50 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <Award className="w-5 h-5 text-yellow-500" />
                      </motion.div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 text-sm lg:text-base font-medium">Overall Completion</span>
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className="text-slate-900 dark:text-white font-bold text-sm lg:text-base"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <CountUp end={getProgressPercentage()} duration={2} />%
                      </motion.span>
                      {getProgressPercentage() > 75 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={getProgressPercentage()} 
                      className="h-3 lg:h-4 bg-slate-200 dark:bg-slate-700" 
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      style={{ height: '100%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      Keep going! You're making great progress.
                    </span>
                    <span>{studyStats.completedMaterials || 0} completed</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center"
                  whileHover={{ rotate: 5 }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card 
                      className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer h-full rounded-2xl shadow-lg hover:shadow-xl ${action.bgGlow}`}
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent className="p-4 lg:p-6 h-full flex flex-col">
                        <motion.div 
                          className={`w-12 lg:w-14 h-12 lg:h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                          whileHover={{ rotate: 5 }}
                        >
                          <action.icon className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                        </motion.div>
                        <h3 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs lg:text-sm flex-grow leading-relaxed">
                          {action.description}
                        </p>
                        <motion.div 
                          className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                        >
                          <span>Get started</span>
                          <motion.span
                            className="ml-1"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            →
                          </motion.span>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default TutorlyDashboard;
