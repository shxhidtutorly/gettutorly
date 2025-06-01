import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Send, Trash2 } from "lucide-react";

// Message type
type Message = {
  role: string;
  content: string;
  provider?: string;
  model?: string;
};

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // For smooth scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus the input after sending a message
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const currentInput = input.trim();
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, model: 'gemini' })
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const aiResponse = data.response || data.message || 'No response received from AI';
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      let errorMessage = "I'm having trouble connecting right now. ";
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage += "Please check your connection and try again.";
        } else if (error.message.includes('429')) {
          errorMessage += "I'm a bit busy right now. Please try again in a moment.";
        } else if (error.message.includes('401')) {
          errorMessage += "There's an authentication issue. Please contact support.";
        } else {
          errorMessage += "Please try again or contact support if this continues.";
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const setSampleQuestion = (question: string) => {
    if (!isLoading) setInput(question);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    if (!isLoading) {
      setMessages([
        { role: 'assistant', content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?' }
      ]);
      setInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-black rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 h-[70vh] max-h-[700px] min-h-[480px] overflow-hidden transition-all duration-300 w-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black">
        <div className="flex items-center flex-1">
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3 shadow-sm animate-fadeIn">
            <span className="text-sm font-medium">AI</span>
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-white">AI Study Tutor</span>
            <div className="flex items-center mt-0.5">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-900 rounded-lg transition transform hover:scale-105"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Chat messages area */}
      <div className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50 dark:bg-black">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUpFadeIn`}
            style={{
              animationDelay: `${index * 40}ms`,
              animationDuration: "320ms"
            }}
          >
            {message.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-2 sm:mr-3 flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">AI</span>
              </div>
            )}
            <div
              className={`max-w-[75vw] sm:max-w-[70%] p-3 sm:p-4 shadow-md transition-all duration-300 break-words
                ${message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-800'
                }`
              }
            >
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-700 flex items-center justify-center text-white ml-2 sm:ml-3 flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">You</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-slideUpFadeIn">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-2 sm:mr-3 flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium">AI</span>
            </div>
            <div className="max-w-[75vw] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl rounded-bl-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 sm:p-4 bg-white dark:bg-black">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-grow">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              disabled={isLoading}
              rows={1}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                overflowY: input.length > 100 ? 'auto' : 'hidden'
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-800 text-white p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {messages.length <= 1 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSampleQuestion("Explain cellular respiration")}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors border border-gray-200 dark:border-gray-800"
              >
                Explain cellular respiration
              </button>
              <button
                onClick={() => setSampleQuestion("How does photosynthesis work?")}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors border border-gray-200 dark:border-gray-800"
              >
                How does photosynthesis work?
              </button>
              <button
                onClick={() => setSampleQuestion("Explain the stages of mitosis")}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors border border-gray-200 dark:border-gray-800"
              >
                Explain the stages of mitosis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AIAssistant = () => {
  useEffect(() => {
    document.title = "AI Assistant | Tutorly";
    return () => {
      document.title = "Tutorly - Smart Learning Platform";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="flex flex-col items-center py-6 px-0 sm:px-4 text-gray-900 dark:text-white">
        {/* Back to Dashboard Button */}
        <div className="w-full max-w-2xl mb-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:text-white bg-white dark:bg-black border border-blue-700 rounded-lg shadow transition-all duration-200 hover:bg-blue-900 dark:hover:bg-blue-900 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 animate-fadeIn"
            style={{ fontWeight: 500 }}
          >
            <span style={{ fontSize: '1.2em' }}>←</span> Back to Dashboard
          </button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center animate-fadeIn">AI Learning Assistant</h1>
        <div className="w-full max-w-2xl flex flex-col items-center">
          <AIChat />
        </div>
      </main>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-12px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-slideUpFadeIn {
          animation: slideUpFadeIn 0.32s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        }
        @keyframes slideUpFadeIn {
          0% { opacity: 0; transform: translateY(24px);}
          100% { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
