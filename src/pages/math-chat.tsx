
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHistory } from "@/hooks/useHistory";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { CodeBlock, parseCodeBlocks } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Bot,
  Play,
  Copy,
  Check,
  RefreshCw,
  Send,
  Loader2,
  Scissors,
  LayoutDashboard,
  Settings,
  BookOpenCheck,
  MessageSquare,
  LucideIcon,
  BrainCircuit,
  Lightbulb,
  FileCode2,
  ListChecks,
  StickyNote,
  LayoutList,
  PencilRuler,
  XCircle,
  Save,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  TextQuote,
  Terminal,
  Image,
  Video,
  File,
  Link,
  Code,
  Calculator
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import MathChatHistory from "@/components/features/MathChatHistory";

interface ChatMessageData {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isCanvas?: boolean;
}

// Simple History component
const History = ({ history }: { history: any[] }) => (
  <Card className="bg-[#121212] border-slate-700">
    <CardHeader>
      <CardTitle className="text-white text-lg">History</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">No history yet</p>
        ) : (
          history.slice(0, 5).map((entry, index) => (
            <div key={index} className="p-2 bg-[#1a1a1a] rounded text-sm">
              <div className="text-gray-300 truncate">{entry.input}</div>
              <div className="text-gray-500 text-xs mt-1">{entry.timestamp}</div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

// Simple ChatMessage component
const ChatMessage = ({ message }: { message: ChatMessageData }) => (
  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[80%] p-3 rounded-lg ${
      message.isUser 
        ? 'bg-purple-600 text-white' 
        : 'bg-[#1a1a1a] text-gray-300'
    }`}>
      <div className="text-sm">{message.text}</div>
      <div className="text-xs opacity-60 mt-1">{message.timestamp}</div>
    </div>
  </div>
);

// Simple PromptInputBox component
const PromptInputBox = ({ 
  onSend, 
  isLoading 
}: { 
  onSend: (message: string) => void;
  isLoading: boolean;
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a math question..."
        className="flex-1 bg-[#1a1a1a] border-slate-700 text-white"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={!input.trim() || isLoading}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};

const MathChat = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { history, addHistoryEntry } = useHistory('math');
  const { trackMathProblemSolved } = useStudyTracking();

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiResponse: ChatMessageData = {
          id: (Date.now() + 1).toString(),
          text: `Here's the solution to your math problem: ${message}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
        trackMathProblemSolved();
        addHistoryEntry(message, aiResponse.text);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to get response");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <BackToDashboardButton variant="outline" />
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Calculator className="h-8 w-8 text-purple-400" />
              Math Chat
            </h1>
            <p className="text-gray-400">Get help with your math problems</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Chat Interface */}
            <div className="flex-1">
              <Card className="bg-[#121212] border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Chat</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      History
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px] flex flex-col">
                  <ScrollArea className="flex-1 mb-4">
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-[#1a1a1a] p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking...
                          </div>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">
                        {error}
                      </div>
                    )}
                  </ScrollArea>

                  <PromptInputBox onSend={sendMessage} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>

            {/* History Sidebar */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="w-full md:w-96"
                >
                  <History history={history} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <MathChatHistory />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MathChat;
