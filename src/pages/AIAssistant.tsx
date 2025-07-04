import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { firebaseSecure } from "@/lib/firebase-secure";
import { Send, Paperclip, Mic, Sparkles, FileText, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [user] = useAuthState(auth);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const { toast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Load sessions on mount
  useEffect(() => {
    if (user?.uid) {
      loadSessions();
    }
  }, [user?.uid]);

  const loadSessions = async () => {
    try {
      const sessionData = await firebaseSecure.secureQuery(`ai_sessions/${user?.uid}/chats`);
      const loadedSessions = sessionData.map((session: any) => ({
        ...session,
        createdAt: session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt),
        updatedAt: session.updatedAt?.toDate ? session.updatedAt.toDate() : new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
        }))
      }));
      setSessions(loadedSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      
      if (loadedSessions.length > 0 && !activeSessionId) {
        setActiveSession(loadedSessions[0].id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createNewSession = async () => {
    if (!user?.uid) return;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat Session ${sessions.length + 1}`,
      messages: [{
        role: 'assistant',
        content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?',
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await firebaseSecure.secureAdd(`ai_sessions/${user.uid}/chats`, newSession);
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession.id);
      
      toast({
        title: "New chat session created",
        description: "Ready to help with your studies!"
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive"
      });
    }
  };

  const setActiveSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const saveSession = async () => {
    if (!user?.uid || !activeSessionId) return;

    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;

    const updatedSession = {
      ...session,
      messages: messages,
      updatedAt: new Date()
    };

    try {
      await firebaseSecure.secureWrite(`ai_sessions/${user.uid}/chats/${activeSessionId}`, updatedSession);
      setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingFile(true);
    setUploadedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      // Add document context as a hidden system message
      const docMessage: Message = {
        role: 'system',
        content: `Document uploaded: ${file.name}\n\nContent for reference:\n${fullText}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, docMessage]);

      toast({
        title: "PDF uploaded successfully",
        description: `${file.name} is now available for reference`
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error processing PDF",
        description: "Failed to extract text from the document",
        variant: "destructive"
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    const currentInput = input.trim();
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Dynamic AI status messages
    const statusMessages = ['Thinking...', 'Processing...', 'Analyzing...', 'Searching...'];
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      setAiStatus(statusMessages[statusIndex % statusMessages.length]);
      statusIndex++;
    }, 1000);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, model: 'gemini' })
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      const aiResponse = data.response || data.message || 'No response received from AI';
      
      const aiMessage: Message = { role: 'assistant', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-save session
      setTimeout(saveSession, 500);
    } catch (error) {
      let errorMessage = "I'm having trouble connecting right now. ";
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage += "I'm a bit busy right now. Please try again in a moment.";
        } else {
          errorMessage += "Please try again or contact support if this continues.";
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date() }]);
    } finally {
      clearInterval(statusInterval);
      setIsLoading(false);
      setAiStatus('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create first session if none exist
  useEffect(() => {
    if (user?.uid && sessions.length === 0 && !activeSessionId) {
      createNewSession();
    }
  }, [user?.uid, sessions.length, activeSessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0f2e] to-[#0a0a0a] flex flex-col">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-center py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            AI Study Assistant
          </h1>
        </div>
      </motion.div>

      {/* File Upload Status */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4 p-3 rounded-lg bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-green-300 font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-green-400/70">Document uploaded successfully</p>
              </div>
              <Check className="h-5 w-5 text-green-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.filter(msg => msg.role !== 'system').map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                      : 'bg-gradient-to-r from-[#1e1e2e] to-[#2a2a3e] text-gray-100 border border-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* AI Status */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="max-w-[70%] p-4 rounded-2xl bg-gradient-to-r from-[#1e1e2e] to-[#2a2a3e] border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-purple-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-blue-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm text-gray-300">{aiStatus}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#1a0f2e]/90 to-transparent p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <motion.div
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#1e1e2e] to-[#2a2a3e] border border-gray-700 focus-within:border-transparent"
              whileFocus={{
                boxShadow: "0 0 0 2px rgba(167, 139, 250, 0.3), 0 0 20px rgba(167, 139, 250, 0.2)"
              }}
            >
              {/* Rainbow glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 focus-within:opacity-100"
                style={{
                  background: "linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)",
                  backgroundSize: "300% 300%"
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <div className="relative flex items-center bg-[#1e1e2e] rounded-full m-[1px]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 py-4 px-6 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none"
                  style={{
                    minHeight: '56px',
                    maxHeight: '120px',
                    overflowY: input.length > 100 ? 'auto' : 'hidden'
                  }}
                />
                
                {/* Upload button */}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFile}
                  className="p-3 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isProcessingFile ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Paperclip className="h-5 w-5" />
                  )}
                </motion.button>
                
                {/* Mic button */}
                <motion.button
                  className="p-3 text-gray-400 hover:text-blue-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mic className="h-5 w-5" />
                </motion.button>
                
                {/* Send button */}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-3 mr-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-xs text-gray-500 text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Upload documents • Ask questions • Get instant help
          </motion.p>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AIAssistant;
