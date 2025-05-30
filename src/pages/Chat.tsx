import { useState, useEffect } from "react";
import AITutor from "@/components/features/AITutor";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Trash2, 
  Moon, 
  Sun, 
  Bot
} from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply dark mode to document
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
    // This will be handled by the AITutor component if it supports clearing
    // You might need to pass a ref or callback to AITutor to trigger clear
    window.location.reload(); // Temporary solution - reloads the page to clear chat
  };

  return (
    <div className={`fixed inset-0 flex flex-col ${darkMode ? 'dark' : ''} bg-white dark:bg-gray-900`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Study Tutor
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>
      </header>

      {/* Chat Area - Full height minus header */}
      <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800">
        <div className="h-full">
          <AITutor 
            isFullscreen={true}
            className="h-full"
            darkMode={darkMode}
          />
        </div>
      </main>
    </div>
  );
};

export default Chat;
