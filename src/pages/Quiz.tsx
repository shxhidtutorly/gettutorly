import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizResults } from "@/components/quiz/QuizResults";
import { SavedQuizzes } from "@/components/quiz/SavedQuizzes";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Bot,
  Play,
  CheckCircle
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { motion, AnimatePresence } from "framer-motion";
import { saveQuiz, StoredQuiz, getQuizById } from "@/lib/quizStorage";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
  source?: string;
  timestamp?: string;
}

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackQuizCompletion, endSession, startSession } = useStudyTracking();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const source = searchParams.get("source");
    const quizId = searchParams.get("id");

    if (source === "generated") {
      const savedQuiz = localStorage.getItem("generatedQuiz");
      if (savedQuiz) {
        const parsedQuiz = JSON.parse(savedQuiz);
        setQuiz(parsedQuiz);
        setSelectedAnswers(new Array(parsedQuiz.questions.length).fill(-1));
        
        saveQuiz({
          title: parsedQuiz.title,
          questions: parsedQuiz.questions
        });
        
        localStorage.removeItem("generatedQuiz");
      } else {
        toast({
          variant: "destructive",
          title: "No quiz found",
          description: "Generate a quiz first from your notes."
        });
        navigate("/quiz");
      }
      setIsLoading(false);
    } else if (quizId) {
      const savedQuiz = getQuizById(quizId);
      if (savedQuiz) {
        setQuiz({
          title: savedQuiz.title,
          questions: savedQuiz.questions,
          source: "saved"
        });
        setSelectedAnswers(new Array(savedQuiz.questions.length).fill(-1));
      } else {
        toast({
          variant: "destructive",
          title: "Quiz not found",
          description: "The requested quiz could not be loaded."
        });
        navigate("/quiz");
      }
      setIsLoading(false);
    } else {
      setQuiz(null);
      setIsLoading(false);
    }
  }, [searchParams, navigate, toast]);

  const handleSavedQuizSelect = (savedQuiz: StoredQuiz) => {
    setQuiz({
      title: savedQuiz.title,
      questions: savedQuiz.questions,
      source: "saved"
    });
    setSelectedAnswers(new Array(savedQuiz.questions.length).fill(-1));
    setShowResults(false);
    setQuizStarted(false);
    setCurrentQuestion(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const goToNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    startSession();
    toast({
      title: "Quiz Started!",
      description: "Good luck with your quiz!"
    });
  };

  const submitQuiz = () => {
    if (!quiz) return;
    const unanswered = selectedAnswers.some((answer) => answer === -1);
    if (unanswered) {
      toast({
        variant: "destructive",
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting."
      });
      return;
    }

    setShowResults(true);
    trackQuizCompletion();
    endSession("quiz", quiz.title, true);

    toast({
      title: "Quiz Completed! 🎉",
      description: "Great job! Check your results below."
    });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    const correct = selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === quiz.questions[index].correct ? 1 : 0);
    }, 0);
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz?.questions.length || 0).fill(-1));
    setShowResults(false);
    setQuizStarted(false);
  };

  const backToQuizList = () => {
    setQuiz(null);
    setShowResults(false);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
  };
  
  const neonColors = {
    cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
    green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]',
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-xl text-white">Loading quiz...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white font-mono">
        <Navbar />
        <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-6xl mx-auto">
            <div className="mb-6">
              <BackToDashboardButton />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Quiz Center</h1>
              <p className="text-gray-400 mb-6">
                Take existing quizzes or create new ones to test your knowledge
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={() => navigate("/ai-notes")}
                  className={`bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black transition-all duration-200 h-12 px-5 ${neonColors.cyan}`}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Generate AI Quiz
                </Button>
              </div>
            </motion.div>

            <SavedQuizzes onQuizSelect={handleSavedQuizSelect} />
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }
  
  if (showResults) {
    const score = calculateScore();

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-mono">
        <Navbar />
        <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-4xl mx-auto">
            <div className="absolute left-4 top-4 z-20">
              <Button
                onClick={backToQuizList}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 rounded-none"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <QuizResults
              questions={quiz.questions}
              userAnswers={selectedAnswers}
              score={score}
              onRetake={restartQuiz}
              onGoBack={backToQuizList}
            />
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white font-mono">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto text-center"
          >
            <div className={`bg-gray-900 border-2 rounded-none p-8 ${neonColors.cyan}`}>
              <h1 className="text-4xl font-black text-white mb-4">
                {quiz.title}
              </h1>
              <div className="text-gray-300 space-y-2 mb-6">
                <p className="text-lg">
                  Ready to test your knowledge?
                </p>
                <p>
                  This quiz contains <span className="font-bold text-cyan-400">{quiz.questions.length}</span> questions.
                </p>
              </div>
              <Button
                onClick={startQuiz}
                size="lg"
                className={`w-full bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black transition-all duration-200 h-14 text-lg ${neonColors.cyan}`}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Quiz
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const answeredQuestions = selectedAnswers
    .map((answer, index) => answer !== -1 ? index : -1)
    .filter(index => index !== -1);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <div className="absolute left-4 top-4 z-20">
        <Button
          onClick={backToQuizList}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-800 rounded-none"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-4 text-white text-center">
              {quiz.title}
            </h1>
            <QuizProgress
              currentQuestion={currentQuestion}
              totalQuestions={quiz.questions.length}
              answeredQuestions={answeredQuestions}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <QuizCard
              key={currentQuestion}
              question={currentQ.question}
              options={currentQ.options}
              selectedAnswer={selectedAnswers[currentQuestion] === -1 ? null : selectedAnswers[currentQuestion]}
              onAnswerSelect={handleAnswerSelect}
              questionNumber={currentQuestion + 1}
              totalQuestions={quiz.questions.length}
            />
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-between mt-8"
          >
            <Button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50 rounded-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-4">
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  className={`bg-green-500 text-black border-2 border-green-400 hover:bg-green-400 rounded-none font-black transition-all duration-200 ${neonColors.green}`}
                  disabled={selectedAnswers[currentQuestion] === -1}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={selectedAnswers[currentQuestion] === -1}
                  className={`bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black transition-all duration-200 ${neonColors.cyan}`}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Quiz;
