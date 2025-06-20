import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Play
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

  // Manual quiz creation modal state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [formQuestions, setFormQuestions] = useState<
    { question: string; options: string[]; correct: number }[]
  >([{ question: "", options: ["", "", "", ""], correct: 0 }]);

  useEffect(() => {
    const source = searchParams.get("source");
    const quizId = searchParams.get("id");

    if (source === "generated") {
      const savedQuiz = localStorage.getItem("generatedQuiz");
      if (savedQuiz) {
        const parsedQuiz = JSON.parse(savedQuiz);
        setQuiz(parsedQuiz);
        setSelectedAnswers(new Array(parsedQuiz.questions.length).fill(-1));
        
        // Save to persistent storage
        saveQuiz({
          title: parsedQuiz.title,
          questions: parsedQuiz.questions
        });
        
        // Clear temporary storage
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

  // Manual quiz creation handlers
  const handleFormQuestionChange = (
    qIdx: number,
    field: "question" | "correct",
    value: string | number
  ) => {
    const updated = [...formQuestions];
    if (field === "question") {
      updated[qIdx].question = value as string;
    } else if (field === "correct") {
      updated[qIdx].correct = Number(value);
    }
    setFormQuestions(updated);
  };

  const handleFormOptionChange = (
    qIdx: number,
    optIdx: number,
    value: string
  ) => {
    const updated = [...formQuestions];
    updated[qIdx].options[optIdx] = value;
    setFormQuestions(updated);
  };

  const addFormQuestion = () => {
    setFormQuestions([
      ...formQuestions,
      { question: "", options: ["", "", "", ""], correct: 0 }
    ]);
  };

  const removeFormQuestion = (qIdx: number) => {
    if (formQuestions.length === 1) return;
    setFormQuestions(formQuestions.filter((_, idx) => idx !== qIdx));
  };

  const submitQuizForm = () => {
    if (!quizTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Quiz title required"
      });
      return;
    }
    for (let q of formQuestions) {
      if (!q.question.trim() || q.options.some((o) => !o.trim())) {
        toast({
          variant: "destructive",
          title: "All fields required",
          description: "Each question and all options must be filled."
        });
        return;
      }
    }
    
    // Save to localStorage
    const savedQuiz = saveQuiz({
      title: quizTitle,
      questions: formQuestions
    });
    
    const newQuiz: Quiz = {
      title: savedQuiz.title,
      questions: savedQuiz.questions,
      source: "manual",
      timestamp: savedQuiz.createdAt
    };
    
    setQuiz(newQuiz);
    setSelectedAnswers(new Array(newQuiz.questions.length).fill(-1));
    setShowQuizForm(false);
    toast({
      title: "Quiz Created! 🎉",
      description: "Your quiz has been saved and is ready to begin."
    });
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

  const gradientBg = "bg-gradient-to-bl from-[#0A0A0A] via-[#1a1a2e] to-[#16213e]";

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg} animate-fade-in`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-white">Loading quiz...</p>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // Show quiz creation options when no quiz exists
  if (!quiz && !showQuizForm) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-6xl mx-auto">
            <div className="mb-6">
              <BackToDashboardButton variant="outline" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-4">Quiz Center</h1>
              <p className="text-gray-400 mb-6">
                Take existing quizzes or create new ones to test your knowledge
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={() => setShowQuizForm(true)}
                  className="flex items-center gap-2 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <PlusCircle className="h-5 w-5" />
                  Create Quiz
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/AINotesGenerator")}
                  className="flex items-center gap-2 text-lg font-semibold"
                  size="lg"
                >
                  <Bot className="h-5 w-5" />
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

  // Manual Quiz Creation Form ---
  if (showQuizForm) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto bg-gray-900/80 rounded-2xl shadow-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-6 w-6" /> Create Quiz
            </h2>
            <div className="mb-4">
              <label htmlFor="quiz-title" className="block text-lg text-white mb-2">
                Quiz Title
              </label>
              <input
                id="quiz-title"
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 outline-none focus:border-purple-500"
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                autoFocus
              />
            </div>
            {formQuestions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="mb-6 p-4 rounded-lg border border-gray-600 bg-gray-800/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-base font-medium">
                    Question {qIdx + 1}
                  </span>
                  {formQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFormQuestion(qIdx)}
                      className="text-red-400 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  className="w-full mb-3 p-3 rounded-lg bg-gray-900 text-white border border-gray-600 outline-none focus:border-purple-500"
                  placeholder="Enter the question"
                  value={q.question}
                  onChange={(e) =>
                    handleFormQuestionChange(qIdx, "question", e.target.value)
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 outline-none focus:border-purple-500"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) =>
                          handleFormOptionChange(qIdx, optIdx, e.target.value)
                        }
                      />
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correct === optIdx}
                          onChange={() =>
                            handleFormQuestionChange(qIdx, "correct", optIdx)
                          }
                          className="accent-purple-600"
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 mb-6">
              <Button
                variant="secondary"
                onClick={addFormQuestion}
                type="button"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" /> Add Question
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuizForm(false)}
                type="button"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
            <Button 
              onClick={submitQuizForm} 
              size="lg" 
              className="w-full text-lg bg-purple-600 hover:bg-purple-700"
            >
              Save & Start Quiz
            </Button>
          </motion.div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // Results Screen ---
  if (showResults && quiz) {
    const score = calculateScore();

    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-4xl mx-auto">
            <div className="absolute left-4 top-4 z-20">
              <Button
                onClick={backToQuizList}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
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

  // Quiz Start Screen ---
  if (quiz && !quizStarted) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto text-center"
          >
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white mb-4">
                  {quiz.title}
                </CardTitle>
                <div className="text-gray-300 space-y-2">
                  <p className="text-lg">
                    Ready to test your knowledge?
                  </p>
                  <p>
                    This quiz contains <span className="font-bold text-purple-400">{quiz.questions.length}</span> questions
                  </p>
                  <p className="text-sm text-gray-400">
                    Take your time and read each question carefully
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={startQuiz}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
                <div className="flex justify-center">
                  <Button
                    onClick={backToQuizList}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    Back to Quizzes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // Quiz Question Screen ---
  if (quiz && quizStarted) {
    const currentQ = quiz.questions[currentQuestion];
    const answeredQuestions = selectedAnswers
      .map((answer, index) => answer !== -1 ? index : -1)
      .filter(index => index !== -1);

    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <div className="absolute left-4 top-4 z-20">
          <Button
            onClick={backToQuizList}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
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
                className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-4">
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    disabled={selectedAnswers[currentQuestion] === -1}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={goToNext}
                    disabled={selectedAnswers[currentQuestion] === -1}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
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
  }

  return null;
};

export default Quiz;
