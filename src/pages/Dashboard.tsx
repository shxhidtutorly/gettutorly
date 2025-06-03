
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
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);

  // Real-time streak calculation based on user activity
  useEffect(() => {
    const calculateStreak = () => {
      const lastActivity = localStorage.getItem('lastActivityDate');
      const today = new Date().toDateString();
      
      if (lastActivity === today) {
        const currentStreak = parseInt(localStorage.getItem('currentStreak') || '1');
        setStreak(currentStreak);
      } else {
        // Reset or increment streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
          const newStreak = parseInt(localStorage.getItem('currentStreak') || '0') + 1;
          localStorage.setItem('currentStreak', newStreak.toString());
          localStorage.setItem('lastActivityDate', today);
          setStreak(newStreak);
        } else {
          // Reset streak
          localStorage.setItem('currentStreak', '1');
          localStorage.setItem('lastActivityDate', today);
          setStreak(1);
        }
      }
    };

    calculateStreak();
    // Update streak every minute
    const interval = setInterval(calculateStreak, 60000);
    return () => clearInterval(interval);
  }, []);

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

      <main className="flex-1 py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {getUserDisplayName()}! 👋
            </h1>
            <p className="text-muted-foreground">Here's your learning progress overview</p>
          </motion.div>

          {/* Streak tracker */}
          <motion.div
            className="flex items-center gap-2 mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
            <span className="font-semibold text-orange-300">{streak}-day streak!</span>
            <Badge className="ml-2 bg-orange-600/30 border-orange-400 text-orange-100">Keep it up!</Badge>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* AI Notes */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all cursor-pointer" onClick={() => navigate('/ai-notes')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">AI Notes</p>
                      <p className="text-2xl font-bold">Generate</p>
                    </div>
                    <Brain className="h-8 w-8 text-spark-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Study Sessions */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Study Sessions</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Completed */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Study Time */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Study Time</p>
                      <p className="text-2xl font-bold">0h</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Study Tools Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Study Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
             {[
  {
    title: "AI Notes",
    desc: "Generate smart notes from files",
    icon: <Brain className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
    route: "/ai-notes"
  },
  {
    title: "Flashcards",
    desc: "Create and review flashcards",
    icon: <Zap className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
    route: "/flashcards"
  },
  {
    title: "Quizzes",
    desc: "Test your knowledge",
    icon: <HelpCircle className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
    route: "/quiz"
  },
  {
    title: "Summaries",
    desc: "AI-generated summaries",
    icon: <BookMarked className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
    route: "/summaries"
  },
  // --- Add this block below ---
  {
    title: "YouTube Summary",
    desc: "AI-powered video summaries",
    icon: <FileText className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
    route: "/youtube-summary"
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
      <CardContent className="p-6 text-center">
        {tool.icon}
        <h3 className="font-medium">{tool.title}</h3>
        <p className="text-sm text-muted-foreground">{tool.desc}</p>
      </CardContent>
    </Card>
  </motion.div>
))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Create Plan",
                  desc: "Plan your study sessions",
                  icon: <Calendar className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/study-plans"
                },
                {
                  title: "AI Assistant",
                  desc: "Get personalized help",
                  icon: <Brain className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/ai-assistant"
                },
                {
                  title: "View Progress",
                  desc: "Track your learning",
                  icon: <TrendingUp className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
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
                    <CardContent className="p-6 text-center">
                      {action.icon}
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
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
