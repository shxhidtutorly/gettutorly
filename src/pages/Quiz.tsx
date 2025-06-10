import { useState, useEffect, useMemo, useCallback } from "react";
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
  Bot,
  Sparkles,
  Target,
  Clock
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
  const [questionTransition, setQuestionTransition] = useState(false);

  // Manual quiz creation modal state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [formQuestions, setFormQuestions] = useState<
    { question: string; options: string[]; correct: number }[]
  >([{ question: "", options: ["", "", "", ""], correct: 0 }]);

  // Memoized emojis to prevent constant re-renders
  const staticEmojis = useMemo(() => ({
    title: emojiSet[Math.floor(Math.random() * emojiSet.length)],
    loading: emojiSet[Math.floor(Math.random() * emojiSet.length)],
    noQuiz: emojiSet[Math.floor(Math.random() * emojiSet.length)],
    questionEmoji: emojiSet[Math.floor(Math.random() * emojiSet.length)],
    celebration: "🎉✨"
  }), []);

  // Generate random emoji for options (memoized per question)
  const getQuestionEmoji = useCallback((questionIndex: number) => {
    return emojiSet[questionIndex % emojiSet.length];
  }, []);

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
      setQuiz(null);
      setIsLoading(false);
    }
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
      setQuestionTransition(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setQuestionTransition(false);
      }, 150);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setQuestionTransition(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setQuestionTransition(false);
      }, 150);
    }
  };

  const navigateToQuestion = (questionIndex: number) => {
    if (questionIndex !== currentQuestion) {
      setQuestionTransition(true);
      setTimeout(() => {
        setCurrentQuestion(questionIndex);
        setQuestionTransition(false);
      }, 150);
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

  const gradientBg = "bg-gradient-to-br from-[#181824] via-[#21213a] to-[#2e2e46]";

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg} animate-fade-in`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-6"></div>
            <p className="text-xl text-white animate-pulse">
              Loading quiz... {staticEmojis.loading}
            </p>
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
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl mx-auto text-center animate-fade-in">
            <div className="animate-bounce mb-6">
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground" />
            </div>
            <div className="mb-8">
              <p className="text-3xl font-bold mb-3 text-white">
                No Quiz Available {staticEmojis.noQuiz}
              </p>
              <p className="text-muted-foreground mb-6 text-lg">
                Create your own quiz or generate one from your notes using AI!
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowQuizForm(true)}
                className="flex items-center gap-2 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                size="lg"
              >
                <PlusCircle className="h-5 w-5" />
                Create Quiz
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/ai-notes")}
                className="flex items-center gap-2 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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

  // Manual Quiz Creation Form
  if (showQuizForm) {
    return (
      <div className={`min-h-screen flex flex-col ${gradientBg}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl mx-auto bg-[#181824]/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <PlusCircle className="h-8 w-8 text-primary" /> Create Quiz
            </h2>
            <div className="mb-6">
              <Label htmlFor="quiz-title" className="text-lg text-white font-semibold">
                Quiz Title
              </Label>
              <input
                id="quiz-title"
                className="w-full mt-2 p-3 rounded-lg bg-zinc-900/80 text-white border border-zinc-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-6 mb-6">
              {formQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-5 rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800/60 to-zinc-900/40 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: `${qIdx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-white text-lg font-semibold">
                      Question {qIdx + 1}
                    </Label>
                    {formQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormQuestion(qIdx)}
                        className="text-red-400 hover:text-red-300 hover:underline font-medium transition-colors duration-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className="w-full mb-4 p-3 rounded-lg bg-zinc-900/80 text-white border border-zinc-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder="Enter the question"
                    value={q.question}
                    onChange={(e) =>
                      handleFormQuestionChange(qIdx, "question", e.target.value)
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input
                          className="flex-1 p-3 rounded-lg bg-zinc-900/80 text-white border border-zinc-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) =>
                            handleFormOptionChange(qIdx, optIdx, e.target.value)
                          }
                        />
                        <label className="flex items-center gap-2 text-white whitespace-nowrap">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correct === optIdx}
                            onChange={() =>
                              handleFormQuestionChange(qIdx, "correct", optIdx)
                            }
                            className="w-4 h-4 text-primary"
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                variant="secondary"
                onClick={addFormQuestion}
                type="button"
                className="flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
              >
                <PlusCircle className="h-5 w-5" /> Add Question
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuizForm(false)}
                type="button"
                className="transform hover:scale-105 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
            <Button 
              onClick={submitQuizForm} 
              size="lg" 
              className="w-full text-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Save & Start Quiz
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // Results Screen
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
            <div className="absolute left-4 top-4 z-20">
              <BackToDashboardButton variant="outline" />
            </div>
            <div className="text-center mb-8 animate-bounce-in">
              <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-400 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Quiz Complete! {emoji}
              </h1>
              <p className="text-muted-foreground text-xl">Here are your results</p>
            </div>

            <Card className="mb-8 bg-gradient-to-br from-[#22223b]/90 to-[#1a1a2e]/90 backdrop-blur-sm border-none shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-slide-up">
              <CardHeader>
                <CardTitle className="text-center text-white text-2xl">Final Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-7xl md:text-8xl font-extrabold mb-4 text-primary animate-pulse">
                  {score}%
                </div>
                <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                  {correctAnswers} out of {quiz.questions.length} correct
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-white">
                    {message} {emoji}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 mb-8">
              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct;
                return (
                  <Card
                    key={index}
                    className={`border-l-4 shadow-lg transition-all duration-300 hover:scale-[1.01] animate-slide-up ${
                      isCorrect
                        ? "border-l-green-400 bg-gradient-to-r from-green-900/40 to-green-800/20"
                        : "border-l-red-400 bg-gradient-to-r from-red-900/40 to-red-800/20"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl mt-1 animate-bounce">
                          {isCorrect ? "✅" : "❌"}
                        </span>
                        <div>
                          <h3 className="font-bold text-lg text-white mb-2">
                            Question {index + 1}
                          </h3>
                          <p className="text-lg md:text-xl text-white leading-relaxed">
                            {question.question}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-4 rounded-xl text-base font-medium transition-all duration-200 ${
                              optionIndex === question.correct
                                ? "bg-green-100/90 dark:bg-green-900/50 border-2 border-green-300 dark:border-green-600 text-green-900 dark:text-green-200 shadow-lg"
                                : optionIndex === userAnswer && !isCorrect
                                ? "bg-red-100/90 dark:bg-red-900/50 border-2 border-red-300 dark:border-red-600 text-red-900 dark:text-red-200 shadow-lg"
                                : "bg-muted/70 text-white border border-muted"
                            }`}
                          >
                            <span className="font-bold mr-3 text-lg">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                            {optionIndex === question.correct && (
                              <span className="ml-3 text-green-700 dark:text-green-300 font-bold flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Correct
                              </span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="ml-3 text-red-700 dark:text-red-300 font-bold flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                Your answer
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
                className="flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="h-5 w-5" />
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

  // Quiz Question Screen
  if (quiz) {
    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const questionEmoji = getQuestionEmoji(currentQuestion);

    return (
      <div className={`min-h-screen flex flex-col ${gradientBg} animate-fade-in`}>
        <Navbar />
        <div className="absolute left-4 top-4 z-20">
          <BackToDashboardButton variant="outline" />
        </div>
        <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
          <div className="container max-w-4xl mx-auto">
            <div className="mb-8 animate-slide-down">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white flex items-center gap-3">
                    <span className="animate-bounce">{staticEmojis.title}</span>
                    {quiz.title}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground text-lg">
                    <span className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {quiz.source === "generated" ? "AI Generated" : "Manual"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-base mb-3 text-white">
                  <span className="font-semibold">Progress</span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3 bg-gray-700 transition-all duration-500 ease-out" 
                />
              </div>
            </div>

            <Card className={`mb-8 bg-gradient-to-br from-[#22223b]/90 to-[#1a1a2e]/90 backdrop-blur-sm border-none shadow-2xl transition-all duration-300 hover:scale-[1.01] ${
              questionTransition ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-white flex items-center gap-3 leading-relaxed">
                  <span className="text-2xl">{questionEmoji}</span>
                  {currentQ.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString() || ""}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                  className="space-y-4"
                >
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-4 p-4 md:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]
                      ${
                        selectedAnswers[currentQuestion] === index
                          ? "border-primary bg-gradient-to-r from-purple-800/70 to-indigo-700/50 scale-[1.02] shadow-xl shadow-purple-500/20"
                          : "hover:bg-muted/50 border-muted hover:border-muted-foreground/50 hover:shadow-lg"
                      }
                    `}
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer text-lg md:text-xl font-semibold text-white leading-relaxed"
                      >
                        <span className="mr-3 text-primary font-bold">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                        {selectedAnswers[currentQuestion] === index && (
                          <span className="ml-2 animate-bounce">✨</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
              <Button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex items-center gap-2 transform hover:scale-105 transition-all duration-200 disabled:transform-none"
                size="lg"
              >
                <ArrowLeft className="h-5 w-5" />
                Previous
              </Button>
              <div className="flex gap-4">
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    className="flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={selectedAnswers[currentQuestion] === -1}
                    size="lg"
                  >
                    <Trophy className="h-5 w-5" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={goToNext}
                    disabled={selectedAnswers[currentQuestion] === -1}
                    className="flex items-center gap-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:transform-none"
                    size="lg"
                  >
                    Next
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <div className="animate-slide-up">
              <h3 className="font-bold mb-4 text-lg md:text-xl text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
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
                    onClick={() => navigateToQuestion(index)}
                    className={`h-12 w-12 md:h-14 md:w-14 p-0 text-lg md:text-xl font-bold transition-all duration-200 transform hover:scale-110
                    ${
                      index === currentQuestion &&
                      "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg shadow-primary/50"
                    }
                    ${
                      selectedAnswers[index] !== -1 && index !== currentQuestion &&
                      "bg-green-600 hover:bg-green-500 text-white shadow-md"
                    }
                  `}
                  >
                    {index + 1}
                    {selectedAnswers[index] !== -1 && index !== currentQuestion && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-300" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes bounce-in {
            0% { opacity: 0; transform: scale(0.3); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          
          .animate-slide-up {
            animation: slide-up 0.5s ease-out;
          }
          
          .animate-slide-down {
            animation: slide-down 0.4s ease-out;
          }
          
          .animate-bounce-in {
            animation: bounce-in 0.8s ease-out;
          }
          
          /* Gradient background animation */
          .animate-gradient-move {
            background-size: 200% auto;
            animation: gradient-move 3s linear infinite;
          }
          
          @keyframes gradient-move {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          /* Glow effects */
          .drop-shadow-glow {
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
          }
          
          /* Smooth transitions for all interactive elements */
          button, .cursor-pointer {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          button:hover {
            transform: translateY(-1px);
          }
          
          button:active {
            transform: translateY(0);
          }
          
          /* Progress bar animation */
          .progress-bar {
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Card hover effects */
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
        `}</style>
        
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default Quiz;
