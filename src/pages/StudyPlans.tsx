
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  Clock,
  Plus,
  BookOpen,
  Target,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserStudyPlans, createStudyPlan } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  sessions: any[];
  due_date: string;
  created_at: string;
  updated_at: string;
}

const StudyPlans = () => {
  const { currentUser } = useAuth();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    due_date: '',
    sessions: []
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchStudyPlans();
      setupRealtimeSubscription();
    }
  }, [currentUser]);

  const fetchStudyPlans = async () => {
    try {
      const plans = await getUserStudyPlans();
      setStudyPlans(plans);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch study plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser) return;

    const channel = supabase
      .channel('study_plans_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_plans',
        filter: `user_id=eq.${currentUser.id}`
      }, () => {
        fetchStudyPlans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plan title",
        variant: "destructive",
      });
      return;
    }

    try {
      await createStudyPlan(newPlan);
      setNewPlan({ title: '', description: '', due_date: '', sessions: [] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Study plan created successfully",
      });
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast({
        title: "Error",
        description: "Failed to create study plan",
        variant: "destructive",
      });
    }
  };

  const getTodaysSessions = () => {
    const today = new Date().toDateString();
    return studyPlans.filter(plan => 
      plan.sessions.some((session: any) => 
        new Date(session.date).toDateString() === today
      )
    );
  };

  const getActivePlans = () => {
    const now = new Date();
    return studyPlans.filter(plan => 
      !plan.due_date || new Date(plan.due_date) >= now
    );
  };

  if (!currentUser) {
    return <div>Please sign in to view your study plans.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Target className="h-7 w-7 text-spark-primary" />
                Study Plans
              </h1>
              <p className="text-muted-foreground">Organize your learning goals and track progress</p>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="animated-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Study Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-card">
                <DialogHeader>
                  <DialogTitle>Create New Study Plan</DialogTitle>
                  <DialogDescription>
                    Set up a new study plan to organize your learning goals.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                      className="col-span-3"
                      placeholder="Enter plan title"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      className="col-span-3"
                      placeholder="Describe your study plan"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="due_date" className="text-right">
                      Due Date
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newPlan.due_date}
                      onChange={(e) => setNewPlan({...newPlan, due_date: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlan}>Create Plan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="dark:bg-muted">
              <TabsTrigger value="active">Active Plans</TabsTrigger>
              <TabsTrigger value="today">Today's Sessions</TabsTrigger>
              <TabsTrigger value="all">All Plans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-48 bg-gray-200 rounded-lg dark:bg-muted"></div>
                  ))}
                </div>
              ) : getActivePlans().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getActivePlans().map((plan) => (
                    <Card key={plan.id} className="hover-glow dark:bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-spark-primary" />
                          {plan.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {plan.description || "No description provided"}
                        </p>
                        <div className="space-y-2">
                          {plan.due_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(plan.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{plan.sessions?.length || 0} sessions</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm" className="animated-button">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No active study plans</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first study plan to start organizing your learning goals.
                  </p>
                  <Button 
                    className="animated-button" 
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="today" className="mt-6">
              {loading ? (
                <div className="animate-pulse h-48 bg-gray-200 rounded-lg dark:bg-muted"></div>
              ) : getTodaysSessions().length > 0 ? (
                <div className="space-y-4">
                  {getTodaysSessions().map((plan) => (
                    <Card key={plan.id} className="dark:bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{plan.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Today's session from this plan
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Ready to start</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No sessions scheduled for today</h3>
                  <p className="text-muted-foreground">
                    Check back tomorrow or schedule new sessions in your study plans.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 rounded-lg dark:bg-muted"></div>
                  ))}
                </div>
              ) : studyPlans.length > 0 ? (
                <div className="space-y-4">
                  {studyPlans.map((plan) => (
                    <Card key={plan.id} className="dark:bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{plan.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {plan.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
                              {plan.due_date && (
                                <span>Due: {new Date(plan.due_date).toLocaleDateString()}</span>
                              )}
                              <span>{plan.sessions?.length || 0} sessions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button size="sm" className="animated-button">View</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No study plans yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first study plan to get started with organized learning.
                  </p>
                  <Button 
                    className="animated-button" 
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default StudyPlans;
