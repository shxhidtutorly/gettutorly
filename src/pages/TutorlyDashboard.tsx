
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
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
    totalStudyTime: 0,
    completedMaterials: 0,
    totalMaterials: 0,
    averageScore: 0,
    streak: 0,
    notesCreated: 0,
    quizzesCompleted: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load stats from localStorage or API
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
      color: "from-blue-500 to-purple-600",
      path: "/ai-notes-generator"
    },
    {
      title: "Smart Flashcards",
      description: "Create and review AI-powered flashcards",
      icon: Brain,
      color: "from-green-500 to-blue-500",
      path: "/flashcards"
    },
    {
      title: "Interactive Quiz",
      description: "Test your knowledge with adaptive quizzes",
      icon: Target,
      color: "from-orange-500 to-red-500",
      path: "/quiz"
    },
    {
      title: "Study Progress",
      description: "Track your learning journey",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      path: "/progress"
    },
    {
      title: "AI Assistant",
      description: "Get instant help with any subject",
      icon: MessageCircle,
      color: "from-cyan-500 to-blue-500",
      path: "/ai-assistant"
    },
    {
      title: "Study Plans",
      description: "Personalized learning schedules",
      icon: Calendar,
      color: "from-indigo-500 to-purple-500",
      path: "/study-plans"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <Navbar />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.aside
              initial={isMobile ? { x: -300 } : { x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className={`${
                isMobile ? "fixed top-0 left-0 h-full z-50 w-80" : "relative w-80"
              } bg-[#121212] border-r border-gray-800 flex flex-col`}
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Tutorly Dashboard
                      </h2>
                    </div>
                  </div>
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="flex-1 p-4 overflow-y-auto">
                <nav className="space-y-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.title}
                      onClick={() => {
                        navigate(action.path);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-gray-800/50 group"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-gray-500 truncate">{action.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </nav>
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
                      className="text-gray-400 hover:text-white"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  )}
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
                      Welcome to Tutorly
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl">
                      Your AI-powered learning companion. Track progress, generate notes, and master any subject.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate("/pricing")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            >
              <Card className="bg-[#121212] border-gray-800 hover:border-purple-500/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs lg:text-sm font-medium">Study Time</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">
                        {formatStudyTime(studyStats.totalStudyTime || 0)}
                      </p>
                    </div>
                    <Clock className="w-6 lg:w-8 h-6 lg:h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-gray-800 hover:border-blue-500/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs lg:text-sm font-medium">Materials</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">
                        {studyStats.completedMaterials || 0}/{studyStats.totalMaterials || 0}
                      </p>
                    </div>
                    <BookOpen className="w-6 lg:w-8 h-6 lg:h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-gray-800 hover:border-green-500/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs lg:text-sm font-medium">Quizzes</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">
                        {studyStats.quizzesCompleted || 0}
                      </p>
                    </div>
                    <Target className="w-6 lg:w-8 h-6 lg:h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-gray-800 hover:border-orange-500/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs lg:text-sm font-medium">Streak</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">
                        {studyStats.streak || 0} days
                      </p>
                    </div>
                    <Zap className="w-6 lg:w-8 h-6 lg:h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-[#121212] border-gray-800 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-lg lg:text-xl">
                    <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-purple-400" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm lg:text-base">Overall Completion</span>
                    <span className="text-white font-semibold text-sm lg:text-base">{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2 lg:h-3" />
                  <div className="flex justify-between text-xs lg:text-sm text-gray-400">
                    <span>Keep going! You're making great progress.</span>
                    <span>{studyStats.completedMaterials || 0} completed</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 lg:w-6 h-5 lg:h-6 text-purple-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="bg-[#121212] border-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group h-full rounded-2xl shadow-lg hover:shadow-xl"
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent className="p-4 lg:p-6 h-full flex flex-col">
                        <div className={`w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                        </div>
                        <h3 className="text-base lg:text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-400 text-xs lg:text-sm flex-grow">
                          {action.description}
                        </p>
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
