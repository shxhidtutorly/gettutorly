import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw, Clock, Target, Zap, BookOpen, Brain, Plus } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

const useTheme = () => {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  return { theme, toggleTheme };
};

const useToast = () => {
  const toast = ({ title, description }: { title: string; description: string }) => {
    // Do nothing, or show a custom UI notification instead of alert
  };
  return { toast };
};

const CreateQuizDialog = ({ onSave }: { onSave: (name: string, questions: QuizQuestion[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);

  const handleSave = () => {
    if (quizName.trim() && questions.every(q => q.question.trim() && q.options.every(o => o.trim()))) {
      onSave(quizName, questions);
      setIsOpen(false);
      setQuizName('');
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-label="Close Modal"
      />
      {/* Modal */}
      <div
        className="relative z-10 bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Quiz</h2>
        <input
          type="text"
          placeholder="Quiz Name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6 p-4 border rounded-lg dark:border-gray-600">
            <input
              type="text"
              placeholder={`Question ${qIndex + 1}`}
              value={q.question}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].question = e.target.value;
                setQuestions(newQuestions);
              }}
              className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {q.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctAnswer === oIndex}
                  onChange={() => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].correctAnswer = oIndex;
                    setQuestions(newQuestions);
                  }}
                  className="w-4 h-4"
                />
                <input
                  type="text"
                  placeholder={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].options[oIndex] = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            ))}
          </div>
        ))}
        <Button
          onClick={() =>
            setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }])
          }
          className="mb-4"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Question
        </Button>
        <div className="flex gap-2 justify-end">
          <Button onClick={() => setIsOpen(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Quiz</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
        <Plus className="mr-2 h-4 w-4" />
        Create Quiz
      </Button>
      {isOpen && ReactDOM.createPortal(modal, document.body)}
    </>
  );
};

