
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, Clock, Flame, Target } from "lucide-react";

const ProgressDashboard = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Your Progress</CardTitle>
        <CardDescription>Track your learning journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="p-2 bg-spark-light rounded-full mb-2">
                <Flame className="h-5 w-5 text-spark-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Daily Streak</p>
              <h3 className="text-2xl font-bold">7 days</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="p-2 bg-spark-light rounded-full mb-2">
                <BadgeCheck className="h-5 w-5 text-spark-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Concepts Mastered</p>
              <h3 className="text-2xl font-bold">24</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="p-2 bg-spark-light rounded-full mb-2">
                <Clock className="h-5 w-5 text-spark-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Study Time</p>
              <h3 className="text-2xl font-bold">4.5 hrs</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="p-2 bg-spark-light rounded-full mb-2">
                <Target className="h-5 w-5 text-spark-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Quiz Accuracy</p>
              <h3 className="text-2xl font-bold">86%</h3>
            </CardContent>
          </Card>
        </div>
      
        <div>
          <h3 className="font-medium mb-3">Current Study Goals</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Biology 101 - Chapter 4</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Chemistry - Periodic Table</span>
                <span>40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>History - World War II</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-3">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-spark-primary"></div>
                <span>Completed Biology quiz</span>
              </div>
              <span className="text-sm text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-spark-primary"></div>
                <span>Created 12 new flashcards</span>
              </div>
              <span className="text-sm text-muted-foreground">Yesterday</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-spark-primary"></div>
                <span>Mastered 3 new concepts</span>
              </div>
              <span className="text-sm text-muted-foreground">2 days ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressDashboard;
