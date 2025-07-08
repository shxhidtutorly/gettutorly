import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserCollection, safeSetDoc, safeAddDoc } from '@/lib/firebase-helpers';
import { useToast } from '@/hooks/use-toast';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Check,
  Book,
  PlusCircle,
  ListChecks,
  Trash2
} from "lucide-react";

interface StudyPlan {
  id?: string;
  title: string;
  description: string;
  createdAt: any;
  updatedAt: any;
  userId: string;
}

const StudyPlans = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editedPlanTitle, setEditedPlanTitle] = useState('');
  const [editedPlanDescription, setEditedPlanDescription] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadStudyPlans = async () => {
      try {
        setLoading(true);
        const studyPlansRef = getUserCollection(user.uid, 'studyPlans');
        const q = query(studyPlansRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const plans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudyPlan[];
        
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
    if (!user || !newPlanTitle.trim()) return;

    try {
      const studyPlansRef = getUserCollection(user.uid, 'studyPlans');
      const newPlan = {
        title: newPlanTitle.trim(),
        description: newPlanDescription.trim(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: user.uid
      };

      await safeAddDoc(studyPlansRef, newPlan);
      
      setNewPlanTitle('');
      setNewPlanDescription('');
      setShowCreateForm(false);
      
      toast({
        title: "Success",
        description: "Study plan created successfully"
      });
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast({
        title: "Error",
        description: "Failed to create study plan",
        variant: "destructive"
      });
    }
  };

  const updateStudyPlan = async (planId: string, updates: Partial<StudyPlan>) => {
    if (!user) return;

    try {
      const studyPlansRef = getUserCollection(user.uid, 'studyPlans');
      const planDocRef = doc(studyPlansRef, planId);
      await updateDoc(planDocRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: "Success",
        description: "Study plan updated successfully"
      });
    } catch (error) {
      console.error('Error updating study plan:', error);
      toast({
        title: "Error",
        description: "Failed to update study plan",
        variant: "destructive"
      });
    }
  };

  const deleteStudyPlan = async (planId: string) => {
    if (!user) return;

    try {
      const studyPlansRef = getUserCollection(user.uid, 'studyPlans');
      const planDocRef = doc(studyPlansRef, planId);
      await deleteDoc(planDocRef);
      
      setStudyPlans(prev => prev.filter(plan => plan.id !== planId));
      
      toast({
        title: "Success",
        description: "Study plan deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting study plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete study plan",
        variant: "destructive"
      });
    }
  };

  const startEditing = (plan: StudyPlan) => {
    setEditingPlanId(plan.id || null);
    setEditedPlanTitle(plan.title);
    setEditedPlanDescription(plan.description);
  };

  const cancelEditing = () => {
    setEditingPlanId(null);
  };

  const saveEdit = async (planId: string) => {
    await updateStudyPlan(planId, {
      title: editedPlanTitle,
      description: editedPlanDescription
    });
    setEditingPlanId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading study plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Book className="h-6 md:h-8 w-6 md:w-8 text-purple-400" />
              Your Study Plans
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Organize your learning journey with custom study plans</p>
          </motion.div>

          {/* Create Study Plan Form */}
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mb-4 bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          ) : (
            <Card className="bg-[#121212] border-slate-700 mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Create New Study Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-title" className="text-gray-300">Title</Label>
                  <Input
                    id="plan-title"
                    placeholder="Enter plan title"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    className="bg-[#1A1A1A] border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-description" className="text-gray-300">Description</Label>
                  <Input
                    id="plan-description"
                    placeholder="Enter plan description"
                    value={newPlanDescription}
                    onChange={(e) => setNewPlanDescription(e.target.value)}
                    className="bg-[#1A1A1A] border-slate-600 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                  <Button onClick={createStudyPlan}>Create</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Plans List */}
          {studyPlans.length === 0 ? (
            <div className="text-center text-gray-400">No study plans created yet.</div>
          ) : (
            <div className="space-y-4">
              {studyPlans.map((plan) => (
                <Card key={plan.id} className="bg-[#121212] border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    {editingPlanId === plan.id ? (
                      <Input
                        value={editedPlanTitle}
                        onChange={(e) => setEditedPlanTitle(e.target.value)}
                        placeholder="Enter title"
                        className="bg-[#1A1A1A] border-slate-600 text-white"
                      />
                    ) : (
                      <CardTitle className="text-white">{plan.title}</CardTitle>
                    )}
                    <div>
                      {editingPlanId === plan.id ? (
                        <>
                          <Button onClick={() => saveEdit(plan.id || '')} className="mr-2">
                            <Check className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => startEditing(plan)}
                            className="text-purple-400 hover:text-purple-300 mr-2"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => deleteStudyPlan(plan.id || '')}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingPlanId === plan.id ? (
                      <Input
                        value={editedPlanDescription}
                        onChange={(e) => setEditedPlanDescription(e.target.value)}
                        placeholder="Enter description"
                        className="bg-[#1A1A1A] border-slate-600 text-white"
                      />
                    ) : (
                      <p className="text-gray-400">{plan.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
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
