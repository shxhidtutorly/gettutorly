
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Brain, 
  ChevronRight, 
  Lightbulb, 
  Zap,
  Target,
  Trophy,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Award,
  Users,
  Globe,
  Heart,
  Sparkles
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

const FuturisticDashboard = () => {
  const { user, isLoaded } = useUser();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    notesGenerated: 127,
    quizzesTaken: 43,
    studyHours: 89,
    conceptsMastered: 156,
    weeklyGoal: 25,
    currentWeekProgress: 18,
    streak: 12,
    level: 7,
    xp: 2840,
    nextLevelXp: 3000
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
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
          <p className="text-white text-xl font-medium">Loading your learning universe...</p>
        </motion.div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
        >
          <div className="w-16 h-16 text-purple-400 mx-auto mb-4">🚀</div>
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

  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.email) return user.email.split('@')[0];
    return 'Student';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const progressPercentage = (stats.xp / stats.nextLevelXp) * 100;
  const weeklyProgress = (stats.currentWeekProgress / stats.weeklyGoal) * 100;

  const quickActions = [
    { title: "Generate Notes", icon: <BookOpen className="h-6 w-6" />, route: "/ai-notes", color: "from-blue-500 to-cyan-500" },
    { title: "Take Quiz", icon: <Brain className="h-6 w-6" />, route: "/quiz", color: "from-green-500 to-emerald-500" },
    { title: "Ask Doubts", icon: <Lightbulb className="h-6 w-6" />, route: "/doubt-chain", color: "from-yellow-500 to-orange-500" },
    { title: "Study Mode", icon: <Target className="h-6 w-6" />, route: "/study-modes", color: "from-purple-500 to-pink-500" }
  ];

  const achievements = [
    { title: "First Week", icon: <Calendar className="h-5 w-5" />, completed: true },
    { title: "Quiz Master", icon: <Trophy className="h-5 w-5" />, completed: true },
    { title: "Note Taker", icon: <BookOpen className="h-5 w-5" />, completed: true },
    { title: "Streak Hero", icon: <Zap className="h-5 w-5" />, completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                {getGreeting()}, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-white/70 text-lg mt-2">Ready to expand your knowledge today?</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-300">{currentTime.toLocaleTimeString()}</div>
              <div className="text-white/60">{currentTime.toLocaleDateString()}</div>
            </div>
          </div>

          {/* Level Progress */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Level {stats.level}</h3>
                    <p className="text-white/70">Learning Explorer</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-300">{stats.xp} XP</div>
                  <div className="text-white/60 text-sm">{stats.nextLevelXp - stats.xp} to next level</div>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-white/20" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                  onClick={() => navigate(action.route)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">{action.title}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Your Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.notesGenerated}</div>
                <div className="text-white/70 text-sm">Notes Generated</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.quizzesTaken}</div>
                <div className="text-white/70 text-sm">Quizzes Taken</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.studyHours}h</div>
                <div className="text-white/70 text-sm">Study Time</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.conceptsMastered}</div>
                <div className="text-white/70 text-sm">Concepts Mastered</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Weekly Goal & Achievements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Goal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/70">Progress</span>
                  <span className="font-semibold text-white">{stats.currentWeekProgress}/{stats.weeklyGoal} concepts</span>
                </div>
                <Progress value={weeklyProgress} className="h-3 bg-white/20 mb-4" />
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">You're {Math.round(weeklyProgress)}% there!</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={achievement.title} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.completed ? 'bg-green-500' : 'bg-white/20'
                      }`}>
                        {achievement.icon}
                      </div>
                      <span className={`${achievement.completed ? 'text-white' : 'text-white/50'}`}>
                        {achievement.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border-purple-300/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {subscription.plan_name} Plan
                      </h3>
                      <p className="text-purple-200">
                        {subscription.is_trial ? 'Trial Active' : 'Premium Access'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500 text-white">
                    {subscription.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default FuturisticDashboard;
