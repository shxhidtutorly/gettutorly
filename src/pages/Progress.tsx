import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, useInView, useSpring } from "framer-motion";
import { TrendingUp, Calendar, Target, Award, Brain, BarChart3, Activity, CheckCircle } from "lucide-react";
import React from "react";

// Assuming your firebase config is in this path
// You might need to adjust the import path for 'auth'
import { auth } from "@/lib/firebase"; 

// Custom hooks provided by you (as mentioned in the prompt)
import { useUserStats } from "@/hooks/useUserStats";
import { useProgressData } from "@/hooks/useProgressData";

// --- START: BUILT-IN COMPONENTS ---
// To satisfy the "no imported components" rule, we define them here.

const Navbar = () => (
  <header className="bg-black border-b-2 border-gray-800 p-4">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-xl font-black text-white">StudyAI</h1>
      <div className="text-white">User Profile</div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-black border-t-2 border-gray-800 p-4 mt-auto">
    <div className="container mx-auto text-center text-gray-500">
      &copy; 2025 StudyAI. All Rights Reserved.
    </div>
  </footer>
);

const BottomNav = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-gray-800 p-2 flex justify-around">
    {/* Placeholder for bottom nav icons */}
    <div className="text-white">Home</div>
    <div className="text-cyan-400 font-bold">Progress</div>
    <div className="text-white">Profile</div>
  </div>
);

// Animated Counter for Stats
const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, isInView, value]);

  return <motion.span ref={ref}>{spring.to((val) => Math.round(val).toLocaleString())}</motion.span>;
};

