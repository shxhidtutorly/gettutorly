
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { useUserStats } from "@/hooks/useUserStats";
import {
  TrendingUp,
  Calendar,
  Target,
  Clock,
  BookOpen,
  Zap,
  Brain,
  CheckCircle,
  Award,
  Star,
  ArrowLeft,
  BarChart3,
  Activity
} from "lucide-react";

const ProgressPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { stats, loading } = useUserStats();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-lg mt-4">Please sign in to view your progress.</p>
        </div>
      </div>
    );
  }

  const timeframes = [
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
    { id: "all", label: "All Time" }
  ];

  const studyGoals = [
    { title: "Daily Study Goal", current: 45, target: 60, unit: "minutes" },
    { title: "Weekly Notes", current: 8, target: 10, unit: "notes" },
    { title: "Monthly Quizzes", current: 15, target: 20, unit: "quizzes" },
    { title: "Learning Streak", current: 7, target: 30, unit: "days" }
  ];

  const achievements = [
    { id: 1, title: "First Note Created", description: "Created your first AI note", icon: <BookOpen className="w-6 h-6" />, unlocked: true },
    { id: 2, title: "Quiz Master", description: "Completed 10 quizzes", icon: <Target className="w-6 h-6" />, unlocked: true },
    { id: 3, title: "Study Streak", description: "7 days in a row", icon: <Zap className="w-6 h-6" />, unlocked: true },
    { id: 4, title: "Knowledge Seeker", description: "Asked 50 questions", icon: <Brain className="w-6 h-6" />, unlocked: false },
    { id: 5, title: "Flashcard Pro", description: "Created 100 flashcards", icon: <Zap className="w-6 h-6" />, unlocked: false },
    { id: 6, title: "Scholar", description: "1000 minutes studied", icon: <Award className="w-6 h-6" />, unlocked: false }
  ];

  const weeklyData = [
    { day: "Mon", study: 45, notes: 2, quizzes: 1 },
    { day: "Tue", study: 60, notes: 3, quizzes: 2 },
    { day: "Wed", study: 30, notes: 1, quizzes: 0 },
    { day: "Thu", study: 75, notes: 4, quizzes: 3 },
    { day: "Fri", study: 50, notes: 2, quizzes: 1 },
    { day: "Sat", study: 90, notes: 5, quizzes: 2 },
    { day: "Sun", study: 40, notes: 1, quizzes: 1 }
  ];

  const totalStudyHours = stats.total_study_time / 3600;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white transition-colors">
      <Navbar />

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-6 mb-2 px-4 animate-fade-in">
        <Button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 transition font-semibold shadow border border-slate-700/50 text-white backdrop-blur-sm"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              Learning Progress
            </h1>
            <p className="text-gray-300 text-base md:text-lg mt-1">
              Track your academic journey and achievements
            </p>
          </motion.div>

          {/* Timeframe Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-2 overflow-x-auto">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe.id}
                  variant={selectedTimeframe === timeframe.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                  className={`whitespace-nowrap ${
                    selectedTimeframe === timeframe.id
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-slate-600/50 text-gray-300 hover:bg-slate-700/50"
                  }`}
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalStudyHours < 1 ? Math.round(totalStudyHours * 60) : totalStudyHours.toFixed(1)}
                  {totalStudyHours < 1 ? "m" : "h"}
                </div>
                <div className="text-sm text-gray-400">Study Time</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-5 h-5 text-green-400" />
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.notes_created}</div>
                <div className="text-sm text-gray-400">Notes Created</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.quizzes_taken}</div>
                <div className="text-sm text-gray-400">Quizzes Taken</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <Activity className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">7</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Study Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGoals.map((goal, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{goal.title}</h3>
                      <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                        {Math.round((goal.current / goal.target) * 100)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{goal.current} {goal.unit}</span>
                        <span>{goal.target} {goal.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={day.day} className="flex items-center space-x-4">
                      <div className="w-12 text-sm text-gray-400 font-medium">
                        {day.day}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(day.study / 90) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 w-12">{day.study}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border transition-all backdrop-blur-sm ${
                    achievement.unlocked
                      ? "bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50"
                      : "bg-slate-900/30 border-slate-800/50 opacity-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${achievement.unlocked ? 'text-purple-400' : 'text-gray-500'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProgressPage;
