import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Send, Loader2, Trash2, Sparkles, Wand2 } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import { motion, AnimatePresence } from "framer-motion";

// You will need to install and configure react-katex for this component to work.
// Run: npm install react-katex
// Then, import the CSS at the top of your main app file (e.g., App.js or _app.js):
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';


// --- Type Definitions ---
interface SolutionStepData {
  explanation: string;
  formula: string;
}

interface SolutionData {
  steps: SolutionStepData[];
}

interface MathChatMessage {
  id: string;
  problem: string;
  solution: SolutionData | null; // Updated to handle structured solution
  timestamp: Date;
  isLoading?: boolean;
}

// --- Solution Step Component ---
// A dedicated component to render each step of the AI's solution.
const SolutionStep = ({ step, index }: { step: SolutionStepData; index: number }) => (
  <motion.div
    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-3 transition-all duration-300 hover:bg-gray-800/80 hover:border-green-400/50"
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-black font-bold text-sm shadow-[2px_2px_0px_#22c55e]">
        {index + 1}
      </div>
      <div className="flex-1 overflow-x-auto">
        <p className="text-gray-300 mb-3">{step.explanation}</p>
        {step.formula && (
          <div className="bg-black/50 p-3 rounded-md">
            {/* Using BlockMath to render LaTeX formulas */}
            <BlockMath math={step.formula} />
          </div>
        )}
      </div>
    </div>
  </motion.div>
);


// --- Main MathChat Component ---
const MathChat = () => {
  const [problem, setProblem] = useState("");
  const [messages, setMessages] = useState<MathChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { trackMathProblemSolved, startSession, endSession } = useStudyTracking();
  const { addHistoryEntry, clearHistory } = useHistory('math_chat');
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- API call to the backend math solver ---
  const solveMathProblem = async (mathProblem: string): Promise<SolutionData> => {
    // IMPORTANT: Make sure this endpoint URL is correct for your project setup.
    const response = await fetch('/api/math-solver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: mathProblem })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to solve math problem');
    }
    const data = await response.json();
    // We now expect data.solution which contains the structured steps
    return data.solution;
  };

  // --- Form submission logic ---
  const handleSubmit = async () => {
    const trimmedProblem = problem.trim();
    if (!trimmedProblem) {
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
      problem: trimmedProblem,
      solution: null, // Solution is initially null
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, newMessage]);
    setProblem("");

    try {
      const solutionData = await solveMathProblem(trimmedProblem);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, solution: solutionData, isLoading: false }
            : msg
        )
      );

      // Storing the structured solution as a JSON string in history
      await addHistoryEntry(trimmedProblem, JSON.stringify(solutionData));
      trackMathProblemSolved();
      endSession("math", trimmedProblem, true);

    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      endSession("math", trimmedProblem, false);
      toast({
        variant: "destructive",
        title: `❌ Error solving problem`,
        description: error instanceof Error ? error.message : "An unknown error occurred."
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
  
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-mono" style={{'--glow-color': '#00f7ff'}}>
      {/* Optional: Add a subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3e%3cpath fill='%231f2937' d='M1 1h2v2H1z'%3e%3c/path%3e%3c/svg%3e\")" }}
      ></div>
      
      <Navbar />
      
      <main className="relative flex-1 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-4xl h-full flex flex-col">
          
          {/* --- Header Section --- */}
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
          >
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3 justify-center md:justify-start">
                <Calculator className="w-10 h-10 text-cyan-400" style={{filter: 'drop-shadow(0 0 5px var(--glow-color))'}}/>
                Math Chat
              </h1>
              <p className="text-gray-400 mt-1">Your AI-powered step-by-step math assistant.</p>
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
          <div className="flex-1 w-full h-[60vh] flex flex-col bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700 p-4 overflow-y-auto space-y-6 mb-6 shadow-[8px_8px_0px_#1f2937] rounded-lg">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-grow flex flex-col items-center justify-center text-center text-gray-500"
                >
                  <Wand2 className="w-20 h-20 mb-4 text-cyan-500/50" />
                  <h3 className="text-2xl font-bold text-gray-400">Ready for Magic?</h3>
                  <p>Enter a math problem below to get a step-by-step solution.</p>
                </motion.div>
              ) : (
                messages.map(message => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="space-y-4"
                  >
                    {/* User's Problem */}
                    <div className="flex justify-end group">
                      <div className="max-w-xl w-auto bg-gray-800 p-4 border-2 border-cyan-400 rounded-lg shadow-[4px_4px_0px_#00f7ff] transition-shadow duration-200 group-hover:shadow-[6px_6px_0px_#00f7ff]">
                        <p className="font-bold text-cyan-300 mb-2 text-sm">Your Problem:</p>
                        <div className="text-lg text-white">
                          <InlineMath math={message.problem} />
                        </div>
                      </div>
                    </div>
                    
                    {/* AI's Solution */}
                    <div className="flex justify-start group">
                      <div className="max-w-xl w-auto bg-gray-800 p-4 border-2 border-green-400 rounded-lg shadow-[4px_4px_0px_#22c55e] transition-shadow duration-200 group-hover:shadow-[6px_6px_0px_#22c55e]">
                        <p className="font-bold text-green-300 mb-4 flex items-center gap-2 text-sm"><Sparkles size={16} /> AI Solution:</p>
                        {message.isLoading ? (
                            <div className="flex items-center gap-3 text-yellow-400">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="font-bold">Calculating...</span>
                            </div>
                        ) : message.solution && (
                           <motion.div variants={containerVariants} initial="hidden" animate="visible">
                              {message.solution.steps.map((step, index) => (
                                <SolutionStep key={index} step={step} index={index} />
                              ))}
                           </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={chatEndRef} />
            </AnimatePresence>
          </div>

          {/* --- Input Form --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-stretch gap-2">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., Solve 2x^2 + 5x - 3 = 0"
                className="flex-grow min-h-[60px] resize-none bg-gray-900 border-2 border-gray-600 focus:border-cyan-400 focus:ring-0 rounded-md text-white text-lg p-4 transition-colors shadow-inner"
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
                className="h-auto bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-md font-black text-lg transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:border-gray-600 disabled:shadow-none shadow-[4px_4px_0px_#00f7ff] hover:shadow-[6px_6px_0px_#00f7ff] px-6 flex items-center justify-center"
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
