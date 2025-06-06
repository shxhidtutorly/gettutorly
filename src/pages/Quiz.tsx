import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  PlusCircle,
  Bot
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";

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

const emojiSet = [
  "🧠", "🔥", "🌈", "🎉", "⭐", "🚀", "💡", "🎯", "🙌", "📚", "✨"
];

const getRandomEmoji = () =>
  emojiSet[Math.floor(Math.random() * emojiSet.length)];

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

  // Manual quiz creation modal state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [formQuestions, setFormQuestions] = useState<
    { question: string; options: string[]; correct: number }[]
  >([{ question: "", options: ["", "", "", ""], correct: 0 }]);

  // Remove local sample quiz logic, only load generated quiz if present
  useEffect(() => {
    const source = searchParams.get("source");

    if (source === "generated") {
      const savedQuiz = localStorage.getItem("generatedQuiz");
      if (savedQuiz) {
        const parsedQuiz = JSON.parse(savedQuiz);
        setQuiz(parsedQuiz);
        setSelectedAnswers(new Array(parsedQuiz.questions.length).fill(-1));
        startSession();
      } else {
        toast({
          variant: "destructive",
          title: "No quiz found",
          description: "Generate a quiz first from your notes."
        });
        navigate("/dashboard");
      }
      setIsLoading(false);
    } else {
      // No sample quiz, no auto-load: show quiz creation options
      setQuiz(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [searchParams, navigate, toast, startSession]);

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
    const newQuiz: Quiz = {
      title: quizTitle,
      questions: formQuestions,
      source: "manual",
      timestamp: new Date().toISOString()
    };
    setQuiz(newQuiz);
    setSelectedAnswers(new Array(newQuiz.questions.length).fill(-1));
    setShowQuizForm(false);
    startSession();
    toast({
      title: "Quiz Created! 🎉",
      description: "Your quiz is ready to begin."
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
    startSession();
  };

  const gradientBg =
    "bg-gradient-to-br from-[#181824] via-[#21213a] to-[#2e2e46]";

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg} animate-fade-in`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-white">
              Loading quiz... {getRandomEmoji()}
            </p>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // --- Show quiz creation options when no quiz exists ---
  if (!quiz && !showQuizForm) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl mx-auto text-center">
            <HelpCircle className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
            <div className="mb-6">
              <p className="text-2xl font-bold mb-2 text-white">
                No Quiz Available {getRandomEmoji()}
              </p>
              <p className="text-muted-foreground mb-4">
                Create your own quiz or generate one from your notes using AI!
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowQuizForm(true)}
                className="flex items-center gap-2 text-lg font-semibold"
                size="lg"
              >
                <PlusCircle className="h-5 w-5" />
                Create Quiz
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/ai-notes")}
                className="flex items-center gap-2 text-lg font-semibold"
                size="lg"
              >
                <Bot className="h-5 w-5" />
                Create AI Quiz
              </Button>
            </div>
            <div className="mt-8">
              <BackToDashboardButton />
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // --- Manual Quiz Creation Form ---
  if (showQuizForm) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto bg-[#181824]/80 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-6 w-6" /> Create Quiz
            </h2>
            <div className="mb-4">
              <Label htmlFor="quiz-title" className="text-lg text-white">
                Quiz Title
              </Label>
              <input
                id="quiz-title"
                className="w-full mt-1 mb-2 p-2 rounded bg-zinc-900 text-white border border-zinc-700 outline-none"
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                autoFocus
              />
            </div>
            {formQuestions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="mb-6 p-4 rounded-lg border border-zinc-700 bg-zinc-800/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white text-base">
                    Question {qIdx + 1}
                  </Label>
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
                  className="w-full mb-2 p-2 rounded bg-zinc-900 text-white border border-zinc-700 outline-none"
                  placeholder="Enter the question"
                  value={q.question}
                  onChange={(e) =>
                    handleFormQuestionChange(qIdx, "question", e.target.value)
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700 outline-none"
                        placeholder={`Option ${String.fromCharCode(
                          65 + optIdx
                        )}`}
                        value={opt}
                        onChange={(e) =>
                          handleFormOptionChange(qIdx, optIdx, e.target.value)
                        }
                      />
                      <label className="flex items-center gap-1 text-white">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correct === optIdx}
                          onChange={() =>
                            handleFormQuestionChange(qIdx, "correct", optIdx)
                          }
                        />{" "}
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 mb-4">
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
              >
                Cancel
              </Button>
            </div>
            <Button onClick={submitQuizForm} size="lg" className="w-full text-lg">
              Save & Start Quiz
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // --- Results Screen ---
  if (showResults && quiz) {
    const score = calculateScore();
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index].correct ? 1 : 0);
    }, 0);

    let message: string;
    let emoji: string;
    if (score >= 80) {
      message = "Excellent work!";
      emoji = "🏆✨";
    } else if (score >= 60) {
      message = "Good job!";
      emoji = "👍🌈";
    } else {
      message = "Keep practicing!";
      emoji = "💪📚";
    }

    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8 animate-fade-in">
          <div className="container max-w-4xl mx-auto">
            {/* Top Left Back Button */}
            <div className="absolute left-4 top-4 z-20">
              <BackToDashboardButton variant="outline" />
            </div>
            <div className="text-center mb-6 md:mb-8">
              <Trophy className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-yellow-400 drop-shadow-glow" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-gradient-move">
                Quiz Complete! {emoji}
              </h1>
              <p className="text-muted-foreground text-lg">Here are your results</p>
            </div>

            <Card className="mb-6 md:mb-8 bg-[#22223b]/80 border-none shadow-2xl transition-all duration-200 hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="text-center text-white">Final Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl md:text-7xl font-extrabold mb-2 text-primary drop-shadow-glow">
                  {score}% {getRandomEmoji()}
                </div>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  {correctAnswers} out of {quiz.questions.length} correct
                </p>
                <div className="mt-4">
                  <span className="block text-2xl font-bold text-white">
                    {message} {emoji}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct;
                return (
                  <Card
                    key={index}
                    className={`border-l-4 ${
                      isCorrect
                        ? "border-l-green-400 bg-green-900/30"
                        : "border-l-red-400 bg-red-900/30"
                    } shadow-md`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">
                          {isCorrect ? "✅" : "❌"}
                        </span>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base text-white">
                            Question {index + 1}
                          </h3>
                          <p className="text-base md:text-lg text-white">
                            {question.question}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 md:p-3 rounded-lg text-base font-medium transition-all ${
                              optionIndex === question.correct
                                ? "bg-green-100/80 dark:bg-green-900/40 border border-green-300 dark:border-green-700 text-green-900 dark:text-green-200"
                                : optionIndex === userAnswer && !isCorrect
                                ? "bg-red-100/80 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-200"
                                : "bg-muted text-white"
                            }`}
                          >
                            <span className="font-bold mr-2">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                            {optionIndex === question.correct && (
                              <span className="ml-2 text-green-700 dark:text-green-300 font-semibold">
                                ✓ Correct
                              </span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="ml-2 text-red-700 dark:text-red-300 font-semibold">
                                ✗ Your answer
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={restartQuiz}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
              <BackToDashboardButton />
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // --- Quiz Question Screen ---
  if (quiz) {
    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <div className={`min-h-screen flex flex-col ${gradientBg} animate-fade-in`}>
        <Navbar />
        {/* Top Left Back Button */}
        <div className="absolute left-4 top-4 z-20">
          <BackToDashboardButton variant="outline" />
        </div>
        <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white flex items-center gap-2">
                    {getRandomEmoji()} {quiz.title}
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </p>
                </div>
                <div className="hidden md:block">
                  {/* Extra back button for larger screens */}
                  <BackToDashboardButton />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-base mb-2 text-white">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            <Card className="mb-6 md:mb-8 bg-[#22223b]/80 border-none shadow-xl transition-all duration-200 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
                  {getRandomEmoji()} {currentQ.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString() || ""}
                  onValueChange={(value) =>
                    handleAnswerSelect(parseInt(value))
                  }
                  className="space-y-3 md:space-y-4"
                >
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 md:p-4 rounded-lg border transition-colors cursor-pointer
                      ${
                        selectedAnswers[currentQuestion] === index
                          ? "border-primary bg-gradient-to-r from-purple-800/60 to-indigo-700/40 scale-[1.025] shadow-lg"
                          : "hover:bg-muted/70 border-muted"
                      }
                    `}
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer text-lg md:text-xl font-semibold text-white"
                      >
                        <span className="mr-2 text-muted-foreground">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}{" "}
                        {selectedAnswers[currentQuestion] === index && (
                          <span className="ml-1">{getRandomEmoji()}</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <Button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-4">
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    className="flex items-center gap-2"
                    disabled={selectedAnswers[currentQuestion] === -1}
                  >
                    <Trophy className="h-4 w-4" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={goToNext}
                    disabled={selectedAnswers[currentQuestion] === -1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <div className="mt-6 md:mt-8">
              <h3 className="font-semibold mb-3 text-base md:text-lg text-white">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {quiz.questions.map((_, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={
                      index === currentQuestion
                        ? "default"
                        : selectedAnswers[index] !== -1
                        ? "secondary"
                        : "outline"
                    }
                    onClick={() => setCurrentQuestion(index)}
                    className={`h-10 w-10 md:h-12 md:w-12 p-0 text-base md:text-lg font-bold transition-all duration-150
                    ${
                      index === currentQuestion &&
                      "ring-2 ring-primary ring-offset-2 scale-110"
                    }
                  `}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
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
