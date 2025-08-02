import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useUserStats } from "@/hooks/useUserStats";
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
    
  const neonColors = {
    cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
    green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]',
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-green-400" />
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
                className={`rounded-none font-bold transition-all duration-200 ${selectedPeriod === period ? `bg-cyan-500 text-black border-2 border-cyan-400 ${neonColors.cyan}` : "bg-gray-800 text-white border-2 border-gray-600 hover:bg-gray-700"}`}
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
              icon={<Calendar className="h-6 w-6" />}
              color="cyan"
            />
            <ProgressStatCard
              title="Notes Created"
              value={stats?.notes_created || 0}
              icon={<Target className="h-6 w-6" />}
              color="pink"
            />
            <ProgressStatCard
              title="Quizzes Taken"
              value={stats?.quizzes_taken || 0}
              icon={<Award className="h-6 w-6" />}
              color="yellow"
            />
            <ProgressStatCard
              title="Study Hours"
              value={Math.round((stats?.total_study_time || 0) / 60)}
              icon={<TrendingUp className="h-6 w-6" />}
              color="green"
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-900 border-2 border-gray-700 rounded-none p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black rounded-none font-bold">
                Overview
              </TabsTrigger>
              <TabsTrigger value="materials" className="data-[state=active]:bg-pink-500 data-[state=active]:text-black rounded-none font-bold">
                Materials
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black rounded-none font-bold">
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
