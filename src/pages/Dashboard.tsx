
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
  Award,
  Brain,
  Zap,
  BookMarked,
  HelpCircle,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { stats } = useStudyTracking();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user display name safely
  const getUserDisplayName = () => {
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  if (!currentUser) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-xl md:text-3xl font-bold">
              Welcome back, {getUserDisplayName()}! 👋
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Here's your learning progress overview</p>
          </motion.div>

          {/* Study Streak */}
          <motion.div
            className="flex items-center gap-2 mb-6 md:mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-400 animate-pulse" />
            <span className="font-semibold text-orange-300 text-sm md:text-base">
              {stats.streakDays}-day streak!
            </span>
            <Badge className="ml-2 bg-orange-600/30 border-orange-400 text-orange-100 text-xs">
              Keep it up!
            </Badge>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {/* Study Hours */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Study Hours</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.totalStudyHours.toFixed(1)}h</p>
                    </div>
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sessions */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Sessions</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.sessionCount}</p>
                    </div>
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quizzes */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Quizzes</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.quizzesCompleted}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Summaries */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Created</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.summariesGenerated + stats.notesCreated}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Summary */}
          <div className="mb-6 md:mb-8">
            <Card className="dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Today's Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-blue-500">{stats.summariesGenerated}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Summaries</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-green-500">{stats.notesCreated}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">AI Notes</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-yellow-500">{stats.quizzesCompleted}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Tools Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Study Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
             {[
  {
    title: "AI Notes",
    desc: "Generate smart notes from files",
    icon: <Brain className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
    route: "/ai-notes"
  },
  {
    title: "Flashcards",
    desc: "Create and review flashcards",
    icon: <Zap className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
    route: "/flashcards"
  },
  {
    title: "Quizzes",
    desc: "Test your knowledge",
    icon: <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
    route: "/quiz"
  },
  {
    title: "Summaries",
    desc: "AI-generated summaries",
    icon: <BookMarked className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
    route: "/summaries"
  }
].map((tool, idx) => (
  <motion.div
    key={tool.title}
    whileHover={{ scale: 1.06, boxShadow: '0 2px 28px #3b82f6aa' }}
    whileTap={{ scale: 0.97 }}
  >
    <Card
      className="hover-glow cursor-pointer dark:bg-card transition-transform hover:scale-105"
      onClick={() => navigate(tool.route)}
    >
      <CardContent className="p-4 md:p-6 text-center">
        {tool.icon}
        <h3 className="font-medium text-sm md:text-base">{tool.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{tool.desc}</p>
      </CardContent>
    </Card>
  </motion.div>
))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 md:mt-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {[
                {
                  title: "Create Plan",
                  desc: "Plan your study sessions",
                  icon: <Calendar className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/study-plans"
                },
                {
                  title: "AI Assistant",
                  desc: "Get personalized help",
                  icon: <Brain className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/ai-assistant"
                },
                {
                  title: "View Progress",
                  desc: "Track your learning",
                  icon: <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/progress"
                }
              ].map((action, idx) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card
                    className="hover-glow cursor-pointer dark:bg-card"
                    onClick={() => navigate(action.route)}
                  >
                    <CardContent className="p-4 md:p-6 text-center">
                      {action.icon}
                      <h3 className="font-medium text-sm md:text-base">{action.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{action.desc}</p>
                    </CardContent>
                  </Card>
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
