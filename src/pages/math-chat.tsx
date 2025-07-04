
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Send, Loader2, FileText, Trash2, History, Eye, EyeOff } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import MathRenderer from "@/components/features/MathRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EMOJI_MATH = "🧮";
const EMOJI_SOLVE = "🟣";
const EMOJI_HISTORY = "📜";
const EMOJI_CLEAR = "🧹";
const EMOJI_ERROR = "❌";
const EMOJI_SUCCESS = "✅";
const EMOJI_EMPTY = "🪐";

interface MathChatMessage {
  id: string;
  problem: string;
  solution: string;
  timestamp: Date;
  isLoading?: boolean;
}

const filterSolution = (text: string) =>
  text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

const MathChat = () => {
  const [problem, setProblem] = useState("");
  const [messages, setMessages] = useState<MathChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const { trackMathProblemSolved, startSession, endSession } = useStudyTracking();
  const { history, addHistoryEntry, clearHistory } = useHistory('math_chat');
  const navigate = useNavigate();

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
    const currentProblem = problem.trim();
    setProblem("");

    try {
      const solution = await solveMathProblem(currentProblem);
      const filteredSolution = filterSolution(solution);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, solution: filteredSolution, isLoading: false }
            : msg
        )
      );

      // Add to history
      await addHistoryEntry(currentProblem, filteredSolution);

      trackMathProblemSolved();
      endSession("math", currentProblem, true);

      toast({
        title: `${EMOJI_SUCCESS} Problem solved!`,
        description: "Math solution generated successfully."
      });
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      endSession("math", currentProblem, false);
      toast({
        variant: "destructive",
        title: `${EMOJI_ERROR} Error solving problem`,
        description: "Please try again with a different approach."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
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
        className="fixed z-0 pointer-events-none select-none left-4 md:left-10 top-8 text-4xl md:text-7xl"
        aria-hidden
      >{EMOJI_MATH}</motion.div>
      <motion.div
        initial={{ opacity: 0.1, y: 0 }}
        animate={{ opacity: 0.16, y: -40 }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        className="fixed z-0 pointer-events-none select-none right-4 md:right-12 bottom-10 text-5xl md:text-8xl"
        aria-hidden
      >{EMOJI_SOLVE}</motion.div>

      {/* Top Buttons Row */}
      <div className="w-full flex justify-between items-center absolute top-4 left-0 px-4 z-20">
        {/* Back to Dashboard Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-white shadow-md bg-white/10 dark:bg-white/10 backdrop-blur px-3 py-2 rounded-full animate-fadeIn text-sm md:text-base font-bold"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline ml-1">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* History and Clear Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-white font-bold px-3 py-2 rounded-full shadow-lg text-sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{showHistory ? 'Hide' : 'Show'} History</span>
            <span className="sm:hidden">{EMOJI_HISTORY}</span>
          </Button>
          
          <Button
            variant="destructive"
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-3 py-2 rounded-full shadow-lg text-sm"
            onClick={handleClearHistory}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{EMOJI_CLEAR} Clear</span>
            <span className="sm:hidden">{EMOJI_CLEAR}</span>
          </Button>
        </div>
      </div>

      <main className="flex-1 py-6 px-2 md:px-0 pb-20 md:pb-8 flex flex-col">
        <div className="container max-w-2xl mx-auto">
          {/* Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 md:mb-7 mt-16 md:mt-12"
          >
            <div className="flex items-center justify-center mb-4 gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 180 }}
              >
                <span className="text-2xl md:text-4xl mr-1">{EMOJI_MATH}</span>
              </motion.div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-sm">
                Math Chat Assistant
              </h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <span className="text-2xl md:text-4xl ml-1">{EMOJI_SOLVE}</span>
              </motion.div>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base text-white/70 px-4">
              Instantly solve math problems with step-by-step explanations! Type your question and let Tutorly work its magic. {EMOJI_MATH}
            </p>
          </motion.div>

          {/* Input Section */}
          <Card className="mb-6 md:mb-7 shadow-2xl border-0 bg-gradient-to-br from-[#363a5a]/70 via-[#282a36]/85 to-[#1a233a]/80 animate-fadeIn">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-indigo-300 tracking-wide flex items-center gap-2">
                <Calculator className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                Enter Your Math Problem
                <span className="ml-1">{EMOJI_MATH}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., Solve for x: 2x + 5 = 15"
                className="min-h-[80px] md:min-h-[100px] resize-none border-indigo-400/40 focus:ring-2 focus:ring-indigo-400 transition bg-[#191d2d] text-white text-sm md:text-base"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                autoFocus
              />
              <motion.div
                whileHover={{ scale: (!isLoading && problem.trim()) ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !problem.trim()}
                  className="w-full flex items-center gap-2 text-base md:text-lg bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-xl transition font-bold py-2 md:py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      Solving...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 md:h-5 md:w-5" />
                      {EMOJI_SOLVE} Solve Problem
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* History Toggle Section */}
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-300 text-base md:text-lg flex items-center gap-2">
                    <History className="h-4 w-4 md:h-5 md:w-5" />
                    Recent History ({history.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto space-y-2">
                  {history.slice(0, 5).map((entry, idx) => (
                    <div key={entry.id} className="p-3 bg-blue-950/30 rounded-lg border border-blue-800/50">
                      <p className="text-blue-200 text-xs md:text-sm font-medium mb-1">
                        Problem: {entry.input}
                      </p>
                      <p className="text-blue-100 text-xs opacity-75 truncate">
                        Solution: {entry.output.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

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
                    <CardContent className="p-4 md:p-5">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-indigo-400" />
                          <span className="font-medium text-indigo-200 text-sm md:text-base">Problem:</span>
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
                          <span className="text-sm md:text-base">Solving problem...</span>
                        </motion.div>
                      ) : message.solution && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-4 w-4 text-green-400" />
                            <span className="font-medium text-green-300 text-sm md:text-base">Solution:</span>
                            <span className="ml-1">{EMOJI_SUCCESS}</span>
                          </div>
                          <div className="bg-green-900/60 p-3 rounded-lg border border-green-500/20 transition-all shadow whitespace-pre-line font-mono text-green-100 text-sm md:text-base">
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
              className="text-center py-8 md:py-12 text-white/40"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
              >
                <span className="text-4xl md:text-7xl">{EMOJI_EMPTY}</span>
              </motion.div>
              <p className="font-bold mt-4 md:mt-6 text-lg md:text-2xl">No math problems solved yet.</p>
              <p className="text-sm md:text-base mt-2">Start by entering a problem above and let {EMOJI_MATH} Tutorly wow you!</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MathChat;
