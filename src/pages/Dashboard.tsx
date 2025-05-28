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
  ScrollText,
  TrendingUp,
  Award,
  ChevronRight,
  Activity,
  Star,
  Target,
  Calendar
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
      { type: "quiz", name: "Completed Biology quiz", time: "2h ago" },
      { type: "flashcard", name: "Created 12 new flashcards", time: "Yesterday" },
      { type: "file", name: "Psychology 101 Notes", time: "2 days ago" },
      { type: "chat", name: "Asked about cognitive biases", time: "3 days ago" }
    ],
    bookmarks: [
      { type: "note", name: "Chapter 4 Summary", id: "note1" },
      { type: "chat", name: "AI explanation of quantum physics", id: "chat1" }
    ],
    stats: {
      dailyStreak: 7,
      conceptsMastered: 24,
      studyTime: 4.5,
      quizAccuracy: 86
    },
    goals: [
      { subject: "Biology 101 - Chapter 4", progress: 75 },
      { subject: "Chemistry - Periodic Table", progress: 40 },
      { subject: "History - World War II", progress: 90 }
    ]
  });

  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
    setTimeout(() => {
      setLoading(prev => ({ ...prev, upload: false }));
      navigate('/library');
    }, 800);
  };

  const handleChat = () => {
    setLoading(prev => ({ ...prev, chat: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, chat: false }));
      navigate('/chat');
    }, 400);
  };

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-6 px-4 space-y-6 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          {/* Welcome Section */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border border-border/50 p-6 md:p-8">
            <div className="relative z-10 space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  Ready to continue your learning journey today?
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleUpload}
                  disabled={loading.upload}
                  className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105"
                  size="lg"
                >
                  {loading.upload ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
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
                  className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105"
                  onClick={handleChat}
                  disabled={loading.chat}
                  size="lg"
                >
                  {loading.chat ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2"></div>
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

          {/* Study Tools Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Study Tools
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StudyFeatureCard 
                title="AI Study Tutor"
                description="Get personalized help with any topic"
                icon={<MessageSquare className="h-6 w-6 text-white" />}
                onClick={() => handleFeatureClick('/chat')}
                gradient="from-purple-500 to-purple-600"
              />
              <StudyFeatureCard 
                title="Flashcards"
                description="Review key concepts effectively"
                icon={<BookOpen className="h-6 w-6 text-white" />}
                onClick={() => handleFeatureClick('/flashcards')}
                gradient="from-purple-400 to-purple-500"
              />
              <StudyFeatureCard 
                title="Quizzes"
                description="Test your understanding"
                icon={<ListChecks className="h-6 w-6 text-white" />}
                onClick={() => handleFeatureClick('/quiz')}
                gradient="from-blue-500 to-blue-600"
              />
              <StudyFeatureCard 
                title="Summaries"
                description="Get quick topic overviews"
                icon={<ScrollText className="h-6 w-6 text-white" />}
                onClick={() => handleFeatureClick('/summaries')}
                gradient="from-purple-500 to-pink-500"
              />
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Study Tutor Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">AI Study Tutor</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/chat')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Open Full Chat
                </Button>
              </div>
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">AI Study Tutor</h3>
                        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Beta
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Hello! I'm your AI Study Tutor. How can I help you understand your material better today?
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="text-xs" onClick={() => navigate('/chat')}>
                          Chat
                        </Button>
                        <Button size="sm" variant="secondary" className="text-xs" onClick={() => navigate('/quiz')}>
                          Quiz Me
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Progress Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Your Progress</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/progress')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  See Detailed Progress
                </Button>
              </div>
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="font-medium text-foreground mb-4">Your Progress</h3>
                      <p className="text-sm text-muted-foreground mb-4">Track your learning journey</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-lg font-bold text-foreground">{user.stats.dailyStreak}</div>
                        <div className="text-xs text-muted-foreground">Daily Streak</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-lg font-bold text-foreground">{user.stats.conceptsMastered}</div>
                        <div className="text-xs text-muted-foreground">Concepts Mastered</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-lg font-bold text-foreground">{user.stats.studyTime} hrs</div>
                        <div className="text-xs text-muted-foreground">Study Time</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-lg font-bold text-foreground">{user.stats.quizAccuracy}%</div>
                        <div className="text-xs text-muted-foreground">Quiz Accuracy</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-foreground">Current Study Goals</h4>
                      {user.goals.map((goal, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground font-medium">{goal.subject}</span>
                            <span className="text-muted-foreground">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Recent Activities */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Activities</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

// Study Feature Card Component
const StudyFeatureCard = ({ title, description, icon, onClick, gradient }) => (
  <div 
    className="group cursor-pointer transition-all duration-200 hover:scale-105"
    onClick={onClick}
  >
    <Card className="h-full border border-border bg-card hover:shadow-lg transition-shadow duration-200">
      <div className={`bg-gradient-to-r ${gradient} p-6 rounded-t-lg`}>
        <div className="flex justify-center">
          <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        </div>
      </div>
      <CardContent className="p-4 text-center bg-card">
        <h3 className="text-base font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </div>
);

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    const iconProps = { className: "h-4 w-4 text-white" };
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
      case 'file': return 'from-blue-500 to-blue-600';
      case 'chat': return 'from-purple-500 to-purple-600';
      case 'quiz': return 'from-green-500 to-green-600';
      case 'flashcard': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className="border border-border bg-card hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {activity.name}
          </p>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>{activity.time}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
};

export default Dashboard;
