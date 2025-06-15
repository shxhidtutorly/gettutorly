
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Globe, 
  GraduationCap, 
  FolderOpen,
  ArrowUp,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const quickActions = [
  'Explain Concepts',
  'Summarize',
  'Find Citations',
  'Study Techniques'
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webBrowsing, setWebBrowsing] = useState(false);
  const [academicSearch, setAcademicSearch] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Hello! I'm TutorBot, your AI learning assistant. I'm here to help you with your studies. How can I assist you today?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInput(`${action}: `);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {messages.length === 0 ? (
          // Welcome Screen
          <motion.div 
            className="text-center max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mb-8"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Hi, I'm TutorBot
            </motion.h1>
            
            <motion.p 
              className="text-gray-400 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Ask me anything about learning, or try one of these examples:
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction(action)}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {action}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          // Messages Area
          <ScrollArea className="flex-1 w-full max-w-4xl">
            <div className="space-y-6 p-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex gap-4 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700">
                        <AvatarFallback>
                          <Bot className="w-5 h-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {message.sender === 'user' && (
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700">
                        <AvatarFallback>
                          <User className="w-5 h-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div 
                  className="flex gap-4 justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700">
                    <AvatarFallback>
                      <Bot className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Mode Switches */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-400" />
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Web Browsing</span>
              <Switch checked={webBrowsing} onCheckedChange={setWebBrowsing} />
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Search Academic Papers</span>
              <Switch checked={academicSearch} onCheckedChange={setAcademicSearch} />
            </div>
            
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400">Using {selectedMaterials} material(s)</span>
              <Button variant="link" className="text-orange-400 p-0 h-auto">
                Select Materials
              </Button>
            </div>
          </div>

          {/* Input Box */}
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI tutor anything..."
              disabled={isLoading}
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12 py-6 text-lg rounded-xl focus:border-purple-500 focus:ring-purple-500/25"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 w-10"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