// Brutalist Card Wrapper
const BrutalistCard = ({ children, className = '', color = 'gray', hoverable = false }: { children: React.ReactNode; className?: string; color?: 'cyan' | 'pink' | 'yellow' | 'green' | 'gray'; hoverable?: boolean }) => {
  const colorClasses = {
    cyan: 'border-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
    pink: 'border-pink-500 shadow-[4px_4px_0px_#ec4899]',
    yellow: 'border-yellow-400 shadow-[4px_4px_0px_#facc15]',
    green: 'border-green-400 shadow-[4px_4px_0px_#22c55e]',
    gray: 'border-gray-600',
  };

  return (
    <motion.div
      whileHover={hoverable ? { x: -4, y: -4, boxShadow: `8px 8px 0px #${{cyan: '00f7ff', pink: 'ec4899', yellow: 'facc15', green: '22c55e', gray: '6b7280'}[color]}` } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-[#111] border-2 p-4 sm:p-6 ${colorClasses[color]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Stat Card for the top overview
const ProgressStatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: 'cyan' | 'pink' | 'yellow' | 'green' }) => (
  <BrutalistCard color={color} hoverable={true}>
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase text-gray-400">{title}</h3>
      <div className={`text-${color}-400`}>{icon}</div>
    </div>
    <p className="text-4xl font-black text-white mt-2">
      <AnimatedCounter value={value} />
    </p>
  </BrutalistCard>
);

// Animated Progress Bar
const AnimatedProgressBar = ({ progress, color }: { progress: number; color: 'cyan' | 'pink' | 'yellow' | 'green' }) => {
  const colorClasses = {
    cyan: 'bg-cyan-400',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
  };

  return (
    <div className="w-full bg-gray-700 border-2 border-gray-600 h-6 p-1">
      <motion.div
        className={`h-full ${colorClasses[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "circOut" }}
      />
    </div>
  );
};


// Simulated Bar Chart (as we can't import a charting library)
const SimulatedBarChart = ({ data, color, title, dataKey, labelKey }: { data: any[]; color: 'cyan' | 'pink'; title: string; dataKey: string; labelKey: string }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const maxValue = Math.max(...data.map(d => d[dataKey]), 1);

  return (
    <BrutalistCard color="gray" className="flex flex-col h-full">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5"/> {title}</h3>
      <div ref={ref} className="flex-grow flex items-end justify-around gap-2 pt-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              className={`w-full ${color === 'cyan' ? 'bg-cyan-400' : 'bg-pink-500'}`}
              initial={{ height: '0%' }}
              animate={isInView ? { height: `${(item[dataKey] / maxValue) * 100}%` } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
            />
            <span className="text-xs text-gray-400 font-bold">{item[labelKey]}</span>
          </div>
        ))}
      </div>
    </BrutalistCard>
  );
};

// --- END: BUILT-IN COMPONENTS ---


const Progress = () => {
  const [user, authLoading] = useAuthState(auth);
  
  // Use the custom hooks
  const { stats, loading: statsLoading } = useUserStats(user?.uid);
  const { weeklyData, monthlyData, progressData, loading: dataLoading } = useProgressData(user?.uid);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'insights'>('overview');

  const isLoading = authLoading || statsLoading || dataLoading;

  // Combining stats for "Total Created"
  const totalCreated = (stats?.summaries_created || 0) +
    (stats?.notes_created || 0) +
    (stats?.quizzes_taken || 0) +
    (stats?.flashcards_created || 0);

  const tabs = [
    { id: 'overview', label: 'Overview', color: 'cyan' },
    { id: 'materials', label: 'Materials', color: 'pink' },
    { id: 'insights', label: 'Insights', color: 'yellow' },
  ] as const;


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-gray-600 border-l-gray-600 mx-auto mb-4"
          ></motion.div>
          <p className="text-lg tracking-widest">ANALYZING PROGRESS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
             <div className="text-center p-8 border-2 border-yellow-400 shadow-[4px_4px_0px_#facc15]">
                <h2 className="text-2xl font-black mb-2">ACCESS DENIED</h2>
                <p>Please log in to view your progress.</p>
             </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3 text-shadow-green">
              <TrendingUp className="h-10 w-10 text-green-400" />
              Learning Progress
            </h1>
            <p className="text-gray-400">Your digital brain's performance metrics.</p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <ProgressStatCard title="Total Creations" value={totalCreated} icon={<Calendar className="h-6 w-6" />} color="cyan" />
            <ProgressStatCard title="Notes Mastered" value={stats?.notes_created || 0} icon={<Target className="h-6 w-6" />} color="pink" />
            <ProgressStatCard title="Quizzes Aced" value={stats?.quizzes_taken || 0} icon={<Award className="h-6 w-6" />} color="yellow" />
            <ProgressStatCard title="Hours Invested" value={Math.round((stats?.total_study_time || 0) / 60)} icon={<Activity className="h-6 w-6" />} color="green" />
          </div>

          {/* Brutalist Tabs */}
          <div className="mb-8">
            <div className="flex border-2 border-b-0 border-gray-600">
              {tabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 p-3 font-bold text-sm uppercase tracking-wider transition-all duration-200
                      ${activeTab === tab.id 
                        ? `bg-${tab.color}-400 text-black border-b-4 border-${tab.color}-400` 
                        : 'bg-black text-white hover:bg-gray-800'
                      }`}
                  >
                    {tab.label}
                  </button>
              ))}
            </div>
            
            <div className="p-6 border-2 border-gray-600 bg-[#111]">
               {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Fallback to sample data if hook returns empty/null */}
                    <SimulatedBarChart 
                      title="Weekly Study Hours" 
                      data={weeklyData?.length ? weeklyData : sampleWeeklyData} 
                      color="cyan"
                      dataKey="hours"
                      labelKey="day"
                    />
                    <SimulatedBarChart 
                      title="Monthly Content Created" 
                      data={monthlyData?.length ? monthlyData : sampleMonthlyData}
                      color="pink"
                      dataKey="count"
                      labelKey="month"
                    />
                </motion.div>
               )}
               {activeTab === 'materials' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <h3 className="text-lg font-bold text-white mb-2">Study Materials Progress</h3>
                     <p className="text-gray-400 mb-4">Your completion rate across all generated materials.</p>
                     <div className="flex items-center gap-4">
                        <AnimatedProgressBar progress={progressData?.materialsProgress || 0} color="pink"/>
                        <span className="text-xl font-black text-pink-400">{progressData?.materialsProgress || 0}%</span>
                     </div>
                  </motion.div>
               )}
               {activeTab === 'insights' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <BrutalistCard color="yellow" className="text-center">
                          <Brain className="h-10 w-10 mx-auto text-yellow-400 mb-2"/>
                          <h3 className="text-sm font-bold uppercase text-gray-400">Learning Streak</h3>
                          <p className="text-4xl font-black text-white">{progressData?.streak || 0} days</p>
                          <p className="text-yellow-400 text-sm mt-2">Consistency is key!</p>
                      </BrutalistCard>
                      <BrutalistCard color="green" className="text-center">
                          <CheckCircle className="h-10 w-10 mx-auto text-green-400 mb-2"/>
                          <h3 className="text-sm font-bold uppercase text-gray-400">Weekly Goal</h3>
                          <p className="text-4xl font-black text-white">{progressData?.weeklyProgress || 0}%</p>
                          <p className="text-green-400 text-sm mt-2">You're smashing your targets!</p>
                      </BrutalistCard>
                  </motion.div>
               )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

// --- Mock Data for UI Testing ---
// This is used as a fallback in case your hooks don't return data yet.
const sampleWeeklyData = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 3 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 4 },
  { day: 'Fri', hours: 2.5 },
  { day: 'Sat', hours: 5 },
  { day: 'Sun', hours: 1 },
];

const sampleMonthlyData = [
    { month: 'Apr', count: 20 },
    { month: 'May', count: 45 },
    { month: 'Jun', count: 30 },
    { month: 'Jul', count: 60 },
    { month: 'Aug', count: 55 },
];


export default Progress;
