
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { 
  BarChart3,
  Clock,
  Book,
  Award,
  CalendarDays
} from "lucide-react";
import { ProgressStatCard } from "@/components/progress/ProgressStatCard";
import { MaterialProgressCard } from "@/components/progress/MaterialProgressCard";
import { WeeklyStudyHoursChart } from "@/components/progress/WeeklyStudyHoursChart";
import { MonthlyProgressChart } from "@/components/progress/MonthlyProgressChart";
import { LearningInsightCard } from "@/components/progress/LearningInsightCard";
import { useRealTimeStudyProgress } from "@/hooks/useRealTimeData";
import { useAuth } from "@/contexts/AuthContext";

const Progress = () => {
  const { currentUser } = useAuth();
  const { progress, loading } = useRealTimeStudyProgress();
  const { toast } = useToast();

  // Calculate real stats from progress data
  const calculateStats = () => {
    if (!progress.length) {
      return {
        totalHours: 0,
        weeklyChange: 0,
        completedTopics: 0,
        topicsChange: 0,
        streakDays: 0,
        materials: []
      };
    }

    const totalMinutes = progress.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const completedTopics = progress.filter((p: any) => p.completed).length;
    
    // Calculate materials progress
    const materials = progress.map((p: any) => ({
      name: p.material_title || 'Study Material',
      progress: p.progress_percentage || 0
    }));

    return {
      totalHours,
      weeklyChange: 2.3, // Could calculate from timestamps
      completedTopics,
      topicsChange: 1,
      streakDays: 5, // Could calculate from activity logs
      materials
    };
  };

  const stats = calculateStats();
  
  // Mock weekly data - could be calculated from real progress data
  const weeklyData = [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.2 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 3.0 },
    { day: 'Sat', hours: 1.0 },
    { day: 'Sun', hours: 0.5 },
  ];
  
  const monthlyData = [
    { name: 'Jan', hours: 20 },
    { name: 'Feb', hours: 25 },
    { name: 'Mar', hours: 18 },
    { name: 'Apr', hours: 30 },
    { name: 'May', hours: stats.totalHours },
    { name: 'Jun', hours: 0 },
    { name: 'Jul', hours: 0 },
    { name: 'Aug', hours: 0 },
    { name: 'Sep', hours: 0 },
    { name: 'Oct', hours: 0 },
    { name: 'Nov', hours: 0 },
    { name: 'Dec', hours: 0 }
  ];

  if (!currentUser) {
    return <div>Please sign in to view your progress.</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-spark-primary" />
              Learning Progress
            </h1>
            <p className="text-muted-foreground">Track your study habits and achievements</p>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse h-28 bg-gray-200 rounded-lg dark:bg-muted"></div>
              ))
            ) : (
              <>
                <ProgressStatCard 
                  title="Study Hours This Week" 
                  value={stats.totalHours} 
                  unit="hrs" 
                  change={stats.weeklyChange} 
                  icon={<Clock className="h-5 w-5 text-spark-primary" />} 
                />
                <ProgressStatCard 
                  title="Topics Completed" 
                  value={stats.completedTopics} 
                  change={stats.topicsChange}
                  icon={<Book className="h-5 w-5 text-spark-primary" />} 
                />
                <ProgressStatCard 
                  title="Study Streak" 
                  value={stats.streakDays} 
                  unit="days" 
                  change={0}
                  icon={<Award className="h-5 w-5 text-spark-primary" />} 
                />
              </>
            )}
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WeeklyStudyHoursChart data={weeklyData} isLoading={loading} />
            <MonthlyProgressChart data={monthlyData} isLoading={loading} />
          </div>
          
          {/* Study Materials Progress */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Study Materials Progress</h2>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg dark:bg-muted"></div>
                ))}
              </div>
            ) : stats.materials.length > 0 ? (
              <div className="space-y-4">
                {stats.materials.map((material, index) => (
                  <MaterialProgressCard 
                    key={index}
                    name={material.name}
                    progress={material.progress}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="h-12 w-12 mx-auto mb-4" />
                <p>No study materials found. Start uploading materials to track your progress!</p>
              </div>
            )}
          </div>
          
          {/* Learning Insights */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Learning Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LearningInsightCard
                icon={<CalendarDays />}
                title="Best Study Day"
                value="Friday"
                description="You study an average of 3 hours on Fridays"
              />
              <LearningInsightCard
                icon={<Award />}
                title="Most Progress In"
                value={stats.materials.length > 0 ? stats.materials[0].name : "No materials"}
                description={stats.materials.length > 0 ? `You've completed ${stats.materials[0].progress}% of this material` : "Upload materials to see progress"}
                bgColorClass="bg-spark-peach"
                iconColorClass="text-orange-600"
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Progress;
