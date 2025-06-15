
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Send, 
  Globe, 
  BookOpen, 
  Folder,
  Lightbulb,
  FileText,
  Search,
  GraduationCap,
  Bot,
  User,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickActions = [
  { icon: Lightbulb, label: 'Explain Concepts', color: 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30' },
  { icon: FileText, label: 'Summarize', color: 'bg-green-600/20 hover:bg-green-600/30 border-green-500/30' },
  { icon: Search, label: 'Find Citations', color: 'bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/30' },
  { icon: GraduationCap, label: 'Study Techniques', color: 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30' },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi, I'm TutorBot! 👋 Your AI learning assistant. I can help you understand concepts, create summaries, generate flashcards, and much more. What would you like to learn about today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [webBrowsing, setWebBrowsing] = useState(false);
  const [academicSearch, setAcademicSearch] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response with typing indicator
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your question! Let me help you with that. This is a simulated response - in a real implementation, this would be connected to your AI service with the selected materials and search modes.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInput(action + ': ');
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      {/* Welcome Message for Empty State */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex items-center justify-center p-8"
        >
          <div className="text-center max-w-2xl">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Bot className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Hi, I'm TutorBot! 👋</h2>
            <p className="text-gray-400 text-lg mb-8">Your AI learning assistant is ready to help you study smarter, not harder.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAction(action.label)}
                      className={cn(
                        "w-full h-16 border border-gray-700 text-left justify-start gap-3 transition-all duration-200",
                        action.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-gray-200">{action.label}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages Area */}
      {messages.length > 1 && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-4 max-w-5xl",
                  message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-700'
                )}>
                  {message.sender === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "rounded-2xl px-6 py-4 max-w-[80%] shadow-lg",
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-[#1A1A1A] border border-gray-800 text-gray-100'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-3">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 mr-auto max-w-5xl"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">TutorBot is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick Actions (shown when messages exist) */}
      {messages.length > 1 && (
        <div className="px-6 py-3 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.label)}
                    className="bg-[#1A1A1A] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {action.label}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode Toggles */}
      <div className="px-6 py-4 border-t border-gray-800 bg-[#0F0F0F]">
        <div className="flex items-center gap-8 mb-4">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <Switch 
              checked={webBrowsing} 
              onCheckedChange={setWebBrowsing}
              className="data-[state=checked]:bg-purple-600"
            />
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-medium">Web Browsing</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <Switch 
              checked={academicSearch} 
              onCheckedChange={setAcademicSearch}
              className="data-[state=checked]:bg-purple-600"
            />
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-medium">Academic Papers</span>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <Folder className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Materials: None Selected</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your studies..."
              className="bg-[#1A1A1A] border-gray-700 text-white placeholder-gray-500 focus:border-purple-600 focus:ring-purple-600/25 pr-12 h-14 rounded-xl text-base shadow-lg"
            />
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              animate={{ rotate: input ? 0 : 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-purple-500 opacity-50" />
            </motion.div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-14 px-8 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
