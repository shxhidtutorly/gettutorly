import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
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
import { auth } from "@/lib/firebase";
import { useFeatureData } from "@/hooks/useFeatureData";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subject: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: StudyTask[];
  created_at: string;
  userId: string;
}

interface StudyTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  estimatedHours: number;
}

const StudyPlans = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    subject: "",
    targetDate: "",
    priority: "medium" as const
  });

  const { data: studyPlans, loading, refetch } = useFeatureData<StudyPlan>(
    user?.uid || null, 
    'study_plans'
  );

  const createStudyPlan = async () => {
    if (!user || !newPlan.title.trim()) return;

    try {
      // This would be implemented in firebase-db.ts
      setIsCreateDialogOpen(false);
      setNewPlan({
        title: "",
        description: "",
        subject: "",
        targetDate: "",
        priority: "medium"
      });
      
      await refetch();
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
      // This would be implemented in firebase-db.ts
      await refetch();
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

  const updateTaskStatus = async (planId: string, taskId: string, completed: boolean) => {
    try {
      // This would be implemented in firebase-db.ts
      await refetch();
    } catch (error) {
      console.error('Update task error:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = (plan: StudyPlan) => {
    if (!plan.tasks || plan.tasks.length === 0) return 0;
    const completedTasks = plan.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / plan.tasks.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 text-red-400';
      case 'medium': return 'border-yellow-500 text-yellow-400';
      case 'low': return 'border-green-500 text-green-400';
      default: return 'border-gray-500 text-gray-400';
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
            className="mb-6 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                My Plans ({studyPlans?.length || 0})
              </h2>
            </div>
            
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
          {studyPlans?.length === 0 ? (
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence>
                {studyPlans?.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-[#1A1A1A] border-slate-700 hover:border-purple-500 transition-colors group h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                              {plan.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(plan.priority)}`}
                              >
                                {plan.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                                {plan.subject}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStudyPlan(plan.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {plan.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Progress</span>
                              <span>{getProgressPercentage(plan)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage(plan)}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Tasks Preview */}
                          {plan.tasks && plan.tasks.length > 0 && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-gray-300">Tasks ({plan.tasks.length})</h4>
                              {plan.tasks.slice(0, 3).map(task => (
                                <div key={task.id} className="flex items-center gap-2 text-xs">
                                  <button
                                    onClick={() => updateTaskStatus(plan.id, task.id, !task.completed)}
                                    className="text-purple-400 hover:text-purple-300"
                                  >
                                    {task.completed ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                  </button>
                                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                    {task.title}
                                  </span>
                                </div>
                              ))}
                              {plan.tasks.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{plan.tasks.length - 3} more tasks
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-slate-700">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {plan.targetDate ? new Date(plan.targetDate).toLocaleDateString() : 'No due date'}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {plan.status.replace('_', ' ')}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPlan(plan)}
                            className="w-full border-slate-600 text-gray-300 hover:bg-slate-800"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default StudyPlans;
