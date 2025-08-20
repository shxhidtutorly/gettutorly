import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Bot,
  Play,
  CheckCircle,
  Repeat,
  Home,
  X,
  Check,
  Loader2,
  Trophy
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

// --- Interfaces & Types ---
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface StoredQuiz extends Quiz {
  id: string;
  timestamp: string;
}

type GameState = 'loading' | 'selection' | 'start' | 'active' | 'results';

// --- Local Storage Helper Functions (Self-Contained) ---
const QUIZZES_STORAGE_KEY = 'ai-quizzes';

const getSavedQuizzes = (): StoredQuiz[] => {
  try {
    const savedQuizzes = localStorage.getItem(QUIZZES_STORAGE_KEY);
    return savedQuizzes ? JSON.parse(savedQuizzes) : [];
  } catch (error) {
    console.error("Failed to parse quizzes from localStorage", error);
    return [];
  }
};

const saveQuizToLocalStorage = (quiz: Quiz): StoredQuiz => {
  const quizzes = getSavedQuizzes();
  const newQuiz: StoredQuiz = {
    ...quiz,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  quizzes.unshift(newQuiz); // Add to the beginning
  localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes.slice(0, 20))); // Keep max 20 quizzes
  return newQuiz;
};

const getQuizById = (id: string): StoredQuiz | undefined => {
  const quizzes = getSavedQuizzes();
  return quizzes.find(q => q.id === id);
};

