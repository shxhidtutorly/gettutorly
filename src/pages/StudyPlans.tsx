import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  BookOpen,
  Target,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";

// --- Interfaces ---
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
  created_at: Timestamp; // FIXED: Use proper Firestore timestamp
  userId: string;
}

// --- Main Component ---
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

  // --- Data Fetching ---
  useEffect(() => {
    const loadStudyPlans = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const plansRef = collection(db, 'studyPlans');
        
        // FIXED: Handle composite index error by using a simpler query first
        let q;
        try {
          // Try the composite query first
          q = query(
            plansRef,
            where("userId", "==", user.uid),
            orderBy("created_at", "desc")
          );
        } catch (indexError) {
          console.warn('Composite index not available, using simple query:', indexError);
          // Fallback to simple query without ordering
          q = query(
            plansRef,
            where("userId", "==", user.uid)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const plansData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as StudyPlan));
        
        // Sort manually if composite index is not available
        if (!q.queryConstraints.some(constraint => constraint.type === 'orderBy')) {
          plansData.sort((a, b) => {
            const aTime = a.created_at?.toMillis?.() || 0;
            const bTime = b.created_at?.toMillis?.() || 0;
            return bTime - aTime;
          });
        }
        
        setStudyPlans(plansData);
      } catch (error) {
        console.error('Error loading study plans:', error);
        toast({
          title: "Error Loading Plans",
          description: "Could not fetch your study plans. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudyPlans();
  }, [user, toast]);

  // --- CRUD Operations ---
  const createStudyPlan = async () => {
    if (!user || !newPlan.title.trim()) return;

    try {
      const plansRef = collection(db, 'studyPlans');
      const planData = {
        ...newPlan,
        userId: user.uid,
        status: 'not_started' as const,
        tasks: [],
        created_at: Timestamp.now() // FIXED: Use proper Firestore timestamp
      };

      const docRef = await addDoc(plansRef, planData);
      const newPlanWithId = { id: docRef.id, ...planData };
      setStudyPlans(prev => [newPlanWithId, ...prev]);
      
      setIsCreateDialogOpen(false);
      setNewPlan({ title: "", description: "", subject: "", targetDate: "", priority: "medium" });
      
      toast({ title: "Study Plan Created!", description: "Your new plan is ready." });
    } catch (error) {
      console.error('Create study plan error:', error);
      toast({ title: "Creation Failed", description: "Could not create the study plan.", variant: "destructive" });
    }
  };

  const deleteStudyPlan = async (planId: string) => {
    try {
      await deleteDoc(doc(db, 'studyPlans', planId));
      setStudyPlans(prev => prev.filter(plan => plan.id !== planId));
      toast({ title: "Plan Deleted" });
    } catch (error) {
      console.error('Delete study plan error:', error);
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  };
  
  const updatePlanStatus = async (planId: string, status: StudyPlan['status']) => {
    try {
      await updateDoc(doc(db, 'studyPlans', planId), { status });
      setStudyPlans(prev => prev.map(plan => plan.id === planId ? { ...plan, status } : plan));
    } catch (error) {
      console.error('Update plan status error:', error);
    }
  };

  // --- UI Helpers ---
  const getProgressPercentage = (plan: StudyPlan) => {
    if (!plan.tasks || plan.tasks.length === 0) return 0;
    const completedTasks = plan.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / plan.tasks.length) * 100);
  };
  
  const neonColors = {
    high: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    medium: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
    low: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-lg">Loading Study Plans...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your study plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Study Plans
              </h1>
              <p className="text-gray-400">Organize your learning journey</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle>Create New Study Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newPlan.subject}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, subject: e.target.value }))}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newPlan.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          setNewPlan(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newPlan.targetDate}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createStudyPlan} className="bg-green-600 hover:bg-green-700">
                      Create Plan
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Study Plans Grid */}
          {studyPlans.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Study Plans Yet</h3>
              <p className="text-gray-400 mb-6">Create your first study plan to get started</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`bg-gray-900 border-2 ${neonColors[plan.priority]}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <Badge 
                          variant={plan.status === 'completed' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {plan.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <BookOpen className="h-4 w-4" />
                        <span>{plan.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Target className="h-4 w-4" />
                        <span>Target: {plan.targetDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {plan.created_at?.toDate?.()?.toLocaleDateString() || 'Unknown'}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{getProgressPercentage(plan)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(plan)} className="h-2" />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePlanStatus(plan.id, 'in_progress')}
                          disabled={plan.status === 'completed'}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePlanStatus(plan.id, 'completed')}
                          disabled={plan.status === 'completed'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteStudyPlan(plan.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default StudyPlans;
