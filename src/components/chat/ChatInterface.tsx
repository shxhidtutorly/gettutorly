
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
  GraduationCap
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
  { icon: Lightbulb, label: 'Explain Concepts', color: 'bg-blue-600' },
  { icon: FileText, label: 'Summarize', color: 'bg-green-600' },
  { icon: Search, label: 'Find Citations', color: 'bg-orange-600' },
  { icon: GraduationCap, label: 'Study Techniques', color: 'bg-purple-600' },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm TutorBot, your AI learning assistant. I can help you with studying, explaining concepts, creating summaries, and much more. What would you like to learn about today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [webBrowsing, setWebBrowsing] = useState(false);
  const [academicSearch, setAcademicSearch] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
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

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your question. Let me help you with that. This is a simulated response - in a real implementation, this would be connected to your AI service.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInput(action + ': ');
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Messages Area */}
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
                "flex gap-4 max-w-4xl",
                message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-700'
              )}>
                {message.sender === 'user' ? (
                  <span className="text-white font-medium text-sm">U</span>
                ) : (
                  <span className="text-white font-bold">🤖</span>
                )}
              </div>
              
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-[80%]",
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1A1A1A] border border-gray-800 text-gray-100'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex flex-wrap gap-2 mb-4">
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
                  className="bg-[#1A1A1A] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Icon className="h-3 w-3 mr-2" />
                  {action.label}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Mode Toggles */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={webBrowsing} 
              onCheckedChange={setWebBrowsing}
              className="data-[state=checked]:bg-purple-600"
            />
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Web Browsing</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={academicSearch} 
              onCheckedChange={setAcademicSearch}
              className="data-[state=checked]:bg-purple-600"
            />
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Academic Papers</span>
          </div>
          
          <div className="flex items-center gap-2">
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
              className="bg-[#1A1A1A] border-gray-700 text-white placeholder-gray-500 focus:border-purple-600 focus:ring-purple-600/25 pr-12 h-12 rounded-xl"
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-6 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
