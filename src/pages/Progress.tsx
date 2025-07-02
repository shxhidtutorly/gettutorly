
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Progress as ProgressBar } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, BookOpen, Award, Target, Clock, Brain, Users, Trophy, ChevronRight } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

const ProgressPage = () => {
  const [user] = useAuthState(auth);
  const { stats, loading: statsLoading } = useUserStats(user?.uid || null);

  // Mock query for materials
  const { data: materials, isLoading: materialsLoading } = useQuery({
    queryKey: ['materials', user?.uid],
    queryFn: async () => {
      // Mock data for now
      return [];
    },
    enabled: !!user
  });

  const mockStats = {
    totalStudyHours: 24.5,
    completedSessions: 18,
    streakDays: 7,
    averageScore: 85,
    weeklyGoal: 25,
    monthlyGoal: 100,
    totalMaterials: stats.materials_created || 0,
    completedQuizzes: stats.quizzes_taken || 0,
    generatedNotes: stats.notes_created || 0,
    flashcardsSets: stats.flashcards_created || 0,
  };

  const weeklyProgress = (mockStats.totalStudyHours / mockStats.weeklyGoal) * 100;
  const monthlyProgress = (mockStats.totalStudyHours / mockStats.monthlyGoal) * 100;

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first study session", earned: true, icon: "🎯" },
    { id: 2, title: "Week Warrior", description: "Study for 7 consecutive days", earned: mockStats.streakDays >= 7, icon: "🔥" },
    { id: 3, title: "Note Master", description: "Generate 10 AI notes", earned: mockStats.generatedNotes >= 10, icon: "📝" },
    { id: 4, title: "Quiz Champion", description: "Complete 25 quizzes", earned: mockStats.completedQuizzes >= 25, icon: "🏆" },
  ];

  const studyInsights = [
    { label: "Best Study Time", value: "2:00 PM - 4:00 PM", icon: Clock },
    { label: "Favorite Subject", value: "Mathematics", icon: Brain },
    { label: "Learning Style", value: "Visual + Practice", icon: Target },
    { label: "Study Streak", value: `${mockStats.streakDays} days`, icon: TrendingUp },
  ];

  if (statsLoading || materialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              📊 Your Progress
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your learning journey and achievements
            </p>
          </motion.div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-200">Study Hours</p>
                      <p className="text-2xl font-bold text-white">{mockStats.totalStudyHours}h</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Materials</p>
                      <p className="text-2xl font-bold text-white">{materials?.length || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 hover:border-green-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-200">Streak</p>
                      <p className="text-2xl font-bold text-white">{mockStats.streakDays} days</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30 hover:border-orange-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-200">Avg Score</p>
                      <p className="text-2xl font-bold text-white">{mockStats.averageScore}%</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-[#1A1A1A] border border-slate-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#121212] border-slate-700">
                  <CardHeader>
                    <CardTitle>Study Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Sessions Completed</span>
                        <span className="font-semibold">{mockStats.completedSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Notes Generated</span>
                        <span className="font-semibold">{mockStats.generatedNotes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Quizzes Taken</span>
                        <span className="font-semibold">{mockStats.completedQuizzes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Flashcard Sets</span>
                        <span className="font-semibold">{mockStats.flashcardsSets}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border-slate-700">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-purple-600/10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-sm">Generated AI notes</span>
                        </div>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-blue-600/10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm">Completed quiz</span>
                        </div>
                        <span className="text-xs text-muted-foreground">5 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-green-600/10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm">Study session completed</span>
                        </div>
                        <span className="text-xs text-muted-foreground">1 day ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#121212] border-slate-700">
                  <CardHeader>
                    <CardTitle>Weekly Goal</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {mockStats.totalStudyHours} / {mockStats.weeklyGoal} hours
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ProgressBar value={weeklyProgress} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {mockStats.weeklyGoal - mockStats.totalStudyHours > 0 
                        ? `${(mockStats.weeklyGoal - mockStats.totalStudyHours).toFixed(1)} hours remaining`
                        : "Goal achieved! 🎉"
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border-slate-700">
                  <CardHeader>
                    <CardTitle>Monthly Goal</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {mockStats.totalStudyHours} / {mockStats.monthlyGoal} hours
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ProgressBar value={monthlyProgress} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {mockStats.monthlyGoal - mockStats.totalStudyHours > 0 
                        ? `${(mockStats.monthlyGoal - mockStats.totalStudyHours).toFixed(1)} hours remaining`
                        : "Goal achieved! 🎉"
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`bg-[#121212] border-slate-700 ${achievement.earned ? 'ring-2 ring-yellow-500/50' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        {achievement.earned && (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                            Earned
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studyInsights.map((insight, index) => (
                  <Card key={index} className="bg-[#121212] border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <insight.icon className="h-8 w-8 text-purple-400" />
                        <div>
                          <p className="text-sm text-muted-foreground">{insight.label}</p>
                          <p className="font-semibold text-white">{insight.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ProgressPage;
