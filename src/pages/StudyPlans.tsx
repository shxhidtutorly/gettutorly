
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  Target, 
  Plus, 
  Edit2, 
  Trash2,
  CheckCircle,
  Circle,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";

interface StudyTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  estimatedHours: number;
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subject: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: StudyTask[];
  created_at: any;
  userId: string;
}

const StudyPlans = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    subject: "",
    targetDate: "",
    priority: "medium" as const
  });

  // Load study plans
  useEffect(() => {
    const loadStudyPlans = async () => {
      if (!user) return;

      try {
        const plansRef = collection(db, 'studyPlans');
        const q = query(
          plansRef, 
          where("userId", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        
        const plans: StudyPlan[] = [];
        querySnapshot.forEach((doc) => {
          plans.push({ id: doc.id, ...doc.data() } as StudyPlan);
        });
        
        setStudyPlans(plans);
      } catch (error) {
        console.error('Error loading study plans:', error);
        toast({
          title: "Error",
          description: "Failed to load study plans",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudyPlans();
  }, [user, toast]);

  const createStudyPlan = async () => {
    if (!user || !newPlan.title.trim()) return;

    try {
      const plansRef = collection(db, 'studyPlans');
      const planData = {
        ...newPlan,
        userId: user.uid,
        status: 'not_started' as const,
        tasks: [],
        created_at: new Date()
      };

      const docRef = await addDoc(plansRef, planData);
      const newStudyPlan = { id: docRef.id, ...planData };
      
      setStudyPlans(prev => [newStudyPlan, ...prev]);
      setIsCreateDialogOpen(false);
      setNewPlan({
        title: "",
        description: "",
        subject: "",
        targetDate: "",
        priority: "medium"
      });
      
      toast({
        title: "Study Plan Created",
        description: "Your new study plan has been created successfully!"
      });
    } catch (error) {
      console.error('Create study plan error:', error);
      toast({
        title: "Error",
        description: "Failed to create study plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteStudyPlan = async (planId: string) => {
    try {
      await deleteDoc(doc(db, 'studyPlans', planId));
      setStudyPlans(prev => prev.filter(plan => plan.id !== planId));
      
      toast({
        title: "Study Plan Deleted",
        description: "The study plan has been deleted successfully."
      });
    } catch (error) {
      console.error('Delete study plan error:', error);
      toast({
        title: "Error",
        description: "Failed to delete study plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updatePlanStatus = async (planId: string, status: StudyPlan['status']) => {
    try {
      await updateDoc(doc(db, 'studyPlans', planId), { status });
      setStudyPlans(prev => 
        prev.map(plan => 
          plan.id === planId ? { ...plan, status } : plan
        )
      );
    } catch (error) {
      console.error('Update plan status error:', error);
    }
  };

  const getProgressPercentage = (plan: StudyPlan) => {
    if (!plan.tasks || plan.tasks.length === 0) return 0;
    const completedTasks = plan.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / plan.tasks.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 text-red-400 bg-red-500/10';
      case 'medium': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case 'low': return 'border-green-500 text-green-400 bg-green-500/10';
      default: return 'border-gray-500 text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in_progress': return 'bg-blue-600';
      case 'not_started': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your study plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Target className="h-8 w-8 text-purple-400" />
              Study Plans
            </h1>
            <p className="text-gray-400">Organize your learning goals and track your progress</p>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <h2 className="text-xl font-semibold">
              My Plans ({studyPlans.length})
            </h2>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A1A] border-slate-700 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Study Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plan-title" className="text-gray-300">Title</Label>
                    <Input
                      id="plan-title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter plan title"
                      className="bg-[#2A2A2A] border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plan-description" className="text-gray-300">Description</Label>
                    <Textarea
                      id="plan-description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your study plan"
                      className="bg-[#2A2A2A] border-slate-600 text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plan-subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="plan-subject"
                      value={newPlan.subject}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter subject"
                      className="bg-[#2A2A2A] border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plan-target-date" className="text-gray-300">Target Date</Label>
                    <Input
                      id="plan-target-date"
                      type="date"
                      value={newPlan.targetDate}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="bg-[#2A2A2A] border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plan-priority" className="text-gray-300">Priority</Label>
                    <select
                      id="plan-priority"
                      value={newPlan.priority}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-[#2A2A2A] border border-slate-600 rounded-md text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <Button 
                    onClick={createStudyPlan}
                    disabled={!newPlan.title.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Study Plans Grid */}
          {studyPlans.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No study plans yet</h3>
              <p className="text-gray-500">Create your first study plan to start organizing your learning goals</p>
            </motion.div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {studyPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="bg-[#1A1A1A] border-slate-700 hover:border-purple-500 transition-all duration-300 h-full group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                              {plan.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={`text-xs ${getPriorityColor(plan.priority)} border`}>
                                {plan.priority.toUpperCase()}
                              </Badge>
                              <Badge className={`text-xs text-white ${getStatusColor(plan.status)}`}>
                                {plan.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-white"
                              onClick={() => setSelectedPlan(plan)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-400"
                              onClick={() => deleteStudyPlan(plan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <BookOpen className="h-4 w-4" />
                            <span>{plan.subject}</span>
                          </div>
                          
                          {plan.targetDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(plan.targetDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <TrendingUp className="h-4 w-4" />
                            <span>{getProgressPercentage(plan)}% Complete</span>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {plan.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePlanStatus(plan.id, 'completed')}
                              className="flex-1 border-green-600 text-green-400 hover:bg-green-600/10"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          {plan.status === 'not_started' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePlanStatus(plan.id, 'in_progress')}
                              className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600/10"
                            >
                              <Circle className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default StudyPlans;
