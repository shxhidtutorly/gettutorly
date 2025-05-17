
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { 
  Clock, 
  Brain, 
  FileText, 
  MapPin, 
  Repeat, 
  CheckCircle2, 
  LayoutList, 
  SplitSquareVertical
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const StudyTechniques = () => {
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);
  
  const techniques = [
    {
      id: "pomodoro",
      title: "Pomodoro Technique",
      icon: Clock,
      color: "bg-red-100 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      description: "Time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.",
      steps: [
        "Choose a task to work on",
        "Set a timer for 25 minutes (one 'Pomodoro')",
        "Work on the task until the timer rings",
        "Take a short 5-minute break",
        "After 4 Pomodoros, take a longer 15-30 minute break"
      ],
      benefits: [
        "Increases focus and concentration",
        "Reduces mental fatigue",
        "Creates a sense of urgency",
        "Keeps you accountable"
      ]
    },
    {
      id: "feynman",
      title: "Feynman Technique",
      icon: Brain,
      color: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      description: "A learning strategy named after physicist Richard Feynman, focused on explaining complex concepts in simple terms to improve understanding.",
      steps: [
        "Choose a concept or topic",
        "Explain it in simple terms as if teaching a child",
        "Identify gaps in your explanation and review those areas",
        "Simplify technical language and create analogies"
      ],
      benefits: [
        "Deepens understanding of complex topics",
        "Identifies knowledge gaps",
        "Improves ability to communicate ideas",
        "Strengthens long-term retention"
      ]
    },
    {
      id: "mind-mapping",
      title: "Mind Mapping",
      icon: MapPin,
      color: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      description: "A visual technique for structuring information, using a central concept with connected branches of related ideas.",
      steps: [
        "Start with a central concept in the middle",
        "Draw branches for major related topics",
        "Add smaller branches for subtopics",
        "Use colors, symbols and images to enhance memory",
        "Review and reorganize as needed"
      ],
      benefits: [
        "Promotes creative thinking",
        "Organizes complex information visually",
        "Shows relationships between concepts",
        "Helps with brainstorming and note-taking"
      ]
    },
    {
      id: "spaced",
      title: "Spaced Repetition",
      icon: Repeat,
      color: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      description: "A learning technique that incorporates increasing intervals of time between subsequent reviews of previously learned material.",
      steps: [
        "Study material for the first time",
        "Review after one day",
        "Review again after three days",
        "Then review after a week",
        "Continue increasing intervals (two weeks, a month, etc.)"
      ],
      benefits: [
        "Improves long-term retention",
        "Combats the forgetting curve",
        "More efficient than cramming",
        "Works with digital flashcard systems"
      ]
    },
    {
      id: "active-recall",
      title: "Active Recall",
      icon: CheckCircle2,
      color: "bg-yellow-100 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      description: "Testing yourself on material rather than passively reviewing. Retrieving information from memory strengthens neural connections.",
      steps: [
        "Read or study material initially",
        "Close books/notes and try to recall key points",
        "Check your answers against the material",
        "Focus on areas where recall was difficult",
        "Repeat regularly with increasing difficulty"
      ],
      benefits: [
        "Strengthens memory pathways",
        "Identifies weak areas of understanding",
        "More effective than re-reading",
        "Prepares you for exam conditions"
      ]
    },
    {
      id: "cornell",
      title: "Cornell Method",
      icon: LayoutList,
      color: "bg-pink-100 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      description: "A systematic note-taking format that divides pages into sections for questions, notes, and summaries.",
      steps: [
        "Divide your page into three sections: a narrow left column, a wide right column, and a bottom section",
        "Take notes in the right column during class/reading",
        "Write key questions/terms in the left column",
        "Write a summary at the bottom section",
        "Use the layout to test yourself and review"
      ],
      benefits: [
        "Organizes notes systematically",
        "Encourages active engagement with material",
        "Built-in review system",
        "Creates study-ready materials"
      ]
    },
    {
      id: "interleaved",
      title: "Interleaved Practice",
      icon: SplitSquareVertical,
      color: "bg-orange-100 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      description: "Mixing different topics or types of problems within a single study session, rather than focusing on one skill at a time.",
      steps: [
        "Identify several related but distinct topics/problems",
        "Study or practice them in an alternating sequence",
        "Switch topics before mastery (this creates productive struggle)",
        "Review connections between different concepts",
        "Space out practice over time"
      ],
      benefits: [
        "Improves ability to distinguish between problem types",
        "Develops flexible thinking",
        "Enhances long-term retention",
        "Better prepares for real-world application"
      ]
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8 text-gray-800 dark:text-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Advanced Study Techniques</h1>
            <p className="text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
              Discover scientifically-proven methods to enhance your learning efficiency, 
              improve retention, and make the most of your study sessions.
            </p>
          </div>
          
          {/* Techniques Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techniques.map((technique) => {
              const Icon = technique.icon;
              
              return (
                <Card 
                  key={technique.id} 
                  className="hover-glow hover-lift transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${technique.color}`}>
                        <Icon className={`h-5 w-5 ${technique.textColor}`} />
                      </div>
                      <CardTitle className="text-lg text-gray-800 dark:text-white">{technique.title}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-700 dark:text-gray-200">
                      {technique.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="steps" className="border-gray-200 dark:border-gray-700">
                        <AccordionTrigger className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                          How to use it
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 dark:text-gray-300">
                          <ol className="list-decimal pl-5 space-y-1">
                            {technique.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="benefits" className="border-gray-200 dark:border-gray-700">
                        <AccordionTrigger className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                          Benefits
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 dark:text-gray-300">
                          <ul className="list-disc pl-5 space-y-1">
                            {technique.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default StudyTechniques;
