import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AITutor from "@/components/features/AITutor";
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

const CHAT_STORAGE_KEY = "your-chat-key"; // <-- Replace with your actual key

const Chat = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const menuRef = useRef(null);

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

  const navigate = useNavigate();

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-tutor-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as any).contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileMenu]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // NEW: Proper chat clearing (localStorage, then reload)
  const handleClearChat = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear this chat? This action cannot be undone.'
    );
    if (confirmed) {
      setIsClearing(true);
      setShowMobileMenu(false);
      // Remove chat data from localStorage (edit key as necessary)
      localStorage.removeItem(CHAT_STORAGE_KEY);
      // If you use other storage (context/state), clear it here as well
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
      <header className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        <div className="relative px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
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
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handleClearChat}
                  disabled={isClearing}
                  className="flex items-center px-3 py-2 text-white hover:bg-red-500/30 hover:text-red-100 backdrop-blur-sm border border-white/20 hover:border-red-300/50 transition-all duration-300 rounded-lg text-sm"
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
                        className="w-full flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-60 text-sm"
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </header>
      <main className="flex-1 relative overflow-hidden bg-gray-50/80 dark:bg-gray-900/80 transition-colors duration-300">
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
        <div className="relative h-full max-w-6xl mx-auto">
          <div className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-x border-gray-200/60 dark:border-gray-700/60 shadow-2xl transition-all duration-300">
            {/* 
                Pass unique pre-questions to AITutor if you have a prop like preQuestions or questions:
                Example:
                <AITutor 
                  preQuestions={[...new Set(preQuestions)]}
                  ...otherProps
                />
            */}
            <AITutor 
              isFullscreen={true}
              darkMode={isDark}
              theme={theme}
              className="h-full w-full"
              // preQuestions={uniqueQuestions} // Un-comment and use if you pass pre-questions here!
            />
          </div>
        </div>
        {isClearing && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Clearing chat...</span>
            </div>
          </div>
        )}
      </main>
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
