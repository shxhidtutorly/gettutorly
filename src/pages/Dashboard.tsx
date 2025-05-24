import { useState, useEffect } from "react";
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  User, 
  BookOpenText,
  BarChart3, 
  Upload, 
  Clock,
  Bookmark,
  Zap,
  FlaskConical,
  ListChecks,
  ScrollText,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  Activity,
  Star
} from "lucide-react";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState({
    upload: false,
    chat: false
  });
  const [user, setUser] = useState({
    name: "Alex Johnson",
    filesUploaded: 5,
    chatsUsed: 12,
    recentActivity: [
      { type: "file", name: "Psychology 101 Notes", time: "2 hours ago" },
      { type: "chat", name: "Asked about cognitive biases", time: "Yesterday" },
      { type: "quiz", name: "Completed Physics Quiz", time: "2 days ago" },
      { type: "flashcard", name: "Reviewed Math Formulas", time: "3 days ago" }
    ],
    bookmarks: [
      { type: "note", name: "Chapter 4 Summary", id: "note1" },
      { type: "chat", name: "AI explanation of quantum physics", id: "chat1" }
    ],
    stats: {
      studyStreak: 7,
      totalHours: 24,
      completedQuizzes: 12,
      avgScore: 89
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleUpload = () => {
    setLoading(prev => ({ ...prev, upload: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, upload: false }));
      // navigate('/library');
    }, 1200);
  };

  const handleChat = () => {
    setLoading(prev => ({ ...prev, chat: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, chat: false }));
      // navigate('/chat');
    }, 800);
  };

  const handleFeatureClick = (path) => {
    console.log(`Navigating to ${path}`);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyAI
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 pb-20">
        {/* Welcome Section */}
        <section className="animate-slide-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold animate-fade-in">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-blue-100 text-lg animate-fade-in-delay-1">
                  Ready to continue your learning journey today?
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-delay-2">
                <StatCard icon={<Zap />} value={user.stats.studyStreak} label="Day Streak" />
                <StatCard icon={<Clock />} value={`${user.stats.totalHours}h`} label="Study Time" />
                <StatCard icon={<Award />} value={user.stats.completedQuizzes} label="Quizzes" />
                <StatCard icon={<Star />} value={`${user.stats.avgScore}%`} label="Avg Score" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-3">
                <button 
                  onClick={handleUpload}
                  disabled={loading.upload}
                  className="group flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-4 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50"
                >
                  {loading.upload ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Upload New Material
                    </div>
                  )}
                </button>
                <button 
                  onClick={handleChat}
                  disabled={loading.chat}
                  className="group flex-1 bg-white text-purple-600 hover:bg-gray-50 rounded-xl px-6 py-4 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50"
                >
                  {loading.chat ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                      Opening...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Chat with AI Tutor
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Study Tools Grid */}
        <section className="space-y-6 animate-slide-up-delay-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Study Tools
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Choose your learning method
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StudyFeatureCard 
              title="AI Study Tutor"
              description="Get personalized help with any topic"
              icon={<MessageSquare className="w-6 h-6" />}
              onClick={() => handleFeatureClick('/chat')}
              gradient="from-blue-500 to-cyan-500"
              delay="0"
            />
            <StudyFeatureCard 
              title="Flashcards"
              description="Review key concepts effectively"
              icon={<BookOpen className="w-6 h-6" />}
              onClick={() => handleFeatureClick('/flashcards')}
              gradient="from-green-500 to-emerald-500"
              delay="100"
            />
            <StudyFeatureCard 
              title="Quizzes"
              description="Test your understanding"
              icon={<ListChecks className="w-6 h-6" />}
              onClick={() => handleFeatureClick('/quiz')}
              gradient="from-orange-500 to-red-500"
              delay="200"
            />
            <StudyFeatureCard 
              title="Summaries"
              description="Get quick topic overviews"
              icon={<ScrollText className="w-6 h-6" />}
              onClick={() => handleFeatureClick('/summaries')}
              gradient="from-purple-500 to-pink-500"
              delay="300"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Chat Section */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up-delay-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Study Session
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors">
                Open Full Chat <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              <div className="p-6">
                <AITutorPreview />
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-6 animate-slide-up-delay-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Progress
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              <div className="p-6">
                <ProgressPreview stats={user.stats} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <section className="space-y-6 animate-slide-up-delay-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} index={index} />
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: BookOpen, label: 'Study' },
            { icon: MessageSquare, label: 'Chat' },
            { icon: BarChart3, label: 'Progress' },
            { icon: User, label: 'Profile' }
          ].map((item, index) => (
            <button key={index} className="flex flex-col items-center gap-1 py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, value, label }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
    <div className="flex justify-center mb-2 text-white/90">
      {icon}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-blue-100">{label}</div>
  </div>
);

// Enhanced Feature Card Component
const StudyFeatureCard = ({ title, description, icon, onClick, gradient, delay }) => (
  <div 
    className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-fade-in-delay-${delay}`}
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className={`bg-gradient-to-r ${gradient} p-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="relative z-10 flex justify-center text-white">
          <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </div>
      <div className="p-6 text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

// AI Tutor Preview Component
const AITutorPreview = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <MessageSquare className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Study Assistant</h3>
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </p>
      </div>
    </div>
    
    <div className="space-y-3 max-h-64 overflow-y-auto">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-3 max-w-xs animate-slide-in-left">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Hi! I'm here to help you study. What would you like to learn about today?
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl rounded-tr-sm p-3 max-w-xs animate-slide-in-right">
          <p className="text-sm">
            Can you help me understand quantum physics?
          </p>
        </div>
      </div>
    </div>
    
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Type your question..."
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:scale-105 transition-transform">
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// Progress Preview Component
const ProgressPreview = ({ stats }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 18 2.0845"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 18 2.0845"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray={`${stats.avgScore}, 100`}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Overall Performance</p>
    </div>
    
    <div className="space-y-3">
      <ProgressItem icon={<TrendingUp />} label="Study Streak" value={`${stats.studyStreak} days`} />
      <ProgressItem icon={<Clock />} label="Total Hours" value={`${stats.totalHours}h`} />
      <ProgressItem icon={<Award />} label="Completed Quizzes" value={stats.completedQuizzes} />
    </div>
  </div>
);

// Progress Item Component
const ProgressItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
  </div>
);

// Enhanced Activity Item Component
const ActivityItem = ({ activity, index }) => {
  const getActivityIcon = (type) => {
    const iconProps = { className: "w-4 h-4 text-white" };
    switch (type) {
      case 'file': return <FileText {...iconProps} />;
      case 'chat': return <MessageSquare {...iconProps} />;
      case 'quiz': return <ListChecks {...iconProps} />;
      case 'flashcard': return <BookOpen {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'file': return 'from-blue-500 to-cyan-500';
      case 'chat': return 'from-green-500 to-emerald-500';
      case 'quiz': return 'from-orange-500 to-red-500';
      case 'flashcard': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {activity.name}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            <span>{activity.time}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>
    </div>
  );
};

// Add custom CSS for animations
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
  
  .animate-fade-in-delay-1 {
    animation: fade-in 0.8s ease-out 0.2s both;
  }
  
  .animate-fade-in-delay-2 {
    animation: fade-in 0.8s ease-out 0.4s both;
  }
  
  .animate-fade-in-delay-3 {
    animation: fade-in 0.8s ease-out 0.6s both;
  }
  
  .animate-slide-up {
    animation: slide-up 0.8s ease-out;
  }
  
  .animate-slide-up-delay-1 {
    animation: slide-up 0.8s ease-out 0.2s both;
  }
  
  .animate-slide-up-delay-2 {
    animation: slide-up 0.8s ease-out 0.4s both;
  }
  
  .animate-slide-up-delay-3 {
    animation: slide-up 0.8s ease-out 0.6s both;
  }
  
  .animate-slide-up-delay-4 {
    animation: slide-up 0.8s ease-out 0.8s both;
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.6s ease-out;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.6s ease-out;
  }
  
  .animate-slide-in-up {
    animation: slide-in-up 0.6s ease-out both;
  }
  
  .animate-fade-in-delay-0 {
    animation: fade-in 0.8s ease-out 0s both;
  }
  
  .animate-fade-in-delay-100 {
    animation: fade-in 0.8s ease-out 0.1s both;
  }
  
  .animate-fade-in-delay-200 {
    animation: fade-in 0.8s ease-out 0.2s both;
  }
  
  .animate-fade-in-delay-300 {
    animation: fade-in 0.8s ease-out 0.3s both;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Dashboard;