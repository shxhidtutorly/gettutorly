
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Upload, 
  FileText,
  Brain,
  Zap,
  Globe,
  Settings,
  Paperclip,
  Mic,
  Image as ImageIcon,
  X,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: File[];
  isMarkdown?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

const AnimeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [animeMode, setAnimeMode] = useState(true);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: "Hi! I'm Claude, your AI study companion! 🌟 I can help you with:\n\n• 📚 Explaining complex concepts\n• 📝 Creating notes and summaries\n• ❓ Generating quizzes\n• 🔍 Researching topics\n• 📄 Analyzing documents\n\nWhat would you like to learn about today?",
        role: 'assistant',
        timestamp: new Date(),
        isMarkdown: true
      }]);
    }
  }, []);

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
      // Simulate API call to Claude
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        "That's a great question! Let me break this down for you step by step... 🤔",
        "I'd be happy to help you understand this concept better! ✨",
        "Here's what I think about your question... 🧠",
        "Let me explain this in a way that's easy to understand! 📚",
        "Excellent question! This is actually a fascinating topic... 🌟"
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date(),
        isMarkdown: true
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

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Chat ${chatSessions.length + 1}`,
      lastMessage: "New conversation",
      timestamp: new Date(),
      messageCount: 0
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const floatingEmojis = ['✨', '📚', '⚡', '🧠', '🌟', '💡', '🎯', '🚀'];

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Floating Emojis Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {floatingEmojis.map((emoji, index) => (
          <motion.div
            key={emoji + index}
            className="absolute text-2xl opacity-30"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Chat Sessions Sidebar */}
      <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col relative z-10">
        <div className="p-4 border-b border-slate-700">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={createNewSession}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </motion.div>
          
          <div className="flex items-center justify-between mt-4">
            <h3 className="text-sm font-medium text-gray-300">Recent Chats</h3>
            <Badge variant="outline" className="text-xs">
              {chatSessions.length}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {chatSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentSessionId(session.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  currentSessionId === session.id
                    ? "bg-purple-600/20 border border-purple-500/50"
                    : "bg-slate-700/50 hover:bg-slate-700/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {session.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {session.messageCount}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Settings Panel */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Web Search</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isWebSearchEnabled ? 'bg-purple-600' : 'bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute w-4 h-4 bg-white rounded-full top-0.5"
                animate={{ x: isWebSearchEnabled ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Anime Mode</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnimeMode(!animeMode)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                animeMode ? 'bg-purple-600' : 'bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute w-4 h-4 bg-white rounded-full top-0.5"
                animate={{ x: animeMode ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Chat Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: animeMode ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Avatar className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500">
                  <AvatarFallback>
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                {animeMode && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800"
                  />
                )}
              </motion.div>
              <div>
                <h2 className="text-lg font-semibold text-white">Claude AI</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-400">● Online</span>
                  {isWebSearchEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      Web Search
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Anime Character Display */}
        {animeMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 right-8 z-20 pointer-events-none"
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
              className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Brain className="w-16 h-16 text-white" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-yellow-900" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Avatar className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                        <AvatarFallback>
                          <Bot className="w-5 h-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-slate-800/70 backdrop-blur-sm text-gray-100 border border-slate-700'
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                        {message.content}
                      </p>
                    </div>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs bg-slate-700/50 rounded-lg p-2">
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
                      <Avatar className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 shadow-lg">
                        <AvatarFallback>
                          <User className="w-5 h-5 text-white" />
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
                className="flex gap-4 justify-start"
              >
                <Avatar className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500">
                  <AvatarFallback>
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-2xl px-6 py-4">
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
        <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
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
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
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
          <div className="flex items-end space-x-3">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Ask Claude anything... or upload a document to analyze"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/25 rounded-xl min-h-[50px] resize-none"
              />
            </div>
            
            <div className="flex space-x-2">
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
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputMessage.trim() && uploadedFiles.length === 0)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white min-w-[50px] min-h-[50px] rounded-xl shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['Explain Concepts', 'Create Quiz', 'Summarize Document', 'Generate Notes'].map((action) => (
              <motion.div key={action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(action)}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white text-xs"
                >
                  {action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeChat;
