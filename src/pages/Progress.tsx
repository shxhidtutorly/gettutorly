import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useUserStats } from "@/hooks/useUserStats";
import { TrendingUp, Calendar, Target, Award, Brain } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import ProgressStatCard from "@/components/progress/ProgressStatCard";
import WeeklyStudyHoursChart from "@/components/progress/WeeklyStudyHoursChart";
import MonthlyProgressChart from "@/components/progress/MonthlyProgressChart";
import LearningInsightCard from "@/components/progress/LearningInsightCard";
import MaterialProgressCard from "@/components/progress/MaterialProgressCard";

const periodOptions = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
] as const;

const Progress = () => {
  const [user] = useAuthState(auth);
  const { stats, loading } = useUserStats(user?.uid || null);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#130F40] via-[#4834D4] to-[#00B894] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-b-0 border-t-0 border-purple-400 mx-auto mb-6 shadow-xl"></div>
          <p className="text-xl font-semibold animate-pulse">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#130F40] via-[#4834D4] to-[#00B894] text-white">
      <Navbar />

      <main className="flex-1 py-4 px-2 sm:px-4 lg:px-6 pb-[5.5rem] md:pb-10">
        <div className="container max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-2 bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
                <TrendingUp className="h-8 w-8 text-green-400 animate-bounce-slow" />
                Learning Progress
              </h1>
              <p className="text-gray-200 text-sm sm:text-base font-medium">
                Track your learning journey and achievements
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
            {periodOptions.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`relative px-5 py-2 rounded-full font-medium transition-all duration-300 outline-none border-2
                  ${
                    selectedPeriod === period.value
                      ? "bg-gradient-to-r from-purple-600 to-green-400 border-transparent text-white shadow-lg scale-105"
                      : "bg-[#1a1a1a77] border-purple-600 text-purple-200 hover:scale-105 hover:ring-2 hover:ring-green-400"
                  }
                  focus:ring-2 focus:ring-purple-500
                `}
                style={{ minWidth: 90 }}
              >
                <span className="capitalize">{period.label}</span>
                {selectedPeriod === period.value && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-gradient-to-r from-purple-300 via-pink-400 to-green-200 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Stats Overview, horizontally scrollable on mobile */}
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory mb-9 scrollbar-hide">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 min-w-full w-full">
              <StatCard
                title="Study Materials"
                value={stats?.materials_created || 0}
                icon={<Calendar className="h-7 w-7 text-blue-300 group-hover:rotate-12 transition-transform duration-300" />}
                gradient="from-[#00B894]/90 to-[#00B894]/60"
                delay={0}
              />
              <StatCard
                title="Notes Created"
                value={stats?.notes_created || 0}
                icon={<Target className="h-7 w-7 text-pink-200 group-hover:scale-110 transition-transform duration-300" />}
                gradient="from-[#4834D4]/90 to-[#4834D4]/60"
                delay={0.05}
              />
              <StatCard
                title="Quizzes Taken"
                value={stats?.quizzes_taken || 0}
                icon={<Award className="h-7 w-7 text-yellow-200 group-hover:rotate-[-8deg] transition-transform duration-300" />}
                gradient="from-[#fdc830]/90 to-[#f37335]/60"
                delay={0.10}
              />
              <StatCard
                title="Study Hours"
                value={Math.round((stats?.total_study_time || 0) / 60)}
                icon={<TrendingUp className="h-7 w-7 text-green-200 animate-pulse group-hover:scale-110 transition-transform duration-300" />}
                gradient="from-[#a8ff78]/90 to-[#78ffd6]/60"
                delay={0.15}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full rounded-2xl bg-[#18192A]/70 shadow-xl backdrop-blur-2xl border border-[#2d2d3a]/60 p-2 sm:p-4 transition-all duration-500">
            <TabGroup />
            <div className="mt-5">
              {/* Animate tab panels */}
              <TabPanel active>
                {/* Overview */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <CardAnimated delay={0.18}>
                    <WeeklyStudyHoursChart
                      data={[
                        { day: "Mon", hours: 2 },
                        { day: "Tue", hours: 3 },
                        { day: "Wed", hours: 1 },
                        { day: "Thu", hours: 4 },
                        { day: "Fri", hours: 2 },
                        { day: "Sat", hours: 5 },
                        { day: "Sun", hours: 3 },
                      ]}
                      isLoading={loading}
                    />
                  </CardAnimated>
                  <CardAnimated delay={0.22}>
                    <MonthlyProgressChart
                      data={[
                        { name: "Week 1", hours: 10 },
                        { name: "Week 2", hours: 15 },
                        { name: "Week 3", hours: 12 },
                        { name: "Week 4", hours: 20 },
                      ]}
                      isLoading={loading}
                    />
                  </CardAnimated>
                </div>
              </TabPanel>
              <TabPanel>
                {/* Materials */}
                <CardAnimated delay={0.25}>
                  <MaterialProgressCard name="Current Study Materials" progress={75} />
                </CardAnimated>
              </TabPanel>
              <TabPanel>
                {/* Insights */}
                <CardAnimated delay={0.28}>
                  <LearningInsightCard
                    icon={
                      <span className="bg-gradient-to-br from-pink-400 via-[#4834D4] to-green-400 rounded-full p-2 shadow-lg">
                        <Brain className="h-7 w-7 text-white animate-pulse" />
                      </span>
                    }
                    title="Learning Progress"
                    value="85%"
                    description="You're making great progress!"
                  />
                </CardAnimated>
              </TabPanel>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

// StatCard: beautiful animated card for main stats
function StatCard({
  title,
  value,
  icon,
  gradient,
  delay = 0,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}) {
  return (
    <div
      className={`group snap-center min-w-[210px] bg-gradient-to-br ${gradient} rounded-2xl p-5 flex flex-col items-start justify-between shadow-xl
        hover:scale-105 hover:shadow-2xl hover:z-10 transition-all duration-300 cursor-pointer relative
        backdrop-blur-lg border border-white/10
        animate-fade-in-up`}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: "both",
      }}
    >
      <span className="mb-3">{icon}</span>
      <div>
        <div className="text-2xl font-bold text-white drop-shadow">{value}</div>
        <div className="text-xs font-medium text-white/70 mt-1">{title}</div>
      </div>
      <div className="absolute right-2 top-2 opacity-20 text-6xl pointer-events-none select-none">{icon}</div>
    </div>
  );
}

// Animate Card
function CardAnimated({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-[#13131F]/80 to-[#26264F]/60 shadow-lg p-4 sm:p-6 animate-fade-in-up"
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}

// Tab logic (simplified, can be extended)
function TabGroup() {
  const [active, setActive] = useState(0);
  const tabs = [
    { label: "Overview" },
    { label: "Materials" },
    { label: "Insights" },
  ];
  return (
    <div className="flex justify-center gap-2 mb-1">
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          onClick={() => setActive(idx)}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 
            ${
              active === idx
                ? "bg-gradient-to-r from-purple-500 to-green-400 text-white shadow ring-2 ring-purple-200 scale-105"
                : "bg-[#1a1a1a99] text-purple-100 hover:bg-purple-800/30"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
      {/* Animated underline */}
      <div
        className="absolute mt-[38px] left-0 h-1 w-full transition-all duration-300"
        style={{
          transform: `translateX(${active * 105}px)`,
        }}
      ></div>
    </div>
  );
}

// TabPanel: show only if the tab is active (to be replaced by actual tab logic if desired)
function TabPanel({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  // For demo: show all panels, hide by default, only show active
  // You may wish to enhance this for actual tab logic.
  return <div className={active ? "block animate-fade-in-up" : "hidden"}>{children}</div>;
}

// Animations (add these to your global CSS or Tailwind config)
// In your tailwind.config.js, extend animation & keyframes:
///   animation: {
///     'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.39, 0.575, 0.565, 1) both',
///     'bounce-slow': 'bounce 2.5s infinite',
///   },
///   keyframes: {
///     fadeInUp: {
///       '0%': { opacity: '0', transform: 'translateY(40px)' },
///       '100%': { opacity: '1', transform: 'translateY(0)' },
///     },
///   },
// If you use tailwindcss-animate or similar, you may already have fadeInUp.

// Hide scrollbar for horizontal scroll area (add to your global CSS)
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

export default Progress;
