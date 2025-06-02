import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  Target,
  Activity,
  Plus,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  Award,
  Brain,
  Zap,
  BookMarked,
  HelpCircle,
  Flame
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeStudyProgress, useRealTimeStudyMaterials, useRealTimeUserActivity } from "@/hooks/useRealTimeData";
import { motion } from "framer-motion";

const EmptyStateIllustration = ({ label }: { label: string }) => (
  <motion.div
    initial={{ scale: 0.85, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center py-8"
  >
    {/* Simple SVG illustration */}
    <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="#222d3a" stroke="#3b82f6" strokeWidth="4" />
      <path d="M28 50a12 12 0 0124 0" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="36" r="2" fill="#3b82f6" />
      <circle cx="48" cy="36" r="2" fill="#3b82f6" />
    </svg>
    <div className="text-muted-foreground mt-4 text-center">
      <p className="font-medium">{label}</p>
    </div>
  </motion.div>
);

// Progress ring (circular)
const ProgressRing = ({ percent }: { percent: number }) => {
  const radius = 32;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#374151"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke="#3b82f6"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1 }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fill="#fff"
        fontSize="1.2rem"
        fontWeight={700}
      >
        {percent}%
      </text>
    </svg>
  );
};

// Fake streak data for demo (replace with your real logic if you have one)
const useStreak = () => {
  // You could use "lastActivityDate" and compare to today in real use
  const [streak, setStreak] = useState(3);
  useEffect(() => {
    // TODO: Replace with real streak logic
    setStreak(3 + Math.floor(Math.random() * 2)); // Random 3-4
  }, []);
  return streak;
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useRealTimeStudyProgress();
  const { materials, loading: materialsLoading } = useRealTimeStudyMaterials();
  const { activities, loading: activitiesLoading } = useRealTimeUserActivity();
  const { toast } = useToast();
  const streak = useStreak();

  // Calculate dashboard metrics from real data
  const calculateMetrics = () => {
    const totalMaterials = materials.length;
    const totalProgress = progress.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0);
    const avgProgress = totalMaterials > 0 ? Math.round(totalProgress / totalMaterials) : 0;
    const completedMaterials = progress.filter((p: any) => p.completed).length;
    const totalTimeSpent = progress.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0);
    const hoursSpent = Math.round((totalTimeSpent / 60) * 10) / 10;

    return {
      totalMaterials,
      avgProgress,
      completedMaterials,
      hoursSpent,
      recentActivities: activities.slice(0, 5)
    };
  };

  const metrics = calculateMetrics();

  // Get user display name safely
  const getUserDisplayName = () => {
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  // Next action nudge (personalized)
  const getNextActionPrompt = () => {
    if (!materials.length) {
      return {
        prompt: "Upload your first study material to get started!",
        action: () => navigate('/library'),
        icon: <Plus className="h-6 w-6 text-spark-primary" />
      };
    }
    if (!progress.length) {
      return {
        prompt: "Start your first study session now.",
        action: () => navigate('/study-plans'),
        icon: <Calendar className="h-6 w-6 text-spark-primary" />
      };
    }
    return null;
  };

  const nextAction = getNextActionPrompt();

  if (!currentUser) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
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
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
            <span className="font-semibold text-orange-300">{streak}-day streak!</span>
            <Badge className="ml-2 bg-orange-600/30 border-orange-400 text-orange-100">Keep it up!</Badge>
          </motion.div>

          {/* Next action nudge */}
          {nextAction && (
            <motion.div
              className="mb-8 p-4 rounded-lg bg-[#172032] flex items-center gap-3 shadow-md border border-spark-primary/20"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {nextAction.icon}
              <span className="flex-1">{nextAction.prompt}</span>
              <Button size="sm" variant="outline" className="border-spark-primary" onClick={nextAction.action}>
                Do it!
              </Button>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Study Materials */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Study Materials</p>
                      <p className="text-2xl font-bold">{materialsLoading ? '...' : metrics.totalMaterials}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-spark-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Avg Progress */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <div className="my-2">
                    {progressLoading ? (
                      <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                    ) : (
                      <ProgressRing percent={metrics.avgProgress} />
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
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
                      <p className="text-2xl font-bold">{progressLoading ? '...' : metrics.completedMaterials}</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hours Studied */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Card className="hover-glow dark:bg-card transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Hours Studied</p>
                      <p className="text-2xl font-bold">{progressLoading ? '...' : metrics.hoursSpent}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Progress */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="dark:bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-spark-primary" />
                    Recent Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progressLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded dark:bg-muted"></div>
                      ))}
                    </div>
                  ) : progress.length > 0 ? (
                    <div className="space-y-4">
                      {progress.slice(0, 5).map((item: any, index) => (
                        <motion.div
                          key={index}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Material {index + 1}</span>
                            <span>{item.progress_percentage || 0}%</span>
                          </div>
                          <Progress value={item.progress_percentage || 0} className="h-2" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyStateIllustration label="No progress data yet. Start studying materials to see your progress here!" />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="dark:bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-spark-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-12 bg-gray-200 rounded dark:bg-muted"></div>
                      ))}
                    </div>
                  ) : metrics.recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.recentActivities.map((activity: any, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="p-2 rounded-full bg-spark-light">
                            <FileText className="h-4 w-4 text-spark-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyStateIllustration label="No recent activity. Your activity will appear here as you use the platform." />
                  )}
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
                {
                  title: "AI Tutor",
                  desc: "Get personalized help",
                  icon: <Brain className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/ai-assistant"
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
                  title: "Upload Material",
                  desc: "Add new study materials",
                  icon: <Plus className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/library"
                },
                {
                  title: "Create Plan",
                  desc: "Plan your study sessions",
                  icon: <Calendar className="h-8 w-8 text-spark-primary mx-auto mb-2" />,
                  route: "/study-plans"
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
