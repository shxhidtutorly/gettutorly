
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useUserStats } from "@/hooks/useUserStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Target, Award, Brain } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import ProgressStatCard from "@/components/progress/ProgressStatCard";
import WeeklyStudyHoursChart from "@/components/progress/WeeklyStudyHoursChart";
import MonthlyProgressChart from "@/components/progress/MonthlyProgressChart";
import LearningInsightCard from "@/components/progress/LearningInsightCard";
import MaterialProgressCard from "@/components/progress/MaterialProgressCard";
import { motion } from "framer-motion";
import { useProgressData } from "@/hooks/useProgressData";

const Progress = () => {
  const [user] = useAuthState(auth);
  const { stats, loading } = useUserStats(user?.uid || null);
  const { weeklyData, monthlyData, progressData, loading: dataLoading } = useProgressData(user?.uid || null);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  const totalCreated = (stats?.summaries_created || 0) + 
                      (stats?.notes_created || 0) + 
                      (stats?.quizzes_taken || 0) + 
                      (stats?.flashcards_created || 0);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              Learning Progress
            </h1>
            <p className="text-gray-400">Track your learning journey and achievements</p>
          </motion.div>

          {/* Period Selector */}
          <div className="mb-6 flex gap-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod === period ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600 hover:bg-slate-800"}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <ProgressStatCard
              title="Total Created"
              value={totalCreated}
              icon={<Calendar className="h-4 w-4" />}
              color="blue"
            />
            <ProgressStatCard
              title="Notes Created"
              value={stats?.notes_created || 0}
              icon={<Target className="h-4 w-4" />}
              color="green"
            />
            <ProgressStatCard
              title="Quizzes Taken"
              value={stats?.quizzes_taken || 0}
              icon={<Award className="h-4 w-4" />}
              color="yellow"
            />
            <ProgressStatCard
              title="Study Hours"
              value={Math.round((stats?.total_study_time || 0) / 60)}
              icon={<TrendingUp className="h-4 w-4" />}
              color="purple"
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#1A1A1A] border border-slate-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="materials" className="data-[state=active]:bg-purple-600">
                Materials
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <WeeklyStudyHoursChart 
                  data={weeklyData}
                  isLoading={dataLoading}
                />
                <MonthlyProgressChart 
                  data={monthlyData}
                  isLoading={dataLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <MaterialProgressCard 
                name="Study Materials Progress"
                progress={progressData.materialsProgress}
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <LearningInsightCard 
                  icon={<Brain className="h-6 w-6" />}
                  title="Learning Streak"
                  value={`${progressData.streak} days`}
                  description="Keep up the great work!"
                />
                <LearningInsightCard 
                  icon={<Award className="h-6 w-6" />}
                  title="Weekly Goal"
                  value={`${progressData.weeklyProgress}%`}
                  description="You're on track to meet your goals"
                />
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

export default Progress;
