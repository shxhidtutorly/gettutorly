
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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex overflow-hidden max-w-full">
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
            } w-70 bg-[#121212]/90 backdrop-blur-sm border-r border-slate-700 flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="p-4 sm:p-6 border-b border-slate-700">
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
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
            <div className="p-4">
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
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-slate-700 bg-[#121212]/50 backdrop-blur-sm">
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
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Welcome back, {getUserDisplayName()}!</h2>
              <p className="text-sm text-gray-400">Ready to continue learning?</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10 hidden sm:flex">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Session</span>
            </Button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-full">
            <AnimeChat />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorlyDashboard;
