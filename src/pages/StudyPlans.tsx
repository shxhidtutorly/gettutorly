
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getUserStudyPlans } from "@/lib/database";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

const StudyPlans = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's study plans
  useEffect(() => {
    if (user?.id) {
      loadStudyPlans();
    }
  }, [user?.id]);

  const loadStudyPlans = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Loading study plans for user:', user.id);
      const data = await getUserStudyPlans(user.id);
      
      // Ensure the data matches our StudyPlan interface
      const formattedPlans: StudyPlan[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title || "Untitled Plan",
        description: item.description || "No description available",
        due_date: item.due_date || new Date().toISOString(),
        created_at: item.created_at || new Date().toISOString()
      }));
      
      setPlans(formattedPlans);
      console.log('✅ Loaded plans:', formattedPlans.length);
    } catch (error) {
      console.error('❌ Error loading study plans:', error);
      toast({
        title: "Error",
        description: "Failed to load your study plans. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow">
              📚 Your Study Plans
            </h1>
            <p className="text-muted-foreground text-lg">
              Organize your learning journey with custom study plans
            </p>
          </div>

          {/* Study Plans List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your study plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16 mx-auto mb-4 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="9" x2="15" y1="3" y2="3" />
                <line x1="9" x2="15" y1="21" y2="21" />
                <line x1="3" x2="3" y1="9" y2="15" />
                <line x1="21" x2="21" y1="9" y2="15" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No study plans yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first study plan to get started
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none hover:scale-105 transition-transform cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(plan.due_date).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        View Plan
                      </Button>
                    </div>
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
