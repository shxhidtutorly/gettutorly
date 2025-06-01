import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { MessageCircle, Send, Trash2 } from "lucide-react";

// Message type
type Message = {
  role: string;
  content: string;
  provider?: string;
  model?: string;
};

// Enhanced AIChat component with better UX
const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const currentInput = input.trim();
    
    // Clear input immediately for better UX
    setInput('');
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('🚀 Sending request to AI API...');
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          model: 'gemini'
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);

      const aiResponse = data.response || data.message || 'No response received from AI';
      
      // Add AI response to messages
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse
      }]);

    } catch (error) {
      console.error('❌ Error calling AI API:', error);
      
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
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage 
      }]);
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
    if (!isLoading) {
      setInput(question);
    }
  };

  const clearChat = () => {
    if (!isLoading) {
      setMessages([
        { role: 'assistant', content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?' }
      ]);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 h-[700px] overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Back to Dashboard button */}
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition mr-4"
          title="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center flex-1">
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3 shadow-sm">
            <span className="text-sm font-medium">AI</span>
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-white">AI Study Tutor</span>
            <div className="flex items-center mt-0.5">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Chat messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">AI</span>
              </div>
            )}
            <div 
              className={`max-w-[80%] p-4 shadow-sm
                ${message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700'
                }`
              }
            >
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white ml-3 flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">You</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium">AI</span>
            </div>
            <div className="max-w-[80%] p-4 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
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
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-grow">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              disabled={isLoading}
              rows={1}
              className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors border"
              >
                Explain cellular respiration
              </button>
              <button 
                onClick={() => setSampleQuestion("How does photosynthesis work?")}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors border"
              >
                How does photosynthesis work?
              </button>
              <button 
                onClick={() => setSampleQuestion("Explain the stages of mitosis")}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors border"
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
  // Update document title on component mount
  useEffect(() => {
    document.title = "AI Assistant | Tutorly";
    // Restore original title when component unmounts
    return () => {
      document.title = "Tutorly - Smart Learning Platform";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <main className="container py-8 text-gray-800 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">AI Learning Assistant</h1>

        <div className="max-w-5xl mx-auto">
          <AIChat />
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