const Quiz = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState("biology");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const [quizSets, setQuizSets] = useState<Record<string, QuizQuestion[]>>({
    biology: [
      {
        question: "Which of the following is a function of mitochondria?",
        options: ["Photosynthesis", "Cellular respiration", "Protein synthesis", "Cell division"],
        correctAnswer: 1,
        difficulty: 'medium',
        explanation: "Mitochondria are known as the powerhouse of the cell and are responsible for cellular respiration, which produces ATP energy."
      },
      {
        question: "What is the chemical formula of water?",
        options: ["H2O", "CO2", "NaCl", "CH4"],
        correctAnswer: 0,
        difficulty: 'easy',
        explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom, hence H2O."
      },
      {
        question: "Which of the following is NOT a phase of mitosis?",
        options: ["Prophase", "Metaphase", "Interphase", "Telophase"],
        correctAnswer: 2,
        difficulty: 'medium',
        explanation: "Interphase is the phase between cell divisions, not a phase of mitosis itself."
      },
      {
        question: "Which scientist is known for the theory of evolution by natural selection?",
        options: ["Isaac Newton", "Albert Einstein", "Charles Darwin", "Gregor Mendel"],
        correctAnswer: 2,
        difficulty: 'easy',
        explanation: "Charles Darwin formulated the theory of evolution by natural selection in his work 'On the Origin of Species'."
      },
      {
        question: "Which organelle is responsible for protein synthesis in a cell?",
        options: ["Mitochondria", "Golgi apparatus", "Lysosome", "Ribosome"],
        correctAnswer: 3,
        difficulty: 'medium',
        explanation: "Ribosomes are the cellular structures responsible for translating mRNA into proteins."
      }
    ],
    chemistry: [
      {
        question: "What is the atomic number of carbon?",
        options: ["4", "6", "8", "12"],
        correctAnswer: 1,
        difficulty: 'easy',
        explanation: "Carbon has 6 protons in its nucleus, giving it an atomic number of 6."
      },
      {
        question: "Which of these is a noble gas?",
        options: ["Oxygen", "Nitrogen", "Helium", "Chlorine"],
        correctAnswer: 2,
        difficulty: 'easy',
        explanation: "Helium is a noble gas with a complete outer electron shell, making it chemically inert."
      },
      {
        question: "What is the pH of pure water at room temperature?",
        options: ["0", "7", "10", "14"],
        correctAnswer: 1,
        difficulty: 'medium',
        explanation: "Pure water has a pH of 7, which is considered neutral on the pH scale."
      }
    ]
  });

  const [quizNames, setQuizNames] = useState([
    {
      id: "biology",
      name: "Biology",
      description: "Test your knowledge of biological concepts",
      category: "Science"
    },
    {
      id: "chemistry",
      name: "Chemistry",
      description: "Explore chemical principles and reactions",
      category: "Science"
    }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isTimerActive, timeLeft, isAnswered]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    setStreak(0);
    toast({
      title: "Time's up!",
      description: `The correct answer was: ${quizSets[activeQuiz][currentQuestion].options[quizSets[activeQuiz][currentQuestion].correctAnswer]}`
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSelectAnswer = useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    setIsTimerActive(false);

    const isCorrect = index === quizSets[activeQuiz][currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setBestStreak(Math.max(bestStreak, streak + 1));
      toast({
        title: "Correct! 🎉",
        description: "Well done, that's the right answer."
      });
    } else {
      setStreak(0);
      toast({
        title: "Incorrect ❌",
        description: `The correct answer is: ${quizSets[activeQuiz][currentQuestion].options[quizSets[activeQuiz][currentQuestion].correctAnswer]}`
      });
    }
    setTimeout(() => setShowExplanation(true), 500);
    // eslint-disable-next-line
  }, [isAnswered, score, streak, bestStreak, activeQuiz, currentQuestion, quizSets, toast]);

  const handleNextQuestion = () => {
    if (currentQuestion < quizSets[activeQuiz].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setTimeLeft(30);
      setIsTimerActive(true);
    } else {
      setQuizCompleted(true);
      setIsTimerActive(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
    setTimeLeft(30);
    setIsTimerActive(true);
    setStreak(0);
  };

  const handleCreateQuiz = (quizName: string, questions: QuizQuestion[]) => {
    const quizId = quizName.toLowerCase().replace(/\s+/g, '-');
    if (quizSets[quizId]) {
      toast({
        title: "Quiz already exists",
        description: "A quiz with this name already exists. Please choose a different name."
      });
      return;
    }
    setQuizSets(prev => ({
      ...prev,
      [quizId]: questions
    }));
    setQuizNames(prev => [
      ...prev,
      { id: quizId, name: quizName, description: `Custom quiz with ${questions.length} questions`, category: "Custom" }
    ]);
    setActiveQuiz(quizId);
    handleRestartQuiz();
    toast({
      title: "Quiz created! 🚀",
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
    setShowExplanation(false);
    setTimeLeft(30);
    setIsTimerActive(true);
    setStreak(0);
  };

  const getScoreEmoji = () => {
    const percentage = (score / quizSets[activeQuiz].length) * 100;
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "🌟";
    if (percentage >= 60) return "👍";
    return "📚";
  };

  const currentQuizData = quizNames.find(q => q.id === activeQuiz);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Study Quiz
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Master your knowledge with adaptive learning</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
              <CreateQuizDialog onSave={handleCreateQuiz} />
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-8 pb-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Current Score</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Streak</p>
                <p className="text-2xl font-bold">{streak}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Best Streak</p>
                <p className="text-2xl font-bold">{bestStreak}</p>
              </div>
            </CardContent>
          </Card>
          {!quizCompleted && (
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Time Left</p>
                  <p className="text-2xl font-bold">{timeLeft}s</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quiz Tabs */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeQuiz} onValueChange={handleSwitchQuiz}>
              <TabsList className="flex flex-wrap md:flex-nowrap overflow-x-auto gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
                {quizNames.map(quiz => (
                  <TabsTrigger
                    key={quiz.id}
                    value={quiz.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200
                      ${
                        activeQuiz === quiz.id
                          ? "bg-white shadow-md dark:bg-gray-700 text-blue-700 dark:text-white border-2 border-blue-500"
                          : "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 border border-transparent"
                      }
                    `}
                    style={{ minWidth: 140 }}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>{quiz.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">{quiz.category}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {currentQuizData && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentQuizData.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {quizSets[activeQuiz].length} questions • Mixed difficulty
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {!quizCompleted ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Section */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Question {currentQuestion + 1} of {quizSets[activeQuiz].length}
                    </span>
                    {quizSets[activeQuiz][currentQuestion].difficulty && (
                      <Badge className={getDifficultyColor(quizSets[activeQuiz][currentQuestion].difficulty!)}>
                        {quizSets[activeQuiz][currentQuestion].difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Score: {score}/{quizSets[activeQuiz].length}
                  </div>
                </div>
                <Progress 
                  value={((currentQuestion + 1) / quizSets[activeQuiz].length) * 100} 
                  className="h-3 bg-gray-200 dark:bg-gray-700"
                />
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl md:text-2xl leading-relaxed text-gray-900 dark:text-white">
                  {quizSets[activeQuiz][currentQuestion].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quizSets[activeQuiz][currentQuestion].options.map((option, index) => (
                  <div 
                    key={index}
                    className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                      selectedAnswer === index && index === quizSets[activeQuiz][currentQuestion].correctAnswer 
                        ? 'bg-green-50 border-green-400 shadow-green-100 dark:bg-green-900/30 dark:border-green-500' 
                        : selectedAnswer === index && index !== quizSets[activeQuiz][currentQuestion].correctAnswer 
                        ? 'bg-red-50 border-red-400 shadow-red-100 dark:bg-red-900/30 dark:border-red-500' 
                        : selectedAnswer === null 
                        ? 'hover:bg-blue-50 border-gray-200 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:border-gray-600 dark:hover:border-blue-500' 
                        : isAnswered && index === quizSets[activeQuiz][currentQuestion].correctAnswer 
                        ? 'bg-green-50 border-green-400 shadow-green-100 dark:bg-green-900/30 dark:border-green-500' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => handleSelectAnswer(index)}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                      selectedAnswer === index && index === quizSets[activeQuiz][currentQuestion].correctAnswer 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : selectedAnswer === index && index !== quizSets[activeQuiz][currentQuestion].correctAnswer 
                        ? 'bg-red-500 border-red-500 text-white' 
                        : selectedAnswer === null 
                        ? 'border-gray-300 group-hover:border-blue-400 dark:border-gray-600' 
                        : isAnswered && index === quizSets[activeQuiz][currentQuestion].correctAnswer 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedAnswer === index && index === quizSets[activeQuiz][currentQuestion].correctAnswer && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      {selectedAnswer === index && index !== quizSets[activeQuiz][currentQuestion].correctAnswer && (
                        <XCircle className="h-5 w-5" />
                      )}
                      {isAnswered && index === quizSets[activeQuiz][currentQuestion].correctAnswer && selectedAnswer !== index && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      {!isAnswered && <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>}
                    </div>
                    <span className="flex-grow text-gray-900 dark:text-gray-100 font-medium">{option}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Explanation Card */}
            {showExplanation && quizSets[activeQuiz][currentQuestion].explanation && (
              <Card className="shadow-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation</h4>
                      <p className="text-blue-800 dark:text-blue-200">{quizSets[activeQuiz][currentQuestion].explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
              >
                {currentQuestion < quizSets[activeQuiz].length - 1 ? (
                  <>Next Question <ArrowRight className="ml-2 h-5 w-5" /></>
                ) : (
                  <>Finish Quiz <Trophy className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="text-center pb-4">
              <div className="text-8xl mb-4">{getScoreEmoji()}</div>
              <CardTitle className="text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl">
                <div className="text-6xl font-bold mb-2">{score}/{quizSets[activeQuiz].length}</div>
                <div className="text-xl opacity-90">
                  {Math.round((score / quizSets[activeQuiz].length) * 100)}% Accuracy
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold text-blue-900 dark:text-blue-100">Best Streak</div>
                  <div className="text-2xl font-bold text-blue-600">{bestStreak}</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-semibold text-green-900 dark:text-green-100">Correct Answers</div>
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-semibold text-purple-900 dark:text-purple-100">Completion</div>
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {score === quizSets[activeQuiz].length ? "🎉 Perfect score! You're a master of this subject!" : 
                   score >= quizSets[activeQuiz].length * 0.8 ? "🌟 Excellent work! You've got a great understanding." :
                   score >= quizSets[activeQuiz].length * 0.6 ? "👍 Good job! Keep practicing to improve further." :
                   "📚 Keep studying! Every attempt makes you stronger."}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleRestartQuiz}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Try Again
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      const nextQuizIndex = quizNames.findIndex(q => q.id === activeQuiz) + 1;
                      if (nextQuizIndex < quizNames.length) {
                        handleSwitchQuiz(quizNames[nextQuizIndex].id);
                      }
                    }}
                    variant="outline"
                    size="lg"
                    disabled={quizNames.findIndex(q => q.id === activeQuiz) === quizNames.length - 1}
                    className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Next Quiz
                  </Button>
                </div>
              </div>
              
              {/* Performance Insights */}
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-left">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Questions Attempted:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{quizSets[activeQuiz].length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy Rate:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{Math.round((score / quizSets[activeQuiz].length) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Best Streak:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{bestStreak} questions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quiz Category:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{currentQuizData?.category}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 AI Study Quiz - Powered by intelligent learning algorithms
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Made with ❤️ for learners worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
