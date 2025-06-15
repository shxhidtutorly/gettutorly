import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
  Lightbulb,
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  PlusCircle,
  ChevronRight,
  Bookmark,
  Share,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const TutorlyDashboard = () => {
  const { currentUser, loading, signOut } = useAuth();
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
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Student';
  };

  const subscriptionStatus = currentUser?.profile?.subscription_status;
  const subscriptionPlan = currentUser?.profile?.subscription_plan;
  const hasActiveSubscription = subscriptionStatus === 'active';

  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Home", route: "/dashboard" },
    { id: "ai-assistant", icon: MessageCircle, label: "Chat", route: "/ai-assistant" },
    { id: "calendar", icon: Calendar, label: "Calendar", route: "/study-plans" },
    { id: "insights", icon: BarChart3, label: "Insights", route: "/progress" },
    { id: "flashcards", icon: Zap, label: "Flashcards", route: "/flashcards" },
    { id: "quiz", icon: TestTube, label: "Tests & Quiz", route: "/quiz" },
    { id: "math-chat", icon: Calculator, label: "Math Solver", route: "/math-chat" },
    { id: "notes", icon: StickyNote, label: "AI Notes", route: "/ai-notes" },
    { id: "audio", icon: Headphones, label: "Audio Recap", route: "/audio-notes" },
    { id: "library", icon: BookMarked, label: "Library", route: "/library" },
    { id: "summaries", icon: FileText, label: "Summaries", route: "/summaries" },
    { id: "doubt-chain", icon: Brain, label: "Doubt Chain", route: "/doubt-chain" },
  ];

  const quickActions = [
    { title: "New Chat Session", icon: MessageCircle, route: "/ai-assistant", color: "from-blue-500 to-cyan-500" },
    { title: "Upload Document", icon: Upload, route: "/ai-notes", color: "from-green-500 to-emerald-500" },
    { title: "Create Flashcards", icon: Zap, route: "/flashcards", color: "from-purple-500 to-violet-500" },
    { title: "Take Quiz", icon: TestTube, route: "/quiz", color: "from-pink-500 to-rose-500" },
  ];

  const recentMaterials = [
    { title: "Physics Chapter 1", type: "Notes", time: "2 hours ago", progress: 85 },
    { title: "Math Quiz Results", type: "Quiz", time: "1 day ago", progress: 92 },
    { title: "Chemistry Lab Report", type: "Document", time: "3 days ago", progress: 60 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
    <div className="min-h-screen bg-slate-900 text-white flex">
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
            } w-70 bg-slate-800/90 backdrop-blur-sm border-r border-slate-700`}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Tutorly
                    </h1>
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
              
              {/* User Profile */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
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
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-purple-400 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Upgrade Section */}
            {!hasActiveSubscription && (
              <div className="p-4 mt-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">Upgrade to Pro</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3">Unlock unlimited features</p>
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    size="sm"
                  >
                    Upgrade Now
                  </Button>
                </motion.div>
              </div>
            )}
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
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
              <h2 className="text-lg font-semibold text-white">Welcome back, {getUserDisplayName()}!</h2>
              <p className="text-sm text-gray-400">Ready to continue learning?</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Tutorly Mascot Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center relative"
            >
              <Brain className="w-16 h-16 text-white" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-yellow-900" />
              </motion.div>
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Hi, I'm Tutor.ly
            </h3>
            <p className="text-gray-400">Ask me anything about learning, or try one of these examples:</p>
          </motion.div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {["Explain Concepts", "Summarize", "Find Citations", "Study Techniques"].map((action, index) => (
              <motion.button
                key={action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/ai-assistant')}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-all"
              >
                <span className="text-sm font-medium text-gray-300">{action}</span>
              </motion.button>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate(action.route)}
                className="cursor-pointer"
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Materials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Your Recent Materials</h3>
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentMaterials.map((material, index) => (
                <motion.div
                  key={material.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{material.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Badge variant="secondary" className="text-xs">{material.type}</Badge>
                          <span>•</span>
                          <span>{material.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Progress</div>
                        <div className="text-lg font-semibold text-white">{material.progress}%</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Study Hours", value: `${stats.totalStudyHours.toFixed(1)}h`, icon: Clock, color: "from-blue-500 to-cyan-500" },
              { label: "Sessions", value: stats.sessionCount, icon: Target, color: "from-green-500 to-emerald-500" },
              { label: "Streak", value: `${stats.streakDays} days`, icon: Flame, color: "from-orange-500 to-red-500" },
              { label: "Materials", value: stats.notesCreated + stats.summariesGenerated, icon: BookOpen, color: "from-purple-500 to-violet-500" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TutorlyDashboard;
