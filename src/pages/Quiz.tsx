
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Plus, ListChecks, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import CreateQuizDialog from "@/components/features/CreateQuizDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizSet {
  id: string;
  name: string;
  questions: QuizQuestion[];
}

const Quiz = () => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState("biology");
  
  const [quizSets, setQuizSets] = useState<Record<string, QuizQuestion[]>>({
    biology: [
      {
        question: "Which of the following is a function of mitochondria?",
        options: [
          "Photosynthesis",
          "Cellular respiration",
          "Protein synthesis",
          "Cell division"
        ],
        correctAnswer: 1
      },
      {
        question: "What is the chemical formula of water?",
        options: [
          "H2O",
          "CO2",
          "NaCl",
          "CH4"
        ],
        correctAnswer: 0
      },
      {
        question: "Which of the following is NOT a phase of mitosis?",
        options: [
          "Prophase",
          "Metaphase",
          "Interphase",
          "Telophase"
        ],
        correctAnswer: 2
      },
      {
        question: "Which scientist is known for the theory of evolution by natural selection?",
        options: [
          "Isaac Newton",
          "Albert Einstein",
          "Charles Darwin",
          "Gregor Mendel"
        ],
        correctAnswer: 2
      },
      {
        question: "Which organelle is responsible for protein synthesis in a cell?",
        options: [
          "Mitochondria",
          "Golgi apparatus",
          "Lysosome",
          "Ribosome"
        ],
        correctAnswer: 3
      }
    ],
    chemistry: [
      {
        question: "What is the atomic number of carbon?",
        options: [
          "4",
          "6",
          "8",
          "12"
        ],
        correctAnswer: 1
      },
      {
        question: "Which of these is a noble gas?",
        options: [
          "Oxygen",
          "Nitrogen",
          "Helium",
          "Chlorine"
        ],
        correctAnswer: 2
      },
      {
        question: "What is the pH of pure water at room temperature?",
        options: [
          "0",
          "7",
          "10",
          "14"
        ],
        correctAnswer: 1
      }
    ]
  });
  
  const [quizNames, setQuizNames] = useState([
    { id: "biology", name: "Biology" },
    { id: "chemistry", name: "Chemistry" }
  ]);
  
  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === quizSets[activeQuiz][currentQuestion].correctAnswer) {
      setScore(score + 1);
      toast({
        title: "Correct!",
        description: "Well done, that's the right answer.",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer is: ${quizSets[activeQuiz][currentQuestion].options[quizSets[activeQuiz][currentQuestion].correctAnswer]}`,
        variant: "destructive",
      });
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < quizSets[activeQuiz].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleCreateQuiz = (quizName: string, questions: QuizQuestion[]) => {
    // Create a sanitized ID from the name
    const quizId = quizName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if the quiz already exists
    if (quizSets[quizId]) {
      toast({
        title: "Quiz already exists",
        description: "A quiz with this name already exists. Please choose a different name.",
        variant: "destructive"
      });
      return;
    }
    
    // Add the new quiz
    setQuizSets(prev => ({
      ...prev,
      [quizId]: questions
    }));
    
    // Add to the quiz names
    setQuizNames(prev => [
      ...prev,
      { id: quizId, name: quizName }
    ]);
    
    // Set the active tab to the new quiz
    setActiveQuiz(quizId);
    
    // Reset quiz state
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    
    toast({
      title: "Quiz created",
      description: `Successfully created "${quizName}" with ${questions.length} questions.`
    });
  };
  
  const handleSwitchQuiz = (quizId: string) => {
    setActiveQuiz(quizId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Quiz</h1>
              <p className="text-muted-foreground">Test your knowledge with adaptive difficulty questions</p>
            </div>
            <CreateQuizDialog onSave={handleCreateQuiz} />
          </div>
          
          <Tabs value={activeQuiz} onValueChange={handleSwitchQuiz} className="mb-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quizNames.map(quiz => (
                <TabsTrigger key={quiz.id} value={quiz.id} className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span>{quiz.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {!quizCompleted ? (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {quizSets[activeQuiz].length}</div>
                  <div className="text-sm font-medium">Score: {score}</div>
                </div>
                <Progress value={((currentQuestion + 1) / quizSets[activeQuiz].length) * 100} className="h-2" />
              </div>
              
              <Card className="mb-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{quizSets[activeQuiz][currentQuestion].question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quizSets[activeQuiz][currentQuestion].options.map((option, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                        ${selectedAnswer === index && index === quizSets[activeQuiz][currentQuestion].correctAnswer ? 'bg-green-50 border-green-300' : ''}
                        ${selectedAnswer === index && index !== quizSets[activeQuiz][currentQuestion].correctAnswer ? 'bg-red-50 border-red-300' : ''}
                        ${selectedAnswer === null ? 'hover:bg-spark-light border-transparent' : ''}
                        ${isAnswered && index === quizSets[activeQuiz][currentQuestion].correctAnswer ? 'bg-green-50 border-green-300' : ''}
                      `}
                      onClick={() => handleSelectAnswer(index)}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0
                        ${selectedAnswer === index && index === quizSets[activeQuiz][currentQuestion].correctAnswer ? 'bg-green-100 text-green-600' : ''}
                        ${selectedAnswer === index && index !== quizSets[activeQuiz][currentQuestion].correctAnswer ? 'bg-red-100 text-red-600' : ''}
                        ${selectedAnswer === null ? 'border border-spark-primary' : ''}
                        ${isAnswered && index === quizSets[activeQuiz][currentQuestion].correctAnswer && selectedAnswer !== index ? 'bg-green-100 text-green-600' : ''}
                      `}>
                        {selectedAnswer === index && index === quizSets[activeQuiz][currentQuestion].correctAnswer && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {selectedAnswer === index && index !== quizSets[activeQuiz][currentQuestion].correctAnswer && (
                          <XCircle className="h-5 w-5" />
                        )}
                        {isAnswered && index === quizSets[activeQuiz][currentQuestion].correctAnswer && selectedAnswer !== index && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </div>
                      <span className="flex-grow">{option}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  className="spark-button-primary button-click-effect" 
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                >
                  {currentQuestion < quizSets[activeQuiz].length - 1 ? (
                    <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Finish Quiz <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Quiz Completed!</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold mb-4 text-spark-primary">{score}/{quizSets[activeQuiz].length}</div>
                <p className="text-lg text-muted-foreground mb-8">
                  {score === quizSets[activeQuiz].length ? "Perfect score! Excellent work!" : 
                   score >= quizSets[activeQuiz].length * 0.7 ? "Great job! You're on the right track." :
                   "Keep studying, you'll do better next time."}
                </p>
                <Button className="spark-button-primary button-click-effect" onClick={handleRestartQuiz}>
                  <ListChecks className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Quiz;
