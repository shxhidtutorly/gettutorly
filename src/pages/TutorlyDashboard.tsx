
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalStudyTime: 0,
    completedMaterials: 0,
    totalMaterials: 0,
    averageScore: 0,
    streak: 0,
    notesCreated: 0,
    quizzesCompleted: 0
  });

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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#16213E] text-white overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
                Welcome to Tutorly
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Your AI-powered learning companion. Track progress, generate notes, and master any subject with intelligent study tools.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/pricing")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Study Time</p>
                  <p className="text-2xl font-bold text-white">
                    {formatStudyTime(studyStats.totalStudyTime || 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Materials</p>
                  <p className="text-2xl font-bold text-white">
                    {studyStats.completedMaterials || 0}/{studyStats.totalMaterials || 0}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-green-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Quizzes</p>
                  <p className="text-2xl font-bold text-white">
                    {studyStats.quizzesCompleted || 0}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-orange-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Streak</p>
                  <p className="text-2xl font-bold text-white">
                    {studyStats.streak || 0} days
                  </p>
                </div>
                <Zap className="w-8 h-8 text-orange-400" />
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
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Overall Completion</span>
                <span className="text-white font-semibold">{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Keep going! You're making great progress.</span>
                <span>{studyStats.completedMaterials || 0} completed</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group h-full"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm flex-grow">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default TutorlyDashboard;
