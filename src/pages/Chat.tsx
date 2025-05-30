import { useState, useEffect } from "react";
import AITutor from "@/components/features/AITutor";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Trash2, 
  Moon, 
  Sun, 
  Bot,
  Sparkles,
  MessageSquare,
  Settings,
  Maximize2,
  MoreVertical
} from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      window.location.reload();
    }
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Enhanced Header */}
      <header className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="relative px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-white hover:bg-white/20 border-white/30 hover:border-white/50 transition-all duration-200"
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

              {/* Mobile Menu */}
              <div className="sm:hidden relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                
                {showSettings && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Background Pattern */}
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

        {/* Chat Area with Enhanced Container */}
        <div className="relative h-full max-w-6xl mx-auto">
          <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-x border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <AITutor 
              isFullscreen={true}
              darkMode={darkMode}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="absolute bottom-6 right-6 sm:hidden">
          <Button
            onClick={clearChat}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg rounded-full p-3 h-12 w-12"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between max-w-6xl mx-auto text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Ready</span>
            </div>
            <div className="hidden sm:block">
              Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send
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
