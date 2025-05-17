
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  ScrollText
} from "lucide-react";
import AITutor from "@/components/features/AITutor";
import ProgressDashboard from "@/components/features/ProgressDashboard";
import StudyModes from "@/components/features/StudyModes";

const Dashboard = () => {
  const navigate = useNavigate();
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
      { type: "chat", name: "Asked about cognitive biases", time: "Yesterday" }
    ],
    bookmarks: [
      { type: "note", name: "Chapter 4 Summary", id: "note1" },
      { type: "chat", name: "AI explanation of quantum physics", id: "chat1" }
    ]
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Check if user is online
    const handleOnlineStatusChange = () => {
      if (!navigator.onLine) {
        toast({
          title: "You are offline",
          description: "Some features may not work while you're offline.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [toast]);
  
  const handleUpload = () => {
    setLoading(prev => ({ ...prev, upload: true }));
    // Simulate upload processing
    setTimeout(() => {
      setLoading(prev => ({ ...prev, upload: false }));
      navigate('/library');
    }, 800);
  };
  
  const handleChat = () => {
    setLoading(prev => ({ ...prev, chat: true }));
    // Navigate to chat page
    setTimeout(() => {
      setLoading(prev => ({ ...prev, chat: false }));
      navigate('/chat');
    }, 400);
  };
  
  const handleFeatureClick = (path) => {
    navigate(path);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-6 px-4 space-y-8 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Welcome Section - Improved spacing and mobile layout */}
          <section className="rounded-xl bg-gradient-to-br from-spark-light via-white to-spark-blue p-6 dark:from-spark-primary/10 dark:via-background dark:to-spark-secondary/10">
            <div className="animate-fade-in space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground">
                Ready to continue your learning journey today?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleUpload}
                  disabled={loading.upload}
                  className="w-full sm:w-auto button-click-effect"
                >
                  {loading.upload ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Material
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto button-click-effect dark:border-muted dark:bg-muted dark:text-foreground"
                  onClick={handleChat}
                  disabled={loading.chat}
                >
                  {loading.chat ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Opening...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat with AI Tutor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Main Features Grid - Better organization and spacing */}
          <section className="py-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold">Study Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div onClick={() => handleFeatureClick('/chat')} className="cursor-pointer">
                <StudyFeatureCard 
                  title="AI Study Tutor"
                  description="Get personalized help with any topic"
                  icon={<MessageSquare className="h-6 w-6 text-white" />}
                  href="/chat"
                  color="bg-spark-primary"
                />
              </div>
              <div onClick={() => handleFeatureClick('/flashcards')} className="cursor-pointer">
                <StudyFeatureCard 
                  title="Flashcards"
                  description="Review key concepts effectively"
                  icon={<BookOpen className="h-6 w-6 text-white" />}
                  href="/flashcards"
                  color="bg-spark-secondary"
                />
              </div>
              <div onClick={() => handleFeatureClick('/quiz')} className="cursor-pointer">
                <StudyFeatureCard 
                  title="Quizzes"
                  description="Test your understanding"
                  icon={<ListChecks className="h-6 w-6 text-white" />}
                  href="/quiz"
                  color="bg-blue-500"
                />
              </div>
              <div onClick={() => handleFeatureClick('/summaries')} className="cursor-pointer">
                <StudyFeatureCard 
                  title="Summaries"
                  description="Get quick topic overviews"
                  icon={<ScrollText className="h-6 w-6 text-white" />}
                  href="/summaries"
                  color="bg-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Progress and AI Chat Section - Improved layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Tutor Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-semibold">AI Study Tutor</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="button-click-effect dark:border-muted dark:bg-muted"
                  onClick={() => navigate('/chat')}
                >
                  Open Full Chat
                </Button>
              </div>
              <Card className="border dark:border-muted">
                <CardContent className="p-4">
                  <div className="h-[350px] overflow-hidden">
                    <AITutor />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Progress Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-semibold">Your Progress</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="button-click-effect dark:border-muted dark:bg-muted"
                  onClick={() => navigate('/progress')}
                >
                  See Detailed Progress
                </Button>
              </div>
              <Card className="border dark:border-muted">
                <CardContent className="p-4">
                  <ProgressDashboard />
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Recent Activity - Simplified and cleaner */}
          <section className="py-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(2).fill(null).map((_, i) => (
                  <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
                ))
              ) : (
                user.recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

// Enhanced Feature Card Component with better hover effects
const StudyFeatureCard = ({ title, description, icon, href, color }) => (
  <Card className="h-full border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 dark:bg-card">
    <div className={`${color} p-6 flex justify-center`}>
      <div className="p-3 rounded-full bg-white/20 transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <CardContent className="p-4 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Improved Activity Item Component
const ActivityItem = ({ activity }) => (
  <Card className="transition-all duration-300 hover:shadow-md dark:bg-card">
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`p-2 rounded-full ${
        activity.type === 'file' ? 'bg-spark-blue' : 'bg-spark-peach'
      }`}>
        {activity.type === 'file' ? (
          <FileText className="h-4 w-4 text-blue-600" />
        ) : (
          <MessageSquare className="h-4 w-4 text-orange-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{activity.name}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{activity.time}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
