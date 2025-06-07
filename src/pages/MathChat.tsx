import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, Send, Loader2, FileText } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import MathChatHistory from "@/components/features/MathChatHistory";
import MathRenderer from "@/components/features/MathRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
        title: "Please enter a math problem"
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
        title: "Problem solved!",
        description: "Math solution generated successfully."
      });
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      endSession("math", problem.trim(), false);
      toast({
        variant: "destructive",
        title: "Error solving problem",
        description: "Please try again with a different approach."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 text-black dark:text-white transition-colors">
      <Navbar />

      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-primary shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur px-3 py-2 rounded-full animate-fadeIn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <main className="flex-1 py-6 px-2 md:px-0 pb-20 md:pb-8">
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
                <Calculator className="h-8 w-8 text-indigo-500 drop-shadow" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                Math Chat Assistant
              </h1>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Solve math problems instantly. Type your question and get a detailed answer!
            </p>
          </motion.div>

          {/* Input Section */}
          <Card className="mb-7 shadow-lg border-0 animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-600 tracking-wide">
                Enter Your Math Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g., Solve for x: 2x + 5 = 15"
                className="min-h-[100px] resize-none border-indigo-300 focus:ring-2 focus:ring-indigo-400 transition"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <motion.div
                whileHover={{ scale: (!isLoading && problem.trim()) ? 1.03 : 1 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !problem.trim()}
                  className="w-full flex items-center gap-2 text-lg bg-indigo-500 hover:bg-indigo-600 transition"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  Solve Problem
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
                <Card className="border-0 shadow-md hover:shadow-xl transition-all bg-white/90 dark:bg-gray-900/60">
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Problem:</span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
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
                          <Calculator className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Solution:</span>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-100 dark:border-green-900 transition-all shadow">
                          <MathRenderer content={message.solution} />
                        </div>
                      </motion.div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2 text-right">
                      {message.timestamp.toLocaleString()}
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
              className="text-center py-12 text-muted-foreground"
            >
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No math problems solved yet. Start by entering a problem above!</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
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