// --- Main Quiz Page Component ---
const QuizPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackQuizCompleted, endSession, startSession } = useStudyTracking();

  // --- State Management ---
  const [gameState, setGameState] = useState<GameState>('loading');
  const [savedQuizzes, setSavedQuizzes] = useState<StoredQuiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<StoredQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Initial Load Effect ---
  useEffect(() => {
    const source = searchParams.get("source");
    const quizId = searchParams.get("id");
    const allQuizzes = getSavedQuizzes();
    setSavedQuizzes(allQuizzes);

    let loadedQuiz: StoredQuiz | undefined;

    if (source === "generated") {
      const generatedQuizData = localStorage.getItem("generatedQuiz");
      if (generatedQuizData) {
        const parsedQuiz: Quiz = JSON.parse(generatedQuizData);
        loadedQuiz = saveQuizToLocalStorage(parsedQuiz);
        localStorage.removeItem("generatedQuiz");
        // Update URL to reflect the new saved quiz ID
        navigate(`/quiz?id=${loadedQuiz.id}`, { replace: true });
      } else {
        toast({ variant: "destructive", title: "No generated quiz found." });
        navigate("/quiz");
      }
    } else if (quizId) {
      loadedQuiz = getQuizById(quizId);
      if (!loadedQuiz) {
        toast({ variant: "destructive", title: "Quiz not found." });
        navigate("/quiz");
      }
    }

    if (loadedQuiz) {
      setActiveQuiz(loadedQuiz);
      setUserAnswers(new Array(loadedQuiz.questions.length).fill(-1));
      setGameState('start');
    } else {
      setGameState('selection');
    }
  }, [searchParams, navigate, toast]);

  // --- Event Handlers ---
  const handleSelectQuiz = (quiz: StoredQuiz) => {
    navigate(`/quiz?id=${quiz.id}`);
    setActiveQuiz(quiz);
    setUserAnswers(new Array(quiz.questions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setGameState('start');
  };
  
  const handleStartQuiz = () => {
    startSession();
    toast({ title: "Quiz Started!", description: "Good luck!" });
    setGameState('active');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    // Auto-advance to next question
    setTimeout(() => {
      if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };
  
  const handleGoToNext = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleGoToPrevious = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
  if (!activeQuiz) return;

  const unanswered = userAnswers.some(answer => answer === -1);
  if (unanswered) {
    toast({
      variant: "destructive",
      title: "Incomplete!",
      description: "Please answer all questions."
    });
    return;
  }

  try {
    // wait for Firestore write to finish
    const res = await endSession("quiz", activeQuiz.title, true);
    trackQuizCompleted();
    setShowConfetti(true);
    setGameState('results');
    setTimeout(() => setShowConfetti(false), 8000); // Confetti for 8 seconds
  };
  
  const handleRestart = () => {
    if (!activeQuiz) return;
    setUserAnswers(new Array(activeQuiz.questions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setGameState('start');
  };

  const handleBackToSelection = () => {
    navigate('/quiz');
    setActiveQuiz(null);
    setGameState('selection');
  };

  // --- Memoized Calculations ---
  const score = useMemo(() => {
    if (!activeQuiz || gameState !== 'results') return 0;
    const correctAnswers = userAnswers.reduce((count, answer, index) => {
      return answer === activeQuiz.questions[index].correct ? count + 1 : count;
    }, 0);
    return Math.round((correctAnswers / activeQuiz.questions.length) * 100);
  }, [activeQuiz, userAnswers, gameState]);

  // --- Render Logic ---
  const renderContent = () => {
    switch (gameState) {
      case 'loading':
        return <div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-cyan-400" /></div>;
      
      case 'selection':
        return <QuizSelection quizzes={savedQuizzes} onSelect={handleSelectQuiz} />;

      case 'start':
        if (!activeQuiz) return null;
        return <QuizStartScreen quiz={activeQuiz} onStart={handleStartQuiz} onBack={handleBackToSelection} />;

      case 'active':
        if (!activeQuiz) return null;
        return (
          <QuizInProgress
            quiz={activeQuiz}
            currentIndex={currentQuestionIndex}
            answers={userAnswers}
            onAnswer={handleAnswerSelect}
            onNext={handleGoToNext}
            onPrev={handleGoToPrevious}
            onSubmit={handleSubmitQuiz}
          />
        );
      
      case 'results':
        if (!activeQuiz) return null;
        return (
          <QuizResultsScreen
            quiz={activeQuiz}
            answers={userAnswers}
            score={score}
            onRestart={handleRestart}
            onBack={handleBackToSelection}
          />
        );

      default:
        return <div>Error: Invalid game state.</div>
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-200 font-mono">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={gameState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};


// --- Internal Components (Built from Scratch) ---

const QuizSelection = ({ quizzes, onSelect }: { quizzes: StoredQuiz[], onSelect: (q: StoredQuiz) => void }) => {
  const navigate = useNavigate();
  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Quiz Center</h1>
      <p className="text-neutral-400 mb-8">Select a saved quiz or generate a new one.</p>
      <button onClick={() => navigate("/ai-notes")} className="inline-flex items-center justify-center gap-3 text-lg font-bold p-4 mb-10 bg-cyan-400 text-black border-2 border-cyan-400 hover:bg-cyan-300 transition-colors">
          <Bot className="w-6 h-6"/> Generate New AI Quiz
      </button>
      <h2 className="text-2xl font-bold text-left mb-4">Your Saved Quizzes</h2>
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
        {quizzes.length > 0 ? (
          quizzes.map(q => (
            <motion.div
              key={q.id}
              onClick={() => onSelect(q)}
              className="bg-neutral-900 border-2 border-neutral-700 p-4 text-left cursor-pointer group transition-all"
              whileHover={{ scale: 1.02, borderColor: '#22d3ee' }}
            >
                <h3 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300">{q.title}</h3>
                <p className="text-sm text-neutral-400">{q.questions.length} Questions</p>
                <p className="text-xs text-neutral-500 mt-1">Taken on: {new Date(q.timestamp).toLocaleDateString()}</p>
            </motion.div>
          ))
        ) : (
          <div className="bg-neutral-900 border-2 border-dashed border-neutral-700 p-8 text-center">
            <p className="text-neutral-500">No quizzes saved yet. Generate one to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
};

const QuizStartScreen = ({ quiz, onStart, onBack }: { quiz: Quiz, onStart: () => void, onBack: () => void }) => (
  <div className="relative text-center bg-neutral-900 border-2 border-cyan-500 p-8">
    <button onClick={onBack} className="absolute top-3 left-3 text-neutral-400 hover:text-white transition-colors"><Home className="w-6 h-6" /></button>
    <h1 className="text-4xl font-black text-white mb-2">{quiz.title}</h1>
    <p className="text-neutral-300 text-lg mb-6">This quiz has <span className="font-bold text-cyan-400">{quiz.questions.length}</span> questions.</p>
    <p className="text-neutral-400 mb-8">Ready to test your knowledge?</p>
    <motion.button 
      onClick={onStart} 
      className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 text-lg font-bold p-4 bg-lime-400 text-black border-2 border-lime-400"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Play className="w-6 h-6"/> Start Quiz
    </motion.button>
  </div>
);

const QuizInProgress = ({ quiz, currentIndex, answers, onAnswer, onNext, onPrev, onSubmit }: { quiz: Quiz, currentIndex: number, answers: number[], onAnswer: (idx: number) => void, onNext: () => void, onPrev: () => void, onSubmit: () => void }) => {
  const currentQ = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  return (
    <div>
        <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{quiz.title}</h1>
            <div className="w-full bg-neutral-800 border-2 border-neutral-700 h-3">
                <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            <p className="text-sm text-neutral-400 mt-2">Question {currentIndex + 1} of {quiz.questions.length}</p>
        </div>
        <AnimatePresence mode="wait">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-900 border-2 border-neutral-700 p-6"
            >
                <h2 className="text-xl md:text-2xl font-bold mb-6 min-h-[6rem] flex items-center">{currentQ.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => onAnswer(index)}
                            className={`p-4 text-left font-bold border-2 transition-all duration-200 ${answers[currentIndex] === index ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700 hover:border-cyan-500'}`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                           {option}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
         <div className="flex justify-between mt-8">
            <button onClick={onPrev} disabled={currentIndex === 0} className="flex items-center gap-2 p-3 font-bold bg-neutral-800 text-neutral-300 border-2 border-neutral-700 hover:bg-neutral-700 disabled:opacity-50">
                <ArrowLeft className="w-5 h-5"/> Previous
            </button>
            {isLastQuestion ? (
                <button onClick={onSubmit} className="flex items-center gap-2 p-3 font-bold bg-lime-500 text-black border-2 border-lime-400 hover:bg-lime-400">
                    Submit Quiz <CheckCircle className="w-5 h-5"/>
                </button>
            ) : (
                <button onClick={onNext} disabled={answers[currentIndex] === -1} className="flex items-center gap-2 p-3 font-bold bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 disabled:opacity-50">
                    Next <ArrowRight className="w-5 h-5"/>
                </button>
            )}
        </div>
    </div>
  );
};

const QuizResultsScreen = ({ quiz, answers, score, onRestart, onBack }: { quiz: Quiz, answers: number[], score: number, onRestart: () => void, onBack: () => void }) => {
    const getMessage = (s: number) => {
        if (s === 100) return "Perfect Score! You're a genius!";
        if (s >= 80) return "Excellent work! You've mastered this.";
        if (s >= 60) return "Great job! A solid understanding.";
        if (s >= 40) return "Good effort! Keep reviewing.";
        return "Keep practicing! You'll get it next time.";
    }

    return (
        <div className="text-center">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-white">{getMessage(score)}</h1>
            <p className="text-7xl font-black my-4" style={{ color: score >= 60 ? '#32ff84' : '#ff4b4b' }}>{score}%</p>
            <p className="text-neutral-400 mb-8">You answered {score / 100 * quiz.questions.length} out of {quiz.questions.length} questions correctly.</p>

            <div className="flex justify-center gap-4 mb-10">
                <button onClick={onRestart} className="flex items-center gap-2 p-3 font-bold bg-neutral-800 text-neutral-300 border-2 border-neutral-700 hover:bg-neutral-700">
                    <Repeat className="w-5 h-5"/> Retake Quiz
                </button>
                <button onClick={onBack} className="flex items-center gap-2 p-3 font-bold bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400">
                    <Home className="w-5 h-5"/> Back to Quizzes
                </button>
            </div>

            <div className="space-y-6 text-left max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                <h2 className="text-2xl font-bold">Review Your Answers</h2>
                {quiz.questions.map((q, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === q.correct;
                    return (
                        <div key={index} className={`p-4 border-2 ${isCorrect ? 'border-green-500' : 'border-red-500'} bg-neutral-900`}>
                            <h3 className="font-bold mb-4">{index + 1}. {q.question}</h3>
                            <div className="space-y-2">
                                {q.options.map((option, optIndex) => {
                                    const isUserChoice = userAnswer === optIndex;
                                    const isCorrectChoice = q.correct === optIndex;
                                    let styles = 'flex items-center gap-3 p-2 border border-neutral-700';
                                    if(isCorrectChoice) styles += ' bg-green-900/50 border-green-700';
                                    if(isUserChoice && !isCorrectChoice) styles += ' bg-red-900/50 border-red-700';
                                    
                                    return (
                                        <div key={optIndex} className={styles}>
                                            {isUserChoice && !isCorrectChoice && <X className="w-5 h-5 text-red-500 flex-shrink-0"/>}
                                            {isCorrectChoice && <Check className="w-5 h-5 text-green-500 flex-shrink-0"/>}
                                            <span className="text-neutral-300">{option}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};


export default QuizPage;
