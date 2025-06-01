
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus,
  Calendar,
  Target,
  Clock,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createStudyPlan, getUserStudyPlans } from "@/lib/database";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  sessions: any[];
  due_date?: string;
  created_at: string;
  updated_at: string;
}

const StudyPlans = () => {
  const { currentUser } = useAuth();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    due_date: '',
    sessions: []
  });
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadStudyPlans();
    }
  }, [currentUser]);

  const loadStudyPlans = async () => {
    try {
      setLoading(true);
      const plans = await getUserStudyPlans();
      setStudyPlans(plans as StudyPlan[]);
    } catch (error) {
      console.error('Error loading study plans:', error);
      toast({
        title: "Error",
        description: "Failed to load study plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your study plan",
        variant: "destructive",
      });
      return;
    }

    try {
      const plan = await createStudyPlan(newPlan);
      setStudyPlans(prev => [plan, ...prev]);
      setNewPlan({ title: '', description: '', due_date: '', sessions: [] });
      setIsDialogOpen(false);
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

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return studyPlans.filter(plan => 
      plan.due_date && new Date(plan.due_date).toDateString() === today
    );
  };

  const getActivePlans = () => {
    return studyPlans.filter(plan => 
      !plan.due_date || new Date(plan.due_date) >= new Date()
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
          <div className="mb-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Target className="h-7 w-7 text-spark-primary" />
                  Study Plans
                </h1>
                <p className="text-muted-foreground">Organize your learning journey</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="animated-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Study Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                        placeholder="Enter plan title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                        placeholder="Describe your study plan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newPlan.due_date}
                        onChange={(e) => setNewPlan({...newPlan, due_date: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleCreatePlan} className="w-full">
                      Create Plan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Today's Sessions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-spark-primary" />
              Today's Sessions
            </h2>
            {getTodaySessions().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTodaySessions().map((plan) => (
                  <Card key={plan.id} className="dark:bg-card hover-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-spark-primary" />
                        <h3 className="font-medium">{plan.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Due today</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dark:bg-card">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No sessions scheduled for today</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Active Study Plans */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-spark-primary" />
              Active Study Plans
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="dark:bg-card">
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded dark:bg-muted"></div>
                        <div className="h-3 bg-gray-200 rounded dark:bg-muted"></div>
                        <div className="h-3 bg-gray-200 rounded dark:bg-muted w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getActivePlans().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getActivePlans().map((plan) => (
                  <Card key={plan.id} className="dark:bg-card hover-glow">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      {plan.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(plan.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>{plan.sessions.length} sessions</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dark:bg-card">
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No active study plans</p>
                  <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default StudyPlans;
