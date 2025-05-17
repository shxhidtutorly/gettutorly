
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; 
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Plus,
  Calendar,
  BookOpen,
  AlertCircle,
  ChevronRight,
  X
} from "lucide-react";

const StudyPlans = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([
    { 
      id: 1, 
      title: "Psychology Final Exam", 
      dueDate: "May 15, 2025", 
      progress: 65, 
      sessions: [
        { day: "Monday", time: "2:00 PM - 4:00 PM", topic: "Cognitive Psychology" },
        { day: "Wednesday", time: "3:00 PM - 5:00 PM", topic: "Behavioral Psychology" },
        { day: "Friday", time: "10:00 AM - 12:00 PM", topic: "Developmental Psychology" }
      ]
    },
    { 
      id: 2, 
      title: "Calculus Midterm", 
      dueDate: "May 5, 2025", 
      progress: 40, 
      sessions: [
        { day: "Tuesday", time: "1:00 PM - 3:00 PM", topic: "Derivatives" },
        { day: "Thursday", time: "4:00 PM - 6:00 PM", topic: "Integrals" }
      ] 
    },
  ]);
  
  // New state for study plan creation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    dueDate: "",
    sessions: [{ day: "Monday", time: "2:00 PM - 4:00 PM", topic: "" }]
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const createReminder = (plan) => {
    toast({
      title: "Reminder set",
      description: `You'll be reminded about your ${plan.title} study sessions.`,
    });
  };
  
  const handleCreatePlan = () => {
    if (!newPlan.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your study plan",
        variant: "destructive"
      });
      return;
    }
    
    const newStudyPlan = {
      id: plans.length + 1,
      title: newPlan.title,
      dueDate: newPlan.dueDate || "N/A",
      progress: 0,
      sessions: newPlan.sessions.filter(session => session.topic.trim() !== "")
    };
    
    setPlans([...plans, newStudyPlan]);
    setIsCreateDialogOpen(false);
    setNewPlan({
      title: "",
      dueDate: "",
      sessions: [{ day: "Monday", time: "2:00 PM - 4:00 PM", topic: "" }]
    });
    
    toast({
      title: "Study plan created",
      description: `Your "${newStudyPlan.title}" study plan has been created successfully.`,
    });
  };
  
  const addSession = () => {
    setNewPlan({
      ...newPlan,
      sessions: [...newPlan.sessions, { day: "Monday", time: "2:00 PM - 4:00 PM", topic: "" }]
    });
  };
  
  const removeSession = (index) => {
    setNewPlan({
      ...newPlan,
      sessions: newPlan.sessions.filter((_, i) => i !== index)
    });
  };
  
  const updateSession = (index, field, value) => {
    const updatedSessions = [...newPlan.sessions];
    updatedSessions[index] = { ...updatedSessions[index], [field]: value };
    setNewPlan({ ...newPlan, sessions: updatedSessions });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <CalendarDays className="h-7 w-7 text-spark-primary" />
                Study Plans
              </h1>
              <p className="text-muted-foreground">Organize your study sessions effectively</p>
            </div>
            
            <div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Study Plan</DialogTitle>
                    <DialogDescription>
                      Create a structured study plan to organize your learning sessions.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 my-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Study Plan Title</Label>
                      <Input 
                        id="title"
                        placeholder="e.g., Biology Final Exam"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date (Optional)</Label>
                      <Input 
                        id="dueDate"
                        placeholder="e.g., May 20, 2025"
                        value={newPlan.dueDate}
                        onChange={(e) => setNewPlan({...newPlan, dueDate: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Study Sessions</Label>
                        <Button variant="outline" size="sm" type="button" onClick={addSession}>
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Session
                        </Button>
                      </div>
                      
                      {newPlan.sessions.map((session, index) => (
                        <div key={index} className="p-3 border rounded-md space-y-3 relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => removeSession(index)}
                            disabled={newPlan.sessions.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`day-${index}`}>Day</Label>
                              <Select 
                                value={session.day} 
                                onValueChange={(value) => updateSession(index, 'day', value)}
                              >
                                <SelectTrigger id={`day-${index}`}>
                                  <SelectValue placeholder={session.day} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Monday">Monday</SelectItem>
                                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                                  <SelectItem value="Thursday">Thursday</SelectItem>
                                  <SelectItem value="Friday">Friday</SelectItem>
                                  <SelectItem value="Saturday">Saturday</SelectItem>
                                  <SelectItem value="Sunday">Sunday</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`time-${index}`}>Time</Label>
                              <Select 
                                value={session.time} 
                                onValueChange={(value) => updateSession(index, 'time', value)}
                              >
                                <SelectTrigger id={`time-${index}`}>
                                  <SelectValue placeholder={session.time} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</SelectItem>
                                  <SelectItem value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</SelectItem>
                                  <SelectItem value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</SelectItem>
                                  <SelectItem value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</SelectItem>
                                  <SelectItem value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</SelectItem>
                                  <SelectItem value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</SelectItem>
                                  <SelectItem value="7:00 PM - 9:00 PM">7:00 PM - 9:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`topic-${index}`}>Topic</Label>
                            <Input 
                              id={`topic-${index}`}
                              placeholder="e.g., Cell Biology"
                              value={session.topic}
                              onChange={(e) => updateSession(index, 'topic', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreatePlan}>Create Study Plan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Study Plans */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold">Active Study Plans</h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <StudyPlanCard key={plan.id} plan={plan} onSetReminder={createReminder} />
                  ))}
                </div>
              )}
              
              {!isLoading && plans.length === 0 && (
                <div className="text-center py-12 bg-spark-light rounded-lg">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No active study plans</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first study plan to organize your learning
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Plan
                  </Button>
                </div>
              )}
            </div>
            
            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Today's Sessions</h2>
              
              {isLoading ? (
                <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
              ) : (
                <Card className="hover-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-spark-primary" />
                      Upcoming Study Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-4">
                      <SessionItem 
                        time="2:00 PM - 4:00 PM" 
                        topic="Cognitive Psychology" 
                        planTitle="Psychology Final Exam" 
                      />
                      <SessionItem 
                        time="4:00 PM - 6:00 PM" 
                        topic="Integrals" 
                        planTitle="Calculus Midterm" 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button variant="ghost" className="w-full">
                      View All Sessions
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Study Tips */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Study Tips</h2>
                <Card className="bg-spark-light border-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/50 rounded-full">
                        <BookOpen className="h-5 w-5 text-spark-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Pomodoro Technique</h3>
                        <p className="text-sm text-muted-foreground">
                          Study for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a longer break.
                        </p>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                          Learn more
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

const StudyPlanCard = ({ plan, onSetReminder }) => {
  return (
    <Card className="hover-glow overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{plan.title}</span>
          <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Due: {plan.dueDate}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm">{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Study Sessions:</h3>
          {plan.sessions.slice(0, 2).map((session, index) => (
            <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-spark-light">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-spark-secondary" />
                <span>{session.day} • {session.time}</span>
              </div>
              <span className="text-xs bg-spark-light px-2 py-0.5 rounded-full">{session.topic}</span>
            </div>
          ))}
          
          {plan.sessions.length > 2 && (
            <div className="text-sm text-spark-primary font-medium">
              +{plan.sessions.length - 2} more sessions
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4 flex justify-between">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        <Button variant="outline" size="sm" onClick={() => onSetReminder(plan)}>
          Set Reminder
        </Button>
      </CardFooter>
    </Card>
  );
};

const SessionItem = ({ time, topic, planTitle }) => (
  <div className="p-3 bg-spark-gray/50 rounded-lg hover:bg-spark-gray transition-colors">
    <div className="flex justify-between items-center mb-1">
      <span className="font-medium text-sm">{time}</span>
      <span className="text-xs text-spark-primary">{planTitle}</span>
    </div>
    <div className="text-sm text-muted-foreground">{topic}</div>
  </div>
);

export default StudyPlans;
