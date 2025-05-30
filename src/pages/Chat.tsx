import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Trash2, 
  Moon, 
  Sun, 
  Bot,
  Sparkles,
  MessageSquare,
  Send,
  RotateCcw,
  User,
  Zap
} from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI Study Tutor. How can I help you understand your material better today?"
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested prompts for better UX
  const suggestedPrompts = [
    "Explain cellular respiration briefly",
    "Quiz me on photosynthesis", 
    "What is osmosis?",
    "Define mitosis",
    "Explain DNA structure"
  ];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: "Hello! I'm your AI Study Tutor. How can I help you understand your material better today?"
        }
      ]);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response - replace with your actual AITutor logic
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(messageText)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const responses = [
      "That's a great question! Let me explain this concept in detail...",
      "I can help you understand this better. Here's a comprehensive explanation...",
      "This is an important topic in your studies. Let me break it down step by step...",
      "Excellent question! Here's what you need to know about this...",
      "I'm here to help you master this concept. Let me provide a clear explanation..."
    ];
    return responses[Math.floor(Math.random() * responses.length)] + 
           ` Based on your question about "${userInput}", here are the key points you should understand: [This would be replaced with actual AI responses from your AITutor component]`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-8 w-8 text-white" />
                  <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AI Study Tutor</h1>
                  <p className="text-xs text-white/80 hidden sm:block">Your intelligent learning companion</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-white hover:bg-red-500/30 hover:text-red-100 transition-all duration-200 hidden sm:flex"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 text-yellow-300" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col bg-gray-900 dark:bg-gray-950 relative overflow-hidden">
        {/* Chat Header Bar */}
        <div className="bg-gray-800 dark:bg-gray-900 border-b border-gray-700 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">AI Study Tutor</span>
                <span className="bg-green-500 text-xs px-2 py-1 rounded-full text-white">Live</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-gray-400 hover:text-white hover:bg-gray-700 sm:hidden"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Zap className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Quiz Me</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={message.id}
                className="py-6 px-4 border-b border-gray-800 dark:border-gray-700"
              >
                <div className="flex space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-300 mb-2">
                      {message.type === 'user' ? 'You' : 'AI Study Tutor'}
                    </div>
                    <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="py-6 px-4 border-b border-gray-800">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-300 mb-2">
                      AI Study Tutor
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Prompts - Show when no user messages */}
            {messages.length === 1 && messages[0].type === 'ai' && (
              <div className="p-6">
                <div className="text-gray-400 text-sm mb-4">Try asking:</div>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="block w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 transition-colors duration-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about your material..."
                  className="pr-12 py-3 text-base bg-gray-700 border-gray-600 focus:border-purple-500 text-white placeholder-gray-400 rounded-lg"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-md"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between max-w-4xl mx-auto text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Ready</span>
            </div>
            <div className="hidden sm:block">
              Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd> to send
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-3 w-3" />
            <span>Study Session Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
