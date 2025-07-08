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
  Math as MathIcon
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { MathInput } from "@/components/features/MathInput";
import { MathDisplay } from "@/components/features/MathDisplay";
import { History } from "@/components/features/History";
import { ChatMessage } from "@/components/features/ChatMessage";
import { PromptInputBox } from "@/components/features/PromptInputBox";

interface ChatMessageData {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isCanvas?: boolean;
}

const MathChat = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasCode, setCanvasCode] = useState("");
  const [isCanvasThinking, setIsCanvasThinking] = useState(false);
  const [mathInput, setMathInput] = useState("");
  const [mathOutput, setMathOutput] = useState("");
  const [showMath, setShowMath] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [imageOutput, setImageOutput] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoOutput, setVideoOutput] = useState("");
  const [showFile, setShowFile] = useState(false);
  const [fileOutput, setFileOutput] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [linkOutput, setLinkOutput] = useState("");
  const [showMathInput, setShowMathInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showTerminalInput, setShowTerminalInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showMathOutput, setShowMathOutput] = useState(false);
  const [showCodeOutput, setShowCodeOutput] = useState(false);
  const [showTerminalOutput, setShowTerminalOutput] = useState(false);
  const [showImageOutput, setShowImageOutput] = useState(false);
  const [showVideoOutput, setShowVideoOutput] = useState(false);
  const [showFileOutput, setShowFileOutput] = useState(false);
  const [showLinkOutput, setShowLinkOutput] = useState(false);
  const [showMathHistory, setShowMathHistory] = useState(false);
  const [showCodeHistory, setShowCodeHistory] = useState(false);
  const [showTerminalHistory, setShowTerminalHistory] = useState(false);
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [showVideoHistory, setShowVideoHistory] = useState(false);
  const [showFileHistory, setShowFileHistory] = useState(false);
  const [showLinkHistory, setShowLinkHistory] = useState(false);
  const [showMathSettings, setShowMathSettings] = useState(false);
  const [showCodeSettings, setShowCodeSettings] = useState(false);
  const [showTerminalSettings, setShowTerminalSettings] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [showFileSettings, setShowFileSettings] = useState(false);
  const [showLinkSettings, setShowLinkSettings] = useState(false);
  const [mathSettings, setMathSettings] = useState({});
  const [codeSettings, setCodeSettings] = useState({});
  const [terminalSettings, setTerminalSettings] = useState({});
  const [imageSettings, setImageSettings] = useState({});
  const [videoSettings, setVideoSettings] = useState({});
  const [fileSettings, setFileSettings] = useState({});
  const [linkSettings, setLinkSettings] = useState({});
  const [mathHistory, setMathHistory] = useState([]);
  const [codeHistory, setCodeHistory] = useState([]);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [imageHistory, setImageHistory] = useState([]);
  const [videoHistory, setVideoHistory] = useState([]);
  const [fileHistory, setFileHistory] = useState([]);
  const [linkHistory, setLinkHistory] = useState([]);
  const { history, addHistoryEntry } = useHistory('math');
  const { trackMathProblemSolved } = useStudyTracking();

  const sendMessage = async (message: string, files?: File[], options?: { isCanvas?: boolean; isThinking?: boolean; }) => {
    if (!message.trim() && !files?.length) return;

    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      isCanvas: options?.isCanvas || false
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setError(null);
    setIsThinking(true);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiResponse: ChatMessageData = {
          id: Date.now().toString(),
          text: `AI response to: ${message}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsThinking(false);
        trackMathProblemSolved();
        addHistoryEntry(message, aiResponse.text);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to get response");
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <BackToDashboardButton variant="outline" />
            <h1 className="text-3xl font-bold mb-2">Math Chat</h1>
            <p className="text-gray-400">Interact with AI for math help</p>
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
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px] flex flex-col">
                  <ScrollArea className="flex-1 mb-4">
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isThinking && (
                      <div className="animate-pulse text-gray-400">
                        Thinking...
                      </div>
                    )}
                    {error && <div className="text-red-500">{error}</div>}
                  </ScrollArea>

                  <PromptInputBox
                    onSend={sendMessage}
                    isLoading={isLoading}
                    messages={messages}
                    setMessages={setMessages}
                    isThinking={isThinking}
                    setIsThinking={setIsThinking}
                  />
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
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MathChat;
