import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import FloatingActions from "@/components/ui/floating-actions";
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  Mic, 
  Globe,
  Menu,
  X,
  FileText,
  Brain,
  Zap,
  HelpCircle,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  Home,
  Headphones,
  Calculator,
  StickyNote,
  TestTube,
  Upload,
  Sparkles,
  Focus,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: File[];
}

const FuturisticDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [claudeModel, setClaudeModel] = useState<'claude-3' | 'claude-instant'>('claude-3');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Home", route: "/dashboard", emoji: "🏠" },
    { id: "chat", icon: Bot, label: "Claude AI", route: "/chat", emoji: "🤖" },
    { id: "calendar", icon: Calendar, label: "Calendar", route: "/study-plans", emoji: "📅" },
    { id: "flashcards", icon: Zap, label: "Flashcards", route: "/flashcards", emoji: "⚡" },
    { id: "quiz", icon: TestTube, label: "Tests & Quiz", route: "/quiz", emoji: "🧪" },
    { id: "notes", icon: StickyNote, label: "AI Notes", route: "/ai-notes", emoji: "📝" },
    { id: "math", icon: Calculator, label: "Math Solver", route: "/math-chat", emoji: "🔢" },
    { id: "audio", icon: Headphones, label: "Audio Recap", route: "/audio-notes", emoji: "🎧" },
    { id: "library", icon: BookOpen, label: "Library", route: "/library", emoji: "📚" },
    { id: "insights", icon: BarChart3, label: "Insights", route: "/progress", emoji: "📊" },
    { id: "brain", icon: Brain, label: "Doubt Chain", route: "/doubt-chain", emoji: "🧠" },
    { id: "settings", icon: Settings, label: "Settings", route: "/profile", emoji: "⚙️" },
  ];

  const quickActions = [
    "Explain Concepts",
    "Create Quiz", 
    "Summarize Document",
    "Generate Notes"
  ];

  const placeholderTexts = [
    "Ask me about photosynthesis...",
    "Upload your doc for instant flashcards",
    "Need help with calculus?",
    "Want to create a study guide?"
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: "Hello! I'm Claude, your AI study companion. I can help you with:\n\n• 📚 **Explaining complex concepts**\n• 📝 **Creating notes and summaries**\n• ❓ **Generating quizzes**\n• 🔍 **Researching topics**\n• 📄 **Analyzing documents**\n\nWhat would you like to learn about today?",
        role: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Student';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        "Great question! Let me break this down for you step by step...",
        "I'd be happy to help you understand this concept better!",
        "Here's what I think about your question...",
        "Let me explain this in a way that's easy to understand!",
        "Excellent question! This is actually a fascinating topic..."
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready to analyze`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#16213e]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-medium">Loading Tutorly...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#16213e]">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
        >
          <div className="w-16 h-16 text-purple-400 mx-auto mb-4">🚀</div>
          <h2 className="text-3xl font-bold mb-4 text-white">Welcome to Tutorly</h2>
          <p className="text-white/80 text-lg mb-6">Your AI-powered learning companion awaits</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#16213e] text-white flex relative overflow-hidden">
      {/* Animated Background */}
      {!focusModeEnabled && (
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, rgba(139, 69, 173, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(108, 92, 231, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(52, 152, 219, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full opacity-50"
          />
        </div>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${
              isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"
            } w-80 bg-black/20 backdrop-blur-xl border-r border-white/10`}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">T</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Tutorly
                    </h1>
                  </div>
                </div>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              {/* User Profile */}
              <div className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 p-4">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      navigate(item.route);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5 group"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </nav>
            </ScrollArea>

            {/* AI Settings */}
            <div className="p-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Web Search
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    webSearchEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute w-4 h-4 bg-white rounded-full top-0.5"
                    animate={{ x: webSearchEnabled ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Focus className="w-4 h-4" />
                  Focus Mode
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFocusModeEnabled(!focusModeEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    focusModeEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute w-4 h-4 bg-white rounded-full top-0.5"
                    animate={{ x: focusModeEnabled ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Claude Model</span>
                <select
                  value={claudeModel}
                  onChange={(e) => setClaudeModel(e.target.value as 'claude-3' | 'claude-instant')}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
                >
                  <option value="claude-3">Claude 3</option>
                  <option value="claude-instant">Claude Instant</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <motion.div
                animate={focusModeEnabled ? {} : { 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <Avatar className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-white/20">
                  <AvatarFallback>
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"
                />
              </motion.div>
              <div>
                <h2 className="text-lg font-semibold text-white">Claude AI</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-400">● Online</span>
                  {webSearchEnabled && (
                    <Badge variant="outline" className="text-xs border-purple-400 text-purple-400">
                      <Globe className="w-3 h-3 mr-1" />
                      Web Search
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right hidden md:block">
              <p className="text-sm text-white">Welcome back, {getUserDisplayName()}!</p>
              <p className="text-xs text-gray-400">Ready to learn?</p>
            </div>
          </div>
        </div>

        {/* AI Orb Visualization (Desktop only) */}
        {!focusModeEnabled && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-24 right-8 z-20 pointer-events-none"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
            >
              <Brain className="w-16 h-16 text-white/80" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-3 md:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Avatar className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-blue-500 border border-white/20 shadow-lg">
                        <AvatarFallback>
                          <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 md:px-6 py-3 md:py-4 backdrop-blur-sm border ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white border-white/20'
                        : 'bg-black/30 text-gray-100 border-white/10'
                    } shadow-lg`}
                  >
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                        {message.content}
                      </p>
                    </div>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs bg-white/10 rounded-lg p-2">
                            <FileText className="w-4 h-4" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </motion.div>

                  {message.role === 'user' && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Avatar className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-teal-500 border border-white/20 shadow-lg">
                        <AvatarFallback>
                          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Animation */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 md:gap-4 justify-start"
              >
                <Avatar className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-blue-500 border border-white/20">
                  <AvatarFallback>
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4">
                  <div className="flex space-x-2">
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Claude is thinking...</p>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl p-4 md:p-6 pb-safe">
          {/* File Upload Preview */}
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 space-y-2"
            >
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Input Controls */}
          <div className="flex items-end space-x-2 md:space-x-3">
            <div className="flex-1 space-y-2">
              <Input
                placeholder={placeholderTexts[currentPlaceholder]}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="bg-white/5 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/25 rounded-xl min-h-[44px] md:min-h-[50px] resize-none"
              />
            </div>
            
            <div className="flex space-x-1 md:space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm h-[44px] md:h-auto"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm h-[44px] md:h-auto"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputMessage.trim() && uploadedFiles.length === 0)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white min-w-[44px] min-h-[44px] md:min-w-[50px] md:min-h-[50px] rounded-xl shadow-lg border-0"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions - Hidden on mobile to save space */}
          {!isMobile && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <motion.div key={action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(action)}
                    className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white text-xs backdrop-blur-sm"
                  >
                    {action}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Actions */}
      <FloatingActions />
    </div>
  );
};

export default FuturisticDashboard;
