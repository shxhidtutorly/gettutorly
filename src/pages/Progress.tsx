import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  BookOpen, 
  Brain, 
  Zap,
  Calendar,
  BarChart3,
  Trophy,
  Flame,
  CheckCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import ProgressStatCard from "@/components/progress/ProgressStatCard";
import WeeklyStudyHoursChart from "@/components/progress/WeeklyStudyHoursChart";
import MonthlyProgressChart from "@/components/progress/MonthlyProgressChart";
import MaterialProgressCard from "@/components/progress/MaterialProgressCard";
import LearningInsightCard from "@/components/progress/LearningInsightCard";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion } from "framer-motion";

const Progress = () => {
  const { toast } = useToast();
  const { stats } = useStudyTracking();
  const [selectedTab, setSelectedTab] = useState("overview");

  const weeklyData = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 3 },
    { day: "Wed", hours: 4 },
    { day: "Thu", hours: 3 },
    { day: "Fri", hours: 5 },
    { day: "Sat", hours: 2 },
    { day: "Sun", hours: 1 },
  ];

  const monthlyData = [
    { month: "Jan", progress: 60 },
    { month: "Feb", progress: 45 },
    { month: "Mar", progress: 80 },
    { month: "Apr", progress: 70 },
    { month: "May", progress: 90 },
  ];

  const materialProgress = [
    { name: "Math", progress: 75 },
    { name: "Science", progress: 50 },
    { name: "History", progress: 90 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-[#101010] via-[#23272e] to-[#09090b] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-400" />
              Progress Tracker
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track your study progress and identify areas for improvement
            </p>
          </motion.div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards - Remove className props */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ProgressStatCard
                  title="Study Hours"
                  value={stats.totalStudyHours}
                  unit="hrs"
                  change={12}
                  icon={<Clock className="h-5 w-5 text-blue-500" />}
                />
                <ProgressStatCard
                  title="Sessions"
                  value={stats.sessionCount}
                  change={8}
                  icon={<Target className="h-5 w-5 text-green-500" />}
                />
                <ProgressStatCard
                  title="Streak"
                  value={stats.streakDays}
                  change={2}
                  icon={<Flame className="h-5 w-5 text-orange-500" />}
                />
                <ProgressStatCard
                  title="Quiz Score"
                  value={stats.averageQuizScore}
                  unit="%"
                  change={5}
                  icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                />
              </div>

              {/* Charts Grid - Remove className props */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeeklyStudyHoursChart 
                  data={weeklyData} 
                  isLoading={false}
                />
                <MonthlyProgressChart 
                  data={monthlyData} 
                  isLoading={false}
                />
              </div>

              {/* Materials Progress - Remove className props */}
              <Card className="dark:bg-card border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    Materials Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materialProgress.map((material, index) => (
                      <MaterialProgressCard
                        key={index}
                        name={material.name}
                        progress={material.progress}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Insights - Remove className props */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LearningInsightCard
                  icon={<Brain className="h-6 w-6 text-blue-500" />}
                  title="Learning Efficiency"
                  value="94%"
                  description="You're retaining information well with consistent study patterns."
                />
                <LearningInsightCard
                  icon={<Zap className="h-6 w-6 text-yellow-500" />}
                  title="Peak Performance"
                  value="2-4 PM"
                  description="Your highest quiz scores occur during afternoon study sessions."
                  bgColorClass="bg-yellow-500/10"
                  iconColorClass="text-yellow-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="subjects">
              <p>Subject-specific progress will be displayed here.</p>
            </TabsContent>

            <TabsContent value="goals">
              <p>Your learning goals and achievements will be tracked here.</p>
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
