
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  TrendingUp,
  BookOpen,
  Target,
  Calendar,
  Award,
  Activity,
  Clock,
  Brain,
} from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useUser } from "@/hooks/useUser";
import { motion } from "framer-motion";
import WeeklyStudyHoursChart from "@/components/progress/WeeklyStudyHoursChart";
import MonthlyProgressChart from "@/components/progress/MonthlyProgressChart";
import ProgressStatCard from "@/components/progress/ProgressStatCard";
import MaterialProgressCard from "@/components/progress/MaterialProgressCard";
import LearningInsightCard from "@/components/progress/LearningInsightCard";

const Progress = () => {
  const { stats, loading: statsLoading } = useUserStats();
  const { user } = useUser();
  const [weeklyGoal] = useState(10); // hours per week

  // Mock data for now - in a real app, this would come from your backend
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        weeklyHours: [
          { day: 'Mon', hours: 2 },
          { day: 'Tue', hours: 4 },
          { day: 'Wed', hours: 3 },
          { day: 'Thu', hours: 5 },
          { day: 'Fri', hours: 6 },
          { day: 'Sat', hours: 4 },
          { day: 'Sun', hours: 7 }
        ],
        monthlyProgress: [
          { name: 'Jan', hours: 65 },
          { name: 'Feb', hours: 70 },
          { name: 'Mar', hours: 75 },
          { name: 'Apr', hours: 80 },
          { name: 'May', hours: 78 },
          { name: 'Jun', hours: 85 }
        ],
        streakDays: 7,
        totalStudyTime: stats.total_study_time,
        completedGoals: 12,
        totalGoals: 15,
      };
    },
    enabled: !!user,
  });

  if (statsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const weeklyHours = stats.total_study_time / 3600; // Convert seconds to hours
  const weeklyProgress = Math.min((weeklyHours / weeklyGoal) * 100, 100);

  const studyData = progressData || {
    weeklyHours: [
      { day: 'Mon', hours: 2 },
      { day: 'Tue', hours: 4 },
      { day: 'Wed', hours: 3 },
      { day: 'Thu', hours: 5 },
      { day: 'Fri', hours: 6 },
      { day: 'Sat', hours: 4 },
      { day: 'Sun', hours: 7 }
    ],
    monthlyProgress: [
      { name: 'Jan', hours: 65 },
      { name: 'Feb', hours: 70 },
      { name: 'Mar', hours: 75 },
      { name: 'Apr', hours: 80 },
      { name: 'May', hours: 78 },
      { name: 'Jun', hours: 85 }
    ],
    streakDays: 7,
    totalStudyTime: stats.total_study_time,
    completedGoals: 12,
    totalGoals: 15,
  };

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
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
              <TrendingUp className="text-primary" />
              Learning Progress
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your study journey and achievements
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProgressStatCard
              title="Study Hours"
              value={weeklyHours.toFixed(1)}
              unit="h"
              change={2.5}
              icon={<Clock />}
            />
            <ProgressStatCard
              title="Materials Studied"
              value={stats.materials_created}
              change={3}
              icon={<BookOpen />}
            />
            <ProgressStatCard
              title="Quiz Score"
              value="85"
              unit="%"
              change={5}
              icon={<Target />}
            />
            <ProgressStatCard
              title="Study Streak"
              value={`${studyData.streakDays} days`}
              icon={<Award />}
            />
          </div>

          {/* Weekly Goal Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Target className="text-primary" />
                  Weekly Study Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{weeklyHours.toFixed(1)}h / {weeklyGoal}h</span>
                  </div>
                  <ProgressBar value={weeklyProgress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Keep going! You're {weeklyProgress.toFixed(0)}% there</span>
                    <Badge variant={weeklyProgress >= 100 ? "default" : "secondary"}>
                      {weeklyProgress >= 100 ? "Goal Achieved!" : "In Progress"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WeeklyStudyHoursChart data={studyData.weeklyHours} isLoading={false} />
            <MonthlyProgressChart data={studyData.monthlyProgress} isLoading={false} />
          </div>

          {/* Material Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MaterialProgressCard
              name="Notes Created"
              progress={(stats.notes_created / (stats.notes_created + 5)) * 100}
            />
            <MaterialProgressCard
              name="Flashcards Mastered"
              progress={(stats.flashcards_created / (stats.flashcards_created + 10)) * 100}
            />
          </div>

          {/* Learning Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LearningInsightCard
              icon={<Brain />}
              title="Learning Insights"
              value="3 Key Patterns"
              description="Based on your study habits"
            />
          </motion.div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Progress;
