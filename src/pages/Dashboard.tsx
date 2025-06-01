
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen,
  Clock,
  Target,
  Activity,
  Plus,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  Award,
  Brain,
  Zap,
  BookMarked,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeStudyProgress, useRealTimeStudyMaterials, useRealTimeUserActivity } from "@/hooks/useRealTimeData";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useRealTimeStudyProgress();
  const { materials, loading: materialsLoading } = useRealTimeStudyMaterials();
  const { activities, loading: activitiesLoading } = useRealTimeUserActivity();
  const { toast } = useToast();

  // Calculate dashboard metrics from real data
  const calculateMetrics = () => {
    const totalMaterials = materials.length;
    const totalProgress = progress.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0);
    const avgProgress = totalMaterials > 0 ? Math.round(totalProgress / totalMaterials) : 0;
    const completedMaterials = progress.filter((p: any) => p.completed).length;
    const totalTimeSpent = progress.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0);
    const hoursSpent = Math.round((totalTimeSpent / 60) * 10) / 10;

    return {
      totalMaterials,
      avgProgress,
      completedMaterials,
      hoursSpent,
      recentActivities: activities.slice(0, 5)
    };
  };

  const metrics = calculateMetrics();

  // Get user display name safely
  const getUserDisplayName = () => {
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  if (!currentUser) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {getUserDisplayName()}! 👋
            </h1>
            <p className="text-muted-foreground">Here's your learning progress overview</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover-glow dark:bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Materials</p>
                    <p className="text-2xl font-bold">{materialsLoading ? '...' : metrics.totalMaterials}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-spark-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-glow dark:bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                    <p className="text-2xl font-bold">{progressLoading ? '...' : `${metrics.avgProgress}%`}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-glow dark:bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{progressLoading ? '...' : metrics.completedMaterials}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-glow dark:bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hours Studied</p>
                    <p className="text-2xl font-bold">{progressLoading ? '...' : metrics.hoursSpent}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Progress */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-spark-primary" />
                  Recent Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded dark:bg-muted"></div>
                    ))}
                  </div>
                ) : progress.length > 0 ? (
                  <div className="space-y-4">
                    {progress.slice(0, 5).map((item: any, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Material {index + 1}</span>
                          <span>{item.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={item.progress_percentage || 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4" />
                    <p>No progress data yet</p>
                    <p className="text-sm">Start studying materials to see your progress here</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-spark-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse h-12 bg-gray-200 rounded dark:bg-muted"></div>
                    ))}
                  </div>
                ) : metrics.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.recentActivities.map((activity: any, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                        <div className="p-2 rounded-full bg-spark-light">
                          <FileText className="h-4 w-4 text-spark-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>No recent activity</p>
                    <p className="text-sm">Your activity will appear here as you use the platform</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Study Tools Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Study Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="hover-glow cursor-pointer dark:bg-card transition-transform hover:scale-105"
                onClick={() => navigate('/flashcards')}
              >
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">Flashcards</h3>
                  <p className="text-sm text-muted-foreground">Create and review flashcards</p>
                </CardContent>
              </Card>
              
              <Card 
                className="hover-glow cursor-pointer dark:bg-card transition-transform hover:scale-105"
                onClick={() => navigate('/quiz')}
              >
                <CardContent className="p-6 text-center">
                  <HelpCircle className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">Quizzes</h3>
                  <p className="text-sm text-muted-foreground">Test your knowledge</p>
                </CardContent>
              </Card>
              
              <Card 
                className="hover-glow cursor-pointer dark:bg-card transition-transform hover:scale-105"
                onClick={() => navigate('/summaries')}
              >
                <CardContent className="p-6 text-center">
                  <BookMarked className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">Summaries</h3>
                  <p className="text-sm text-muted-foreground">AI-generated summaries</p>
                </CardContent>
              </Card>
              
              <Card 
                className="hover-glow cursor-pointer dark:bg-card transition-transform hover:scale-105"
                onClick={() => navigate('/ai-assistant')}
              >
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">AI Tutor</h3>
                  <p className="text-sm text-muted-foreground">Get personalized help</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="hover-glow cursor-pointer dark:bg-card"
                onClick={() => navigate('/library')}
              >
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">Upload Material</h3>
                  <p className="text-sm text-muted-foreground">Add new study materials</p>
                </CardContent>
              </Card>
              
              <Card 
                className="hover-glow cursor-pointer dark:bg-card"
                onClick={() => navigate('/study-plans')}
              >
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">Create Plan</h3>
                  <p className="text-sm text-muted-foreground">Plan your study sessions</p>
                </CardContent>
              </Card>
              
              <Card 
                className="hover-glow cursor-pointer dark:bg-card"
                onClick={() => navigate('/progress')}
              >
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-spark-primary mx-auto mb-2" />
                  <h3 className="font-medium">View Progress</h3>
                  <p className="text-sm text-muted-foreground">Track your learning</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
