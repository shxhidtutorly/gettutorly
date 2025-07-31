import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Send, Loader2, FileText, Trash2, History, Eye, EyeOff, Sparkles } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import MathRenderer from "@/components/features/MathRenderer"; // Assuming this component renders math correctly
import { motion, AnimatePresence } from "framer-motion";

// --- Neon Brutalist UI Configuration ---
const neonColors = {
  cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff] hover:shadow-[6px_6px_0px_#00f7ff]',
  green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e] hover:shadow-[6px_6px_0px_#22c55e]',
  pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899] hover:shadow-[6px_6px_0px_#ec4899]',
  yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15] hover:shadow-[6px_6px_0px_#facc15]',
};

interface MathChatMessage {
  id: string;
  problem: string;
  solution: string;
  timestamp: Date;
  isLoading?: boolean;
}

// --- Helper function to filter out thought processes from the model's response ---
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

  // --- API call to the backend math solver ---
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

  // --- Form submission logic ---
  const handleSubmit = async () => {
    if (!problem.trim()) {
      toast({
        variant: "destructive",
        title: `❌ Please enter a math problem`
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

      await addHistoryEntry(currentProblem, filteredSolution);
      trackMathProblemSolved();
      endSession("math", currentProblem, true);

      toast({
        title: `✅ Problem solved!`,
        description: "Math solution generated successfully."
      });
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      endSession("math", currentProblem, false);
      toast({
        variant: "destructive",
        title: `❌ Error solving problem`,
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
      title: `🧹 History cleared!`,
      description: "All math problems and solutions have been removed."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-mono">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          
          {/* --- Header Section --- */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
          >
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3">
                <Calculator className="w-10 h-10 text-cyan-400" />
                Math Chat
              </h1>
              <p className="text-gray-400 mt-1">Your AI-powered math solving assistant.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate("/dashboard")} className="bg-gray-800 text-white border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500 rounded-none font-bold transition-all duration-200 shadow-[4px_4px_0px_#4b5563] hover:shadow-[6px_6px_0px_#6b7280]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleClearHistory} className="bg-gray-800 text-white border-2 border-pink-500 hover:bg-pink-900/50 hover:border-pink-400 rounded-none font-bold transition-all duration-200 shadow-[4px_4px_0px_#ec4899] hover:shadow-[6px_6px_0px_#ec4899]">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* --- Chat Area --- */}
          <div className="w-full h-[60vh] flex flex-col bg-gray-900 border-2 border-gray-700 p-4 overflow-y-auto space-y-6 mb-6 shadow-[8px_8px_0px_#1f2937]">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-grow flex flex-col items-center justify-center text-center text-gray-500"
                >
                  <Calculator className="w-20 h-20 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-400">Ready to Solve</h3>
                  <p>Enter a math problem below to get started.</p>
                </motion.div>
              ) : (
                messages.map(message => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* User's Problem */}
                    <div className="flex justify-end">
                      <div className={`max-w-xl w-auto bg-gray-800 p-4 border-2 rounded-none ${neonColors.cyan}`}>
                        <p className="font-bold text-white mb-2 flex items-center gap-2"><FileText size={16}/> Your Problem:</p>
                        <div className="text-lg text-white">
                          <MathRenderer content={message.problem} />
                        </div>
                      </div>
                    </div>
                    
                    {/* AI's Solution */}
                    {message.isLoading ? (
                      <div className="flex justify-start mt-4">
                        <div className="max-w-xl w-auto bg-gray-800 p-4 border-2 border-dashed border-yellow-400 flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                          <span className="font-bold text-yellow-400">Calculating solution...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start mt-4">
                        <div className={`max-w-xl w-auto bg-gray-800 p-4 border-2 rounded-none ${neonColors.green}`}>
                          <p className="font-bold text-white mb-2 flex items-center gap-2"><Sparkles size={16} className="text-green-400" /> AI Solution:</p>
                          <div className="whitespace-pre-wrap text-green-300">
                            <MathRenderer content={message.solution} />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* --- Input Form --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., Find the integral of x^2 from 0 to 1"
                className="flex-grow min-h-[60px] resize-none bg-gray-900 border-2 border-gray-600 focus:border-cyan-400 focus:ring-0 rounded-none text-white text-lg p-4 transition-colors"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                autoFocus
              />
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !problem.trim()}
                className="h-[60px] bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black text-lg transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:border-gray-600 disabled:shadow-none shadow-[4px_4px_0px_#00f7ff] hover:shadow-[6px_6px_0px_#00f7ff] px-6"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MathChat;
