import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast"; // Corrected path
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Calendar,
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  BookOpen,
  TrendingUp,
  Loader2
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
  created_at: any; // Firestore timestamp
  userId: string;
}

// --- Main Component ---
const StudyPlans = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null); // Kept for future edit functionality

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
      };

      try {
        const plansRef = collection(db, 'studyPlans');
        // Firestore may require a composite index for this query.
        // If you see an error in the console, Firestore will provide a link to create it.
        const q = query(
          plansRef,
          where("userId", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const plansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyPlan));
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
        created_at: new Date()
      };

      const docRef = await addDoc(plansRef, planData);
      setStudyPlans(prev => [{ id: docRef.id, ...planData }, ...prev]);
      
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
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-lg font-mono">Loading Your Study Plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <Target className="h-10 w-10 text-cyan-400" />
              Study Plans
            </h1>
            <p className="text-gray-400">Organize your learning goals and dominate your subjects.</p>
          </motion.div>

          {/* Action Bar */}
          <div className="mb-8 flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-400">My Plans ({studyPlans.length})</h2>
             <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
               <DialogTrigger asChild>
                  <Button className="bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black transition-all duration-200 shadow-[4px_4px_0px_#00f7ff] hover:shadow-[6px_6px_0px_#00f7ff] h-12 px-5">
                      <Plus className="w-5 h-5 mr-2" /> Create Plan
                  </Button>
               </DialogTrigger>
               <DialogContent className="bg-gray-900 border-2 border-cyan-400 rounded-none text-white font-mono">
                  <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-cyan-400">New Study Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                      {/* Form fields with brutalist styling */}
                      <div>
                          <Label htmlFor="plan-title" className="font-bold text-gray-400">Title</Label>
                          <Input id="plan-title" value={newPlan.title} onChange={(e) => setNewPlan(p => ({...p, title: e.target.value}))} placeholder="e.g., Master Quantum Physics" className="bg-black border-2 border-gray-600 rounded-none mt-1 focus:border-cyan-400"/>
                      </div>
                      <div>
                          <Label htmlFor="plan-subject" className="font-bold text-gray-400">Subject</Label>
                          <Input id="plan-subject" value={newPlan.subject} onChange={(e) => setNewPlan(p => ({...p, subject: e.target.value}))} placeholder="e.g., Physics" className="bg-black border-2 border-gray-600 rounded-none mt-1 focus:border-cyan-400"/>
                      </div>
                      <div>
                          <Label htmlFor="plan-description" className="font-bold text-gray-400">Description</Label>
                          <Textarea id="plan-description" value={newPlan.description} onChange={(e) => setNewPlan(p => ({...p, description: e.target.value}))} placeholder="Key topics and goals..." className="bg-black border-2 border-gray-600 rounded-none mt-1 focus:border-cyan-400"/>
                      </div>
                      <div className="flex gap-4">
                          <div className="flex-1">
                              <Label htmlFor="plan-target-date" className="font-bold text-gray-400">Target Date</Label>
                              <Input id="plan-target-date" type="date" value={newPlan.targetDate} onChange={(e) => setNewPlan(p => ({...p, targetDate: e.target.value}))} className="bg-black border-2 border-gray-600 rounded-none mt-1 focus:border-cyan-400"/>
                          </div>
                          <div className="flex-1">
                              <Label htmlFor="plan-priority" className="font-bold text-gray-400">Priority</Label>
                              <select id="plan-priority" value={newPlan.priority} onChange={(e) => setNewPlan(p => ({...p, priority: e.target.value as any}))} className="w-full h-10 px-3 bg-black border-2 border-gray-600 rounded-none mt-1 focus:border-cyan-400">
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                              </select>
                          </div>
                      </div>
                      <Button onClick={createStudyPlan} disabled={!newPlan.title.trim()} className="w-full bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black h-12 text-lg">Create</Button>
                  </div>
               </DialogContent>
             </Dialog>
          </div>

          {/* Study Plans Grid */}
          {studyPlans.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center">
              <Target className="w-24 h-24 text-gray-700 mb-4"/>
              <h3 className="text-3xl font-black text-gray-500">No Study Plans Yet</h3>
              <p className="text-gray-600 mt-2">Click "Create Plan" to get started.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {studyPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className={`group relative bg-gray-900 border-2 rounded-none p-6 transition-all duration-200 ${neonColors[plan.priority]}`}
                  >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteStudyPlan(plan.id)} className="h-8 w-8 text-gray-400 hover:text-pink-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    
                    <CardTitle className="text-xl font-black text-white mb-2 line-clamp-1">{plan.title}</CardTitle>
                    <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{plan.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs font-bold text-black bg-${neonColors[plan.priority].split(' ')[0].split('-')[1]}-400`}>{plan.priority.toUpperCase()}</span>
                        <span className="px-2 py-1 text-xs font-bold text-white bg-gray-600">{plan.status.replace('_', ' ').toUpperCase()}</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4"/><span>{plan.subject}</span></div>
                        {plan.targetDate && <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/><span>Target: {new Date(plan.targetDate).toLocaleDateString()}</span></div>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-bold">
                            <span className="text-gray-400">Progress</span>
                            <span>{getProgressPercentage(plan)}%</span>
                        </div>
                        <div className="w-full bg-black border-2 border-gray-600 h-4 p-0.5">
                            <div className={`h-full bg-${neonColors[plan.priority].split(' ')[0].split('-')[1]}-400`} style={{ width: `${getProgressPercentage(plan)}%` }}></div>
                        </div>
                    </div>

                    {plan.status !== 'completed' && (
                        <Button onClick={() => updatePlanStatus(plan.id, 'completed')} className="w-full mt-4 bg-green-500 text-black border-2 border-green-400 hover:bg-green-400 rounded-none font-black">
                            <CheckCircle className="h-4 w-4 mr-2" /> Mark as Complete
                        </Button>
                    )}
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
