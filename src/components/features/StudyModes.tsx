
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleCheckBig, FlaskConical, Zap, ListChecks, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StudyModes = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">Study Modes</CardTitle>
            <CardDescription>Choose how you want to study your material</CardDescription>
          </div>
          <Badge className="bg-spark-peach text-spark-secondary border-none">New!</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flashcards" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Flashcards</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span>Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              <span>Summaries</span>
            </TabsTrigger>
            <TabsTrigger value="micro-lessons" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span>Micro-Lessons</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flashcards" className="space-y-4">
            <div className="p-6 rounded-xl bg-spark-light">
              <h3 className="text-lg font-medium mb-2">Flashcards</h3>
              <p className="text-muted-foreground mb-4">Master key concepts and definitions with AI-generated flashcards</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-white h-40 flex items-center justify-center cursor-pointer hover:shadow-md transition-all">
                  <div className="text-center p-4">
                    <h4 className="font-medium">What is photosynthesis?</h4>
                    <p className="text-xs text-muted-foreground mt-2">Click to flip</p>
                  </div>
                </Card>
                <Card className="bg-spark-blue h-40 flex items-center justify-center cursor-pointer hover:shadow-md transition-all">
                  <div className="text-center p-4">
                    <h4 className="font-medium">Define osmosis</h4>
                    <p className="text-xs text-muted-foreground mt-2">Click to flip</p>
                  </div>
                </Card>
                <Card className="bg-spark-peach h-40 flex items-center justify-center cursor-pointer hover:shadow-md transition-all">
                  <div className="text-center p-4">
                    <h4 className="font-medium">What are mitochondria?</h4>
                    <p className="text-xs text-muted-foreground mt-2">Click to flip</p>
                  </div>
                </Card>
              </div>
              <Button className="spark-button-primary w-full">Start Flashcards</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="quiz" className="space-y-4">
            <div className="p-6 rounded-xl bg-spark-blue">
              <h3 className="text-lg font-medium mb-2">Quiz</h3>
              <p className="text-muted-foreground mb-4">Test your knowledge with adaptive difficulty questions</p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-3">Which of the following is a function of mitochondria?</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-spark-gray cursor-pointer">
                    <div className="h-5 w-5 rounded-full border border-spark-primary"></div>
                    <span>Photosynthesis</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-spark-light cursor-pointer">
                    <div className="h-5 w-5 rounded-full border border-spark-primary bg-spark-primary flex items-center justify-center">
                      <CircleCheckBig className="h-4 w-4 text-white" />
                    </div>
                    <span>Cellular respiration</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-spark-gray cursor-pointer">
                    <div className="h-5 w-5 rounded-full border border-spark-primary"></div>
                    <span>Protein synthesis</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-spark-gray cursor-pointer">
                    <div className="h-5 w-5 rounded-full border border-spark-primary"></div>
                    <span>Cell division</span>
                  </div>
                </div>
              </div>
              <Button className="spark-button-primary w-full">Take Quiz</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="summaries" className="space-y-4">
            <div className="p-6 rounded-xl bg-spark-peach">
              <h3 className="text-lg font-medium mb-2">Smart Summaries</h3>
              <p className="text-muted-foreground mb-4">Get condensed versions of your material in different formats</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-white p-4 hover:shadow-md transition-all">
                  <h4 className="font-medium mb-2">Quick Recap</h4>
                  <p className="text-sm text-muted-foreground">5-minute read</p>
                </Card>
                <Card className="bg-white p-4 hover:shadow-md transition-all">
                  <h4 className="font-medium mb-2">Deep Dive</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive analysis</p>
                </Card>
                <Card className="bg-white p-4 hover:shadow-md transition-all">
                  <h4 className="font-medium mb-2">Concept Map</h4>
                  <p className="text-sm text-muted-foreground">Visual relationships</p>
                </Card>
              </div>
              <Button className="spark-button-primary w-full">View Summaries</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="micro-lessons" className="space-y-4">
            <div className="p-6 rounded-xl bg-spark-gray">
              <h3 className="text-lg font-medium mb-2">Micro-Lessons</h3>
              <p className="text-muted-foreground mb-4">Bite-sized 2-3 minute lessons for busy students</p>
              <div className="space-y-3 mb-4">
                <Card className="bg-white p-4 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-medium">Introduction to Cell Biology</h4>
                    <p className="text-sm text-muted-foreground">2 min read</p>
                  </div>
                  <Badge className="bg-spark-primary">New</Badge>
                </Card>
                <Card className="bg-white p-4 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-medium">Cell Membrane Structure</h4>
                    <p className="text-sm text-muted-foreground">3 min read</p>
                  </div>
                </Card>
                <Card className="bg-white p-4 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-medium">Organelles & Their Functions</h4>
                    <p className="text-sm text-muted-foreground">2 min read</p>
                  </div>
                </Card>
              </div>
              <Button className="spark-button-primary w-full">Start Learning</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudyModes;
