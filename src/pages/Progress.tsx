import { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { TrendingUp, Calendar, Target, Award, Brain, BarChart3, Activity, CheckCircle } from "lucide-react";
import React from "react";

// --- IMPORTANT ---
// Make sure this path is correct for your project structure
import { auth } from "@/lib/firebase"; 

// Your custom hooks (no changes needed here)
import { useUserStats } from "@/hooks/useUserStats";
import { useProgressData } from "@/hooks/useProgressData";


// --- START: BUILT-IN COMPONENTS (RE-THEMED & FIXED) ---

const Navbar = () => (
    <header className="bg-black border-b-2 border-[#181818] p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black text-white">TUTORLY</h1>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-black border-t-2 border-[#181818] p-4 mt-auto">
        <div className="container mx-auto text-center text-gray-600 text-sm">
            &copy; 2025 Tutorly. Supercharge Your Learning.
        </div>
    </footer>
);

const BottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-[#181818] p-2 flex justify-around">
        <div className="text-gray-400">Dashboard</div>
        <div className="text-[#00f7ff] font-bold">Progress</div>
        <div className="text-gray-400">Profile</div>
    </div>
);

const AnimatedCounter = ({ value }: { value: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const spring = useSpring(0, { stiffness: 100, damping: 20 });
    const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [spring, isInView, value]);

    return <motion.span ref={ref}>{display}</motion.span>;
};

// --- MAJOR FIX & REFACTOR ---
// This component is now written correctly to avoid the crash.
const BrutalistCard = ({ children, className = '', color = 'cyan' }: { children: React.ReactNode; className?: string; color?: 'cyan' | 'pink' | 'yellow' | 'green' }) => {
    // Define explicit CSS values instead of Tailwind classes for animation
    const colorStyles = {
        cyan:   { borderColor: '#00f7ff', boxShadow: '4px 4px 0px #00f7ff' },
        pink:   { borderColor: '#f40099', boxShadow: '4px 4px 0px #f40099' },
        yellow: { borderColor: '#facc15', boxShadow: '4px 4px 0px #facc15' },
        green:  { borderColor: '#22c55e', boxShadow: '4px 4px 0px #22c55e' },
    };
    
    const styles = colorStyles[color];

    return (
        <motion.div
            initial={{ boxShadow: styles.boxShadow }}
            whileHover={{ boxShadow: '0px 0px 0px #00000000' }} // Animate to a transparent shadow
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            // Use inline styles for dynamic properties
            style={{ borderColor: styles.borderColor }}
            // Static classes remain in className
            className={`bg-[#181818] border-2 p-4 sm:p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
};


const ProgressStatCard = ({ title, value, icon, color, unit = '' }: { title: string; value: number; icon: React.ReactNode; color: 'cyan' | 'pink' | 'yellow' | 'green'; unit?: string; }) => {
    const colorClasses = {
        cyan: 'text-[#00f7ff]',
        pink: 'text-[#f40099]',
        yellow: 'text-yellow-400',
        green: 'text-green-400',
    };

    return (
        <BrutalistCard color={color}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">{title}</h3>
                    <p className="text-4xl font-black text-white">
                        <AnimatedCounter value={value} />{unit}
                    </p>
                </div>
                <div className={colorClasses[color]}>{icon}</div>
            </div>
        </BrutalistCard>
    );
};

const AnimatedProgressBar = ({ progress, color }: { progress: number; color: 'cyan' | 'pink' | 'yellow' | 'green' }) => {
    const colorClasses = {
      cyan: 'bg-[#00f7ff]',
      pink: 'bg-[#f40099]',
      yellow: 'bg-yellow-400',
      green: 'bg-green-400',
    };
    return (
      <div className="w-full bg-black border-2 border-gray-700 h-4 p-0.5">
        <motion.div
          className={`h-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "circOut" }}
        />
      </div>
    );
};

const SimulatedBarChart = ({ data, color, title, dataKey, labelKey }: { data: any[]; color: 'cyan' | 'pink'; title: string; dataKey: string; labelKey: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const maxValue = Math.max(...data.map(d => d[dataKey]), 1);
    const bgColor = color === 'cyan' ? 'bg-[#00f7ff]' : 'bg-[#f40099]';

    return (
      <div className="bg-[#181818] border-2 border-gray-800 p-4 flex flex-col h-full">
        <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5"/> {title}</h3>
        <div ref={ref} className="flex-grow flex items-end justify-around gap-2 pt-4">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className={`w-full ${bgColor}`}
                initial={{ height: '0%' }}
                animate={isInView ? { height: `${(item[dataKey] / maxValue) * 100}%` } : {}}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
              />
              <span className="text-xs text-gray-400 font-bold">{item[labelKey]}</span>
            </div>
          ))}
        </div>
      </div>
    );
};

