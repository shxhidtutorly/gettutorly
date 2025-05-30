import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Trash2, 
  Moon, 
  Sun, 
  Bot,
  Sparkles,
  MessageSquare,
  MoreVertical,
  Monitor,
  Zap
} from "lucide-react";

import AITutor from "@/components/features/AITutor";
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I understand you're asking about "${input}". Let me help you with that topic. Here's a detailed explanation...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Explain quantum physics basics",
    "Help me with calculus derivatives",
    "Summarize World War II causes",
    "Teach me about photosynthesis"
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 1 && (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Welcome to AI Study Tutor
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start a conversation or try one of these suggestions:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
              }`}>
                {message.type === 'user' ? (
                  <span className="text-sm font-medium">U</span>
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 opacity-70 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const menuRef = useRef(null);

  // Enhanced theme management with system preference detection
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-tutor-theme');
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState(false);

  // Theme effect with proper system detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let shouldBeDark = false;
      
      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else {
        shouldBeDark = mediaQuery.matches;
      }
      
      setIsDark(shouldBeDark);
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  // Save theme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-tutor-theme', theme);
    }
  }, [theme]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileMenu]);

  const handleBack = () => {
    // In a real app, this would use your router
    console.log('Navigate back to dashboard');
    alert('In your app, this would navigate back to the dashboard');
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleClearChat = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear this chat? This action cannot be undone.'
    );
    
    if (confirmed) {
      setIsClearing(true);
      setShowMobileMenu(false);
      
      // Add a small delay for better UX
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'dark':
        return <Moon className="h-4 w-4 text-blue-400" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  return (
    <div className="h-screen flex flex-col transition-colors duration-300">
      {/* Enhanced Header with Gradient */}
      <header className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 text-white shadow-xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        <div className="relative px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="flex items-center px-3 py-2 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 rounded-lg text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
              
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center">
                    AI Study Tutor
                    <Zap className="h-4 w-4 ml-2 text-yellow-300" />
                  </h1>
                  <p className="text-xs text-white/80 hidden sm:block">
                    Your intelligent learning companion
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Desktop Controls */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handleClearChat}
                  disabled={isClearing}
                  className="flex items-center px-3 py-2 text-white hover:bg-red-500/30 hover:text-red-100 backdrop-blur-sm border border-white/20 hover:border-red-300/50 transition-all duration-300 rounded-lg disabled:opacity-50 text-sm"
                >
                  <Trash2 className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
                  {isClearing ? 'Clearing...' : 'Clear Chat'}
                </button>
                
                <button
                  onClick={cycleTheme}
                  className="flex items-center px-3 py-2 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 rounded-lg text-sm"
                  title={`Current: ${getThemeLabel()} theme`}
                >
                  {getThemeIcon()}
                  <span className="ml-2 text-xs hidden lg:inline">{getThemeLabel()}</span>
                </button>
              </div>

              {/* Mobile Menu */}
              <div className="sm:hidden relative" ref={menuRef}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center px-3 py-2 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 rounded-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showMobileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={cycleTheme}
                        className="w-full flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-lg transition-all duration-200 text-sm"
                      >
                        {getThemeIcon()}
                        <span className="ml-3">Theme: {getThemeLabel()}</span>
                      </button>
                      
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                      
                      <button
                        onClick={handleClearChat}
                        disabled={isClearing}
                        className="w-full flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm"
                      >
                        <Trash2 className={`h-4 w-4 mr-3 ${isClearing ? 'animate-spin' : ''}`} />
                        {isClearing ? 'Clearing Chat...' : 'Clear Chat'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </header>

      {/* Main Chat Container */}
      <main className="flex-1 relative overflow-hidden bg-gray-50/80 dark:bg-gray-900/80 transition-colors duration-300">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Enhanced Chat Container */}
        <div className="relative h-full max-w-6xl mx-auto">
          <div className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-x border-gray-200/60 dark:border-gray-700/60 shadow-2xl transition-all duration-300">
            <AITutor 
              isFullscreen={true}
              darkMode={isDark}
              theme={theme}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {isClearing && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Clearing chat...</span>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Status Bar */}
      <footer className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60 px-4 py-3 transition-all duration-300">
        <div className="flex items-center justify-between max-w-6xl mx-auto text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="font-medium">AI Ready</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                <span>•</span>
                <span>Press</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs border border-gray-200 dark:border-gray-600 font-mono">
                  Enter
                </kbd>
                <span>to send</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span className="font-medium">Study Session Active</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-gray-400 dark:text-gray-500">
              <span>•</span>
              <span>Theme: {getThemeLabel()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
