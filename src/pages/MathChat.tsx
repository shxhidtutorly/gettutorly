import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Send, Loader2, FileText, Trash2 } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import MathChatHistory from "@/components/features/MathChatHistory";
import MathRenderer from "@/components/features/MathRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Emoji assets
const EMOJI_MATH = "🧮";
const EMOJI_SOLVE = "🟣";
const EMOJI_HISTORY = "📜";
const EMOJI_CLEAR = "🧹";
const EMOJI_ERROR = "❌";
const EMOJI_SUCCESS = "✅";
const EMOJI_EMPTY = "🪐";

// Message interface
interface MathChatMessage {
  id: string;
  problem: string;
  solution: string;
  timestamp: Date;
  isLoading?: boolean;
}

// Utility to filter out <think>...</think> blocks in solutions
const filterSolution = (text: string) =>
  text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

const MathChat = () => {
  const [problem, setProblem] = useState("");
  const [messages, setMessages] = useState<MathChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { trackMathProblemSolved, startSession, endSession } = useStudyTracking();
  const navigate = useNavigate();

  // Solve math via API
  const solveMathProblem = async (mathProblem: string): Promise<string> => {
    const response = await fetch('/api/math-solver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: mathProblem })
    });
    if (!response.ok) throw new Error('Failed to solve math problem');
    const data = await response.json();
    return data.plainSolution;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!problem.trim()) {
      toast({
        variant: "destructive",
        title: `${EMOJI_ERROR} Please enter a math problem`
      });
      return;
    }
    setIsLoading(true);
    startSession();

    const newMessage: MathChatMessage = {
      id: Date.now().toString(),
      problem: problem.trim(),
      solution: "",
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, newMessage]);
    setProblem("");

    try {
      const solution = await solveMathProblem(problem.trim());
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, solution: filterSolution(solution), isLoading: false }
            : msg
        )
      );
      trackMathProblemSolved();
      endSession("math", problem.trim(), true);

      toast({
        title: `${EMOJI_SUCCESS} Problem solved!`,
        description: "Math solution generated successfully."
      });
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      endSession("math", problem.trim(), false);
      toast({
        variant: "destructive",
        title: `${EMOJI_ERROR} Error solving problem`,
        description: "Please try again with a different approach."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear history with confirmation
  const handleClearHistory = () => {
    setMessages([]);
    toast({
      title: `${EMOJI_CLEAR} History cleared!`,
      description: "All previous math problems and solutions have been removed."
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative
      bg-gradient-to-tr from-[#181929] via-[#282a36] to-[#1a233a] dark:from-[#181929] dark:via-[#282a36] dark:to-[#1a233a]
      text-white transition-colors
      overflow-x-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at 70% 20%, rgba(99,102,241,0.14) 0, transparent 70%), radial-gradient(circle at 10% 80%, rgba(236,72,153,0.12) 0, transparent 70%)"
      }}
    >
      {/* Animated floating emoji background */}
      <motion.div
        initial={{ opacity: 0.2, y: 0 }}
        animate={{ opacity: 0.12, y: 30 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        className="fixed z-0 pointer-events-none select-none left-10 top-8 text-7xl"
        aria-hidden
      >{EMOJI_MATH}</motion.div>
      <motion.div
        initial={{ opacity: 0.1, y: 0 }}
        animate={{ opacity: 0.16, y: -40 }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        className="fixed z-0 pointer-events-none select-none right-12 bottom-10 text-8xl"
        aria-hidden
      >{EMOJI_SOLVE}</motion.div>

      <Navbar />

      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-primary shadow-md bg-white/80 dark:bg-gray-900/90 backdrop-blur px-3 py-2 rounded-full animate-fadeIn text-base font-bold"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="ml-1">Back to Dashboard</span>
        </Button>
      </div>

      {/* Clear History Button */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 140 }}
          className="absolute top-4 right-4 z-20"
        >
          <Button
            variant="destructive"
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-full shadow-lg"
            onClick={handleClearHistory}
          >
            <Trash2 className="h-4 w-4" />
            <span>{EMOJI_CLEAR} Clear History</span>
          </Button>
        </motion.div>
      )}

      <main className="flex-1 py-6 px-2 md:px-0 pb-20 md:pb-8 flex flex-col">
        <div className="container max-w-2xl mx-auto">

          {/* Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-7"
          >
            <div className="flex items-center justify-center mb-4 gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 180 }}
              >
                <span className="text-4xl mr-1">{EMOJI_MATH}</span>
              </motion.div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent animate-gradient drop-shadow">
                Math Chat Assistant
              </h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <span className="text-4xl ml-1">{EMOJI_SOLVE}</span>
              </motion.div>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto text-base text-white/70">
              Instantly solve math problems with step-by-step explanations! Type your question and let Tutorly work its magic. {EMOJI_MATH}
            </p>
          </motion.div>

          {/* Input Section */}
          <Card className="mb-7 shadow-2xl border-0 bg-gradient-to-br from-[#363a5a]/70 via-[#282a36]/85 to-[#1a233a]/80 animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-300 tracking-wide flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-400" />
                Enter Your Math Problem
                <span className="ml-1">{EMOJI_MATH}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., Solve for x: 2x + 5 = 15"
                className="min-h-[100px] resize-none border-indigo-400/40 focus:ring-2 focus:ring-indigo-400 transition bg-[#191d2d] text-white"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                autoFocus
              />
              <motion.div
                whileHover={{ scale: (!isLoading && problem.trim()) ? 1.04 : 1 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !problem.trim()}
                  className="w-full flex items-center gap-2 text-lg bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-xl transition font-bold py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Solving...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {EMOJI_SOLVE} Solve Problem
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <div className="space-y-4 mt-2">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white/10 dark:bg-gray-900/60 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-indigo-400" />
                          <span className="font-medium text-indigo-200">Problem:</span>
                          <span className="ml-1">{EMOJI_MATH}</span>
                        </div>
                        <div className="bg-[#232848] dark:bg-[#191d2d] p-3 rounded-lg border border-indigo-900/40">
                          <MathRenderer content={message.problem} />
                        </div>
                      </div>
                      {message.isLoading ? (
                        <motion.div
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                          className="flex items-center gap-2 text-indigo-400"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Solving problem...</span>
                        </motion.div>
                      ) : message.solution && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-4 w-4 text-green-400" />
                            <span className="font-medium text-green-300">Solution:</span>
                            <span className="ml-1">{EMOJI_SUCCESS}</span>
                          </div>
                          <div className="bg-green-900/60 p-3 rounded-lg border border-green-500/20 transition-all shadow whitespace-pre-line font-mono text-green-100 text-base">
                            {message.solution}
                          </div>
                        </motion.div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2 text-right">
                        <span className="text-indigo-300/70">{message.timestamp.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center py-12 text-white/40"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
              >
                <span className="text-7xl">{EMOJI_EMPTY}</span>
              </motion.div>
              <p className="font-bold mt-6 text-2xl">No math problems solved yet.</p>
              <p className="text-base mt-2">Start by entering a problem above and let {EMOJI_MATH} Tutorly wow you!</p>
            </motion.div>
          )}

          {/* History Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <div className="flex items-center gap-2 mb-2 text-indigo-300 font-semibold text-lg">
              <span>{EMOJI_HISTORY}</span> Math Chat History
            </div>
            <MathChatHistory />
          </motion.div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MathChat;