// --- Main Progress Component (No changes needed here) ---

const Progress = () => {
    const [user, authLoading] = useAuthState(auth);
    const { stats, loading: statsLoading } = useUserStats(user?.uid);
    const { progressData, loading: dataLoading, weeklyData, monthlyData } = useProgressData(user?.uid);
    const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'insights'>('overview');

    const isLoading = authLoading || statsLoading || dataLoading;

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
                        className="h-10 w-10 border-4 border-t-[#00f7ff] border-r-[#00f7ff] border-b-gray-800 border-l-gray-800 mx-auto mb-4"
                    ></motion.div>
                    <p className="text-lg tracking-widest">ANALYZING PROGRESS...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono p-4">
                 <BrutalistCard color="yellow">
                    <h2 className="text-2xl font-black mb-2 text-center">ACCESS DENIED</h2>
                    <p className="text-gray-300 text-center">Please log in to track your learning journey.</p>
                 </BrutalistCard>
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
                        <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
                            <TrendingUp className="h-10 w-10 text-[#00f7ff]" />
                            Learning Progress
                        </h1>
                        <p className="text-gray-400">Track your learning journey and achievements.</p>
                    </motion.div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <ProgressStatCard title="Total Creations" value={totalCreated} icon={<Calendar className="h-6 w-6" />} color="cyan" />
                        <ProgressStatCard title="Notes Mastered" value={stats?.notes_created || 0} icon={<Target className="h-6 w-6" />} color="pink" />
                        <ProgressStatCard title="Quizzes Aced" value={stats?.quizzes_taken || 0} icon={<Award className="h-6 w-6" />} color="yellow" />
                        <ProgressStatCard title="Hours Invested" value={Math.round((stats?.total_study_time || 0) / 60)} icon={<Activity className="h-6 w-6" />} color="green" />
                    </div>

                    <div className="mb-8">
                        <div className="flex border-2 border-b-0 border-gray-800">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 p-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 focus:outline-none ${activeTab === tab.id ? `bg-[#00f7ff] text-black` : 'bg-black text-white hover:bg-gray-900'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-6 border-2 border-gray-800 bg-[#111]">
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                    <SimulatedBarChart data={weeklyData || sampleWeeklyData} title="Weekly Study Hours" color="cyan" dataKey="hours" labelKey="day" />
                                    <SimulatedBarChart data={monthlyData || sampleMonthlyData} title="Monthly Content Created" color="pink" dataKey="count" labelKey="month" />
                                </motion.div>
                            )}
                            {activeTab === 'materials' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h3 className="text-lg font-bold text-white mb-2">Study Materials Progress</h3>
                                    <p className="text-gray-400 mb-4">Your completion rate across all generated materials.</p>
                                    <div className="flex items-center gap-4">
                                        <AnimatedProgressBar progress={progressData?.materialsProgress || 0} color="pink"/>
                                        <span className="text-xl font-black text-[#f40099]">{progressData?.materialsProgress || 0}%</span>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'insights' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                    <BrutalistCard color="yellow" className="text-center">
                                        <Brain className="h-10 w-10 mx-auto text-yellow-400 mb-2"/>
                                        <h3 className="text-sm font-bold uppercase text-gray-400">Learning Streak</h3>
                                        <p className="text-4xl font-black text-white">{progressData?.streak || 0} days</p>
                                    </BrutalistCard>
                                    <BrutalistCard color="green" className="text-center">
                                        <CheckCircle className="h-10 w-10 mx-auto text-green-400 mb-2"/>
                                        <h3 className="text-sm font-bold uppercase text-gray-400">Weekly Goal</h3>
                                        <p className="text-4xl font-black text-white">{progressData?.weeklyProgress || 0}%</p>
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

// Fallback data for UI testing if hooks return empty
const sampleWeeklyData = [{ day: 'Mon', hours: 2 }, { day: 'Tue', hours: 3 }, { day: 'Wed', hours: 1.5 }, { day: 'Thu', hours: 4 }, { day: 'Fri', hours: 2.5 }, { day: 'Sat', hours: 5 }, { day: 'Sun', hours: 1 }];
const sampleMonthlyData = [{ month: 'Apr', count: 20 }, { month: 'May', count: 45 }, { month: 'Jun', count: 30 }, { month: 'Jul', count: 60 }, { month: 'Aug', count: 55 }];

export default Progress;
