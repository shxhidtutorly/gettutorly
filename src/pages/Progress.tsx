import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3,
  Clock,
  Book,
  Award,
  CalendarDays,
  Target,
  CheckCircle,
  Brain,
  FileText,
  Camera,
  Calculator,
  HelpCircle
} from "lucide-react";
import { ProgressStatCard } from "@/components/progress/ProgressStatCard";
import { MaterialProgressCard } from "@/components/progress/MaterialProgressCard";
import { WeeklyStudyHoursChart } from "@/components/progress/WeeklyStudyHoursChart";
import { MonthlyProgressChart } from "@/components/progress/MonthlyProgressChart";
import { LearningInsightCard } from "@/components/progress/LearningInsightCard";
import { useStudyTracking, StudySession } from "@/hooks/useStudyTracking";
import { useAuth } from "@/contexts/AuthContext";

const Progress = () => {
  const { currentUser } = useAuth();
  const { stats, getSessions } = useStudyTracking();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    if (currentUser) {
      setSessions(getSessions());
    }
  }, [currentUser, getSessions]);

  // Calculate materials progress from sessions
  const getMaterialsProgress = () => {
    const materialMap = new Map();
    sessions.forEach(session => {
      if (session.completed) {
        materialMap.set(session.title, {
          name: session.title,
          progress: 100, // Completed sessions are 100%
          type: session.type
        });
      }
    });
    return Array.from(materialMap.values());
  };

  const materials = getMaterialsProgress();

  // Get recent sessions (last 7 days)
  const getRecentSessions = () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return sessions
      .filter(session => new Date(session.timestamp) > sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const recentSessions = getRecentSessions();

  // Mock weekly data based on actual sessions
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = days.map(day => ({ day, hours: 0 }));
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    sessions
      .filter(session => new Date(session.timestamp) > oneWeekAgo)
      .forEach(session => {
        const dayIndex = new Date(session.timestamp).getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday=0 to Sunday=6
        weekData[adjustedIndex].hours += session.duration / 60; // Convert minutes to hours
      });
    
    return weekData;
  };

  const weeklyData = getWeeklyData();
  
  const monthlyData = [
    { name: 'Jan', hours: 0 },
    { name: 'Feb', hours: 0 },
    { name: 'Mar', hours: 0 },
    { name: 'Apr', hours: 0 },
    { name: 'May', hours: stats.totalStudyHours },
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'notes': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'summary': return <FileText className="h-4 w-4 text-green-500" />;
      case 'quiz': return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'math': return <Calculator className="h-4 w-4 text-purple-500" />;
      case 'doubt-chain': return <HelpCircle className="h-4 w-4 text-orange-500" />;
      default: return <Book className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 md:h-7 md:w-7 text-spark-primary" />
              Learning Progress
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Track your study habits and achievements</p>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <ProgressStatCard 
              title="Study Hours" 
              value={stats.totalStudyHours} 
              unit="hrs" 
              change={0.5} 
              icon={<Clock className="h-4 w-4 md:h-5 md:w-5 text-spark-primary" />} 
            />
            <ProgressStatCard 
              title="Sessions" 
              value={stats.sessionCount} 
              change={2}
              icon={<Target className="h-4 w-4 md:h-5 md:w-5 text-spark-primary" />} 
            />
            <ProgressStatCard 
              title="Quizzes" 
              value={stats.quizzesCompleted} 
              change={1}
              icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-spark-primary" />} 
            />
            <ProgressStatCard 
              title="Study Streak" 
              value={stats.streakDays} 
              unit="days" 
              change={0}
              icon={<Award className="h-4 w-4 md:h-5 md:w-5 text-spark-primary" />} 
            />
          </div>

          {/* Activity Summary */}
          <div className="mb-6 md:mb-8">
            <Card className="dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-blue-500">{stats.summariesGenerated}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Summaries</p>
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-green-500">{stats.notesCreated}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">AI Notes</p>
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-yellow-500">{stats.quizzesCompleted}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Quizzes</p>
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-purple-500">{stats.mathProblemsSolved}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Math Problems</p>
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-orange-500">{stats.doubtsResolved}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Doubts Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <WeeklyStudyHoursChart data={weeklyData} isLoading={false} />
            <MonthlyProgressChart data={monthlyData} isLoading={false} />
          </div>
          
          {/* Study Materials Progress */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Completed Materials</h2>
            {materials.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {materials.map((material, index) => (
                  <MaterialProgressCard 
                    key={index}
                    name={material.name}
                    progress={material.progress}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-muted-foreground">
                <Book className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4" />
                <p className="text-sm md:text-base">No completed materials yet. Start studying to see your progress!</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Activity</h2>
            {recentSessions.length > 0 ? (
              <Card className="dark:bg-card">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(session.type)}
                          <div>
                            <p className="font-medium text-sm md:text-base">{session.title}</p>
                            <p className="text-xs md:text-sm text-muted-foreground capitalize">
                              {session.type} • {session.duration} min
                            </p>
                          </div>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-6 md:py-8 text-muted-foreground">
                <CalendarDays className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4" />
                <p className="text-sm md:text-base">No recent activity. Start studying to see your sessions here!</p>
              </div>
            )}
          </div>
          
          {/* Learning Insights */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4">Learning Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LearningInsightCard
                icon={<CalendarDays />}
                title="Current Streak"
                value={`${stats.streakDays} days`}
                description={`You've been consistent for ${stats.streakDays} consecutive days`}
              />
              <LearningInsightCard
                icon={<Award />}
                title="Most Active"
                value={sessions.length > 0 ? sessions[0]?.type || "None" : "None"}
                description={`You've been most active with ${sessions.length > 0 ? sessions[0]?.type || "studying" : "studying"}`}
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
