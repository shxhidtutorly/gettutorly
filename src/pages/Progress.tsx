
import React from "react";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStatCard } from "@/components/progress/ProgressStatCard";
import { WeeklyStudyHoursChart } from "@/components/progress/WeeklyStudyHoursChart";
import { MonthlyProgressChart } from "@/components/progress/MonthlyProgressChart";
import { LearningInsightCard } from "@/components/progress/LearningInsightCard";
import { MaterialProgressCard } from "@/components/progress/MaterialProgressCard";
import { 
  Clock, 
  FileText, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Calendar, 
  Trophy,
  BookOpen
} from "lucide-react";

const Progress = () => {
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useUserStats();

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="h-6 md:h-8 w-6 md:w-8 text-purple-400" />
              Your Progress
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Track your learning journey and achievements</p>
          </motion.div>

          {/* Progress Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <ProgressStatCard
              title="Study Time"
              value={stats?.total_study_time || 0}
              icon={<Clock className="h-5 w-5" />}
            />
            <ProgressStatCard
              title="Notes Created"
              value={stats?.notes_created || 0}
              icon={<FileText className="h-5 w-5" />}
            />
            <ProgressStatCard
              title="Quizzes Taken"
              value={stats?.quizzes_taken || 0}
              icon={<Target className="h-5 w-5" />}
            />
            <ProgressStatCard
              title="Quiz Score"
              value={stats?.average_quiz_score || 0}
              icon={<Trophy className="h-5 w-5" />}
            />
          </div>

          {/* Charts and Insights */}
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2 mb-6 md:mb-8">
            <WeeklyStudyHoursChart />
            <MonthlyProgressChart />
          </div>

          {/* Additional Progress Cards */}
          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            <LearningInsightCard 
              title="This Month"
              description="Your learning activities this month"
              stats={[
                { label: "Sessions", value: stats?.sessions_this_month || 0 },
                { label: "Materials", value: stats?.materials_created || 0 },
                { label: "Flashcards", value: stats?.flashcards_created || 0 },
              ]}
              icon={<Calendar className="h-6 w-6 text-blue-400" />}
            />
            
            <MaterialProgressCard 
              title="Learning Milestones"
              value={stats?.learning_milestones || 0}
              description="Total achievements unlocked"
              icon={<TrendingUp className="h-6 w-6 text-green-400" />}
            />

            <Card className="bg-[#121212] border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Last study session</span>
                    <span className="text-purple-400">Today</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Notes this week</span>
                    <span className="text-blue-400">{Math.min(stats?.notes_created || 0, 15)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Average score</span>
                    <span className="text-green-400">{stats?.average_quiz_score || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Progress;
