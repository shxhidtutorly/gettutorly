
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

const Progress = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.2 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 3.0 },
    { day: 'Sat', hours: 1.0 },
    { day: 'Sun', hours: 0.5 },
  ]);
  
  const [progressData, setProgressData] = useState({
    totalHours: 12.5,
    weeklyChange: 2.3,
    completedTopics: 15,
    topicsChange: 3,
    streakDays: 8,
    materials: [
      { name: 'Psychology', progress: 75 },
      { name: 'Calculus', progress: 40 },
      { name: 'History', progress: 90 },
      { name: 'Chemistry', progress: 25 },
    ]
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Show success toast on data load complete
      toast({
        title: "Progress data loaded",
        description: "Your latest study progress has been updated",
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  const monthlyData = [
    { name: 'Jan', hours: 20 },
    { name: 'Feb', hours: 25 },
    { name: 'Mar', hours: 18 },
    { name: 'Apr', hours: 30 },
    { name: 'May', hours: 0 },
    { name: 'Jun', hours: 0 },
    { name: 'Jul', hours: 0 },
    { name: 'Aug', hours: 0 },
    { name: 'Sep', hours: 0 },
    { name: 'Oct', hours: 0 },
    { name: 'Nov', hours: 0 },
    { name: 'Dec', hours: 0 }
  ];
  
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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse h-28 bg-gray-200 rounded-lg"></div>
              ))
            ) : (
              <>
                <ProgressStatCard 
                  title="Study Hours This Week" 
                  value={progressData.totalHours} 
                  unit="hrs" 
                  change={progressData.weeklyChange} 
                  icon={<Clock className="h-5 w-5 text-spark-primary" />} 
                />
                <ProgressStatCard 
                  title="Topics Completed" 
                  value={progressData.completedTopics} 
                  change={progressData.topicsChange}
                  icon={<Book className="h-5 w-5 text-spark-primary" />} 
                />
                <ProgressStatCard 
                  title="Study Streak" 
                  value={progressData.streakDays} 
                  unit="days" 
                  change={0}
                  icon={<Award className="h-5 w-5 text-spark-primary" />} 
                />
              </>
            )}
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WeeklyStudyHoursChart data={weeklyData} isLoading={isLoading} />
            <MonthlyProgressChart data={monthlyData} isLoading={isLoading} />
          </div>
          
          {/* Study Materials Progress */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Study Materials Progress</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {progressData.materials.map((material, index) => (
                  <MaterialProgressCard 
                    key={index}
                    name={material.name}
                    progress={material.progress}
                  />
                ))}
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
                value="History"
                description="You've completed 90% of your history materials"
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
