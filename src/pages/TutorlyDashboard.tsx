
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  FileText,
  Brain,
  Zap,
  HelpCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Calculator,
  Sparkles,
  StickyNote,
  Crown,
  MessageCircle,
  Headphones,
  BarChart3,
  TestTube,
  BookMarked,
  Home,
  Settings,
  Menu,
  X,
  GraduationCap,
  PlusCircle,
  Share,
  User,
  Target,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimeChat from "@/components/dashboard/AnimeChat";

const TutorlyDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { stats } = useStudyTracking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Student';
  };

  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Home", route: "/dashboard" },
    { id: "ai-assistant", icon: MessageCircle, label: "Chat", route: "/ai-assistant" },
    { id: "calendar", icon: Calendar, label: "Calendar", route: "/study-plans" },
    { id: "insights", icon: BarChart3, label: "Insights", route: "/progress" },
    { id: "flashcards", icon: Zap, label: "Flashcards", route: "/flashcards" },
    { id: "quiz", icon: TestTube, label: "Tests & Quiz", route: "/quiz" },
    { id: "math-chat", icon: Calculator, label: "Math Solver", route: "/math-chat" },
    { id: "notes", icon: StickyNote, label: "AI Notes", route: "/ai-notes-generator" },
    { id: "audio", icon: Headphones, label: "Audio Recap", route: "/audio-notes" },
    { id: "library", icon: BookMarked, label: "Library", route: "/library" },
    { id: "summaries", icon: FileText, label: "Summaries", route: "/summaries" },
    { id: "doubt-chain", icon: Brain, label: "Doubt Chain", route: "/doubt-chain" },
  ];

  // Quick stats data
  const quickStats = [
    {
      title: "Study Hours",
      value: `${Math.round((stats.total_study_time || 0) / 3600)}h`,
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Materials",
      value: stats.materials_created || 0,
      icon: BookOpen,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      title: "Quizzes",
      value: stats.quizzes_taken || 0,
      icon: TestTube,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      title: "Score",
      value: "85%",
      icon: Target,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    }
  ];

  // Study tools for quick access
  const studyTools = [
    { title: "AI Notes", icon: Sparkles, route: "/ai-notes-generator", color: "text-purple-400" },
    { title: "Math Solver", icon: Calculator, route: "/math-chat", color: "text-blue-400" },
    { title: "Flashcards", icon: Zap, route: "/flashcards", color: "text-yellow-400" },
    { title: "Quiz", icon: TestTube, route: "/quiz", color: "text-green-400" },
    { title: "Summaries", icon: FileText, route: "/summaries", color: "text-pink-400" },
    { title: "Audio Notes", icon: Headphones, route: "/audio-notes", color: "text-cyan-400" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
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
          <p className="text-white text-xl font-medium">Loading Tutorly...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex w-full overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${
              isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"
            } w-64 bg-[#121212] border-r border-slate-700 flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Tutorly
                  </h1>
                </div>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* User Profile */}
              <div className="mt-3 p-2 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    navigate(item.route);
                    setActiveSection(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Upgrade Section */}
            <div className="p-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-gray-300 mb-2">Unlock unlimited features</p>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs"
                  size="sm"
                >
                  Upgrade Now
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-[#121212]/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">Welcome back, {getUserDisplayName()}!</h2>
              <p className="text-sm text-gray-400">Ready to continue learning?</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10 hidden sm:flex">
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" size="sm">
              <PlusCircle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">New Session</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-4 space-y-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-[#121212] border-slate-700 hover:border-slate-600 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{stat.title}</p>
                          <p className="text-lg font-bold text-white">{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Study Tools Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Quick Access
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {studyTools.map((tool, index) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className="bg-[#121212] border-slate-700 hover:border-slate-600 cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => navigate(tool.route)}
                    >
                      <CardContent className="p-4 text-center">
                        <tool.icon className={`w-6 h-6 ${tool.color} mx-auto mb-2`} />
                        <h4 className="text-sm font-medium text-white">{tool.title}</h4>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#121212] rounded-2xl border border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                <Badge variant="outline" className="border-green-500/50 text-green-400">
                  Online
                </Badge>
              </div>
              <AnimeChat />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorlyDashboard;
