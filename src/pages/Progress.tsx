import { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
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
  HelpCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { ProgressStatCard } from "@/components/progress/ProgressStatCard";
import { MaterialProgressCard } from "@/components/progress/MaterialProgressCard";
import { WeeklyStudyHoursChart } from "@/components/progress/WeeklyStudyHoursChart";
import { MonthlyProgressChart } from "@/components/progress/MonthlyProgressChart";
import { LearningInsightCard } from "@/components/progress/LearningInsightCard";
import { useStudyTracking, StudySession } from "@/hooks/useStudyTracking";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const WEEKLY_GOAL_HOURS = 7; // Customize as needed

const Progress = () => {
  const { currentUser } = useAuth();
  const { stats, getSessions } = useStudyTracking();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const navigate = useNavigate();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      setSessions(getSessions());
    }
  }, [currentUser, getSessions]);

  // Calculate materials progress from sessions
  const getMaterialsProgress = () => {
    const materialMap = new Map();
    sessions.forEach((session) => {
      if (session.completed) {
        materialMap.set(session.title, {
          name: session.title,
          progress: 100, // Completed sessions are 100%
          type: session.type,
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
      .filter((session) => new Date(session.timestamp) > sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const recentSessions = getRecentSessions();

  // Weekly data
  const getWeeklyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData = days.map((day) => ({ day, hours: 0 }));

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    sessions
      .filter((session) => new Date(session.timestamp) > oneWeekAgo)
      .forEach((session) => {
        const dayIndex = new Date(session.timestamp).getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        weekData[adjustedIndex].hours += session.duration / 60;
      });

    return weekData;
  };

  const weeklyData = getWeeklyData();
  const totalWeeklyHours = weeklyData.reduce((sum, d) => sum + d.hours, 0);

  const monthlyData = [
    { name: "Jan", hours: 0 },
    { name: "Feb", hours: 0 },
    { name: "Mar", hours: 0 },
    { name: "Apr", hours: 0 },
    { name: "May", hours: stats.totalStudyHours },
    { name: "Jun", hours: 0 },
    { name: "Jul", hours: 0 },
    { name: "Aug", hours: 0 },
    { name: "Sep", hours: 0 },
    { name: "Oct", hours: 0 },
    { name: "Nov", hours: 0 },
    { name: "Dec", hours: 0 },
  ];

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to view your progress.</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "notes":
        return <Brain className="h-4 w-4 text-blue-400" />;
      case "summary":
        return <FileText className="h-4 w-4 text-green-400" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4 text-yellow-400" />;
      case "math":
        return <Calculator className="h-4 w-4 text-purple-400" />;
      case "doubt-chain":
        return <HelpCircle className="h-4 w-4 text-orange-400" />;
      default:
        return <Book className="h-4 w-4 text-gray-400" />;
    }
  };

  // Download as image
  const handleDownload = async () => {
    if (progressRef.current) {
      try {
        const dataUrl = await toPng(progressRef.current, {
          backgroundColor: "#181C23",
        });
        const link = document.createElement("a");
        link.download = "tutorly-progress.png";
        link.href = dataUrl;
        link.click();
        toast({
          title: "Downloaded!",
          description: "Your progress snapshot has been saved.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Couldn't generate image. Try again.",
        });
      }
    }
  };

  // Gradient card class
  const cardClass =
    "dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      {/* Top bar with actions */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-6 mb-2 px-4 animate-fade-in">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21253a] hover:bg-[#262a42] transition font-semibold shadow border border-[#21253a] text-white"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-[#4a3aff] via-[#ff4d9d] to-[#24c6dc] hover:scale-105 hover:brightness-110 transition font-semibold shadow text-white"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <main
        className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8"
        ref={progressRef}
        id="tutorly-progress-snapshot"
      >
        <div className="container max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffd600] via-[#f9484a] to-[#4a90e2] drop-shadow">
              📈 <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-spark-primary" />
              Learning Progress
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-1">
              Track your study habits and achievements 🎉
            </p>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in-up">
          <ProgressStatCard
  title="Study Hours ⏳"
  value={
    stats.totalStudyHours < 1
      ? Math.round(stats.totalStudyHours * 60)
      : Number(stats.totalStudyHours).toFixed(1)
  }
  unit={stats.totalStudyHours < 1 ? "min" : "hrs"}
  change={0.5}
  icon={<Clock className="h-5 w-5 text-yellow-300" />}
  className={cardClass + " hover:scale-105 transition"}
/>
            <ProgressStatCard
              title="Sessions 🎯"
              value={stats.sessionCount}
              change={2}
              icon={<Target className="h-5 w-5 text-pink-400" />}
              className={cardClass + " hover:scale-105 transition"}
            />
            <ProgressStatCard
              title="Quizzes 📝"
              value={stats.quizzesCompleted}
              change={1}
              icon={<CheckCircle className="h-5 w-5 text-green-400" />}
              className={cardClass + " hover:scale-105 transition"}
            />
            <ProgressStatCard
              title="Study Streak 🔥"
              value={stats.streakDays}
              unit="days"
              change={0}
              icon={<Award className="h-5 w-5 text-orange-400" />}
              className={cardClass + " hover:scale-105 transition"}
            />
          </div>

          {/* Study Hours Progress Bar */}
          <div className={`${cardClass} px-6 py-3 mb-7 animate-fade-in-up`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-lg flex items-center gap-2">
                Weekly Study Goal 🎯
              </span>
              <span className="text-base font-medium">
                {totalWeeklyHours.toFixed(1)}/{WEEKLY_GOAL_HOURS} hrs
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#23294b] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff8c37] via-[#ffd600] to-[#4a90e2] transition-all"
                style={{
                  width: `${
                    Math.min((totalWeeklyHours / WEEKLY_GOAL_HOURS) * 100, 100)
                  }%`,
                }}
              />
            </div>
            {totalWeeklyHours >= WEEKLY_GOAL_HOURS && (
              <div className="text-green-400 mt-2 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Goal achieved! 🎉
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="mb-7 animate-fade-in-up">
            <Card className={cardClass}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🗂️ Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      {stats.summariesGenerated}
                    </p>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Summaries
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {stats.notesCreated}
                    </p>
                    <p className="text-xs md:text-base text-muted-foreground">
                      AI Notes
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">
                      {stats.quizzesCompleted}
                    </p>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Quizzes
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {stats.mathProblemsSolved}
                    </p>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Math Problems
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-400">
                      {stats.doubtsResolved}
                    </p>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Doubts Resolved
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-7 animate-fade-in-up">
            <WeeklyStudyHoursChart data={weeklyData} isLoading={false} className={cardClass} />
            <MonthlyProgressChart data={monthlyData} isLoading={false} className={cardClass} />
          </div>

          {/* Study Materials Progress */}
          <div className="mb-7 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📚 Completed Materials
            </h2>
            {materials.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {materials.map((material, index) => (
                  <MaterialProgressCard
                    key={index}
                    name={material.name}
                    progress={material.progress}
                    className={cardClass + " hover:scale-105 transition"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-muted-foreground">
                <Book className="h-10 w-10 md:h-14 md:w-14 mx-auto mb-4" />
                <p className="text-base md:text-lg">
                  No completed materials yet. Start studying to see your progress! 🚀
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mb-7 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🕒 Recent Activity
            </h2>
            {recentSessions.length > 0 ? (
              <Card className={cardClass}>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between py-2 border-b border-[#23294b] last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {getActivityIcon(session.type)}
                          <div>
                            <p className="font-medium text-base">
                              {session.title}
                            </p>
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
                <CalendarDays className="h-10 w-10 md:h-14 md:w-14 mx-auto mb-4" />
                <p className="text-base md:text-lg">
                  No recent activity. Start studying to see your sessions here!
                </p>
              </div>
            )}
          </div>

          {/* Learning Insights */}
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              💡 Learning Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LearningInsightCard
                icon={<CalendarDays />}
                title="Current Streak"
                value={`${stats.streakDays} days`}
                description={`You've been consistent for ${stats.streakDays} consecutive days`}
                className={cardClass}
              />
              <LearningInsightCard
                icon={<Award />}
                title="Most Active"
                value={sessions.length > 0 ? sessions[0]?.type || "None" : "None"}
                description={`You've been most active with ${
                  sessions.length > 0 ? sessions[0]?.type || "studying" : "studying"
                }`}
                bgColorClass="bg-spark-peach"
                iconColorClass="text-orange-600"
                className={cardClass}
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
