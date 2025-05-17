
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Clock, Plus, ArrowRight, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const MicroLessons = () => {
  const { toast } = useToast();
  
  const lessons = [
    {
      id: 1,
      title: "Introduction to Cell Biology",
      duration: "2 min",
      isNew: true,
      progress: 0,
      category: "Biology"
    },
    {
      id: 2,
      title: "Cell Membrane Structure",
      duration: "3 min",
      isNew: false,
      progress: 35,
      category: "Biology"
    },
    {
      id: 3,
      title: "Organelles & Their Functions",
      duration: "4 min",
      isNew: false,
      progress: 100,
      category: "Biology"
    },
    {
      id: 4,
      title: "Acids & Bases",
      duration: "2 min",
      isNew: false,
      progress: 75,
      category: "Chemistry"
    },
    {
      id: 5,
      title: "Periodic Table Basics",
      duration: "3 min",
      isNew: true,
      progress: 0,
      category: "Chemistry"
    },
    {
      id: 6,
      title: "Medieval Europe Overview",
      duration: "5 min",
      isNew: false,
      progress: 20,
      category: "History"
    }
  ];
  
  const handleStartLesson = (id: number) => {
    toast({
      title: "Starting lesson",
      description: "Preparing your micro-lesson...",
      duration: 2000,
    });
  };
  
  const handleCreateNew = () => {
    toast({
      title: "Create new micro-lesson",
      description: "Select a topic to create a new micro-lesson",
      duration: 2000,
    });
  };
  
  const getStatusLabel = (progress: number) => {
    if (progress === 0) return "Not started";
    if (progress === 100) return "Completed";
    return "In progress";
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Micro-Lessons</h1>
              <p className="text-muted-foreground">Bite-sized 2-5 minute lessons for busy students</p>
            </div>
            <Button className="spark-button-primary button-click-effect" onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" /> Create New Lesson
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover-glow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-spark-light border-none">
                      {lesson.category}
                    </Badge>
                    {lesson.isNew && (
                      <Badge className="bg-spark-primary">New</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-1">{lesson.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{lesson.duration}</span>
                      <span className="mx-2">•</span>
                      <span>{getStatusLabel(lesson.progress)}</span>
                    </div>
                  </div>
                  
                  {lesson.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{lesson.progress}%</span>
                      </div>
                      <Progress value={lesson.progress} className="h-1.5" />
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full ${lesson.progress === 100 ? 'bg-spark-light text-spark-secondary hover:bg-spark-light/80' : 'spark-button-primary'} button-click-effect`}
                    onClick={() => handleStartLesson(lesson.id)}
                  >
                    {lesson.progress === 0 ? (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Lesson
                      </>
                    ) : lesson.progress === 100 ? (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Review Lesson
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Continue
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MicroLessons;
