import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MessageCircle, Send, TestTube } from "lucide-react";
import APITester from "@/components/features/APITester";

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

      <main className="container py-8 text-gray-800 dark:text-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">AI Learning Assistant</h1>

        <Tabs defaultValue="chat" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Ask Questions</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Upload Study Material</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              <span className="font-medium">API Test</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="focus:outline-none dark:bg-gray-900">
            <div className="max-w-5xl mx-auto">
              <AIChat />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="focus:outline-none dark:bg-gray-900">
            <div className="max-w-5xl mx-auto">
              <DocumentUploader />
            </div>
          </TabsContent>

          <TabsContent value="test" className="focus:outline-none dark:bg-gray-900">
            <div className="max-w-5xl mx-auto">
              <APITester />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Implement the AIChat component within the same file to ensure it works
const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I\'m your AI Study Tutor. How can I help you understand your material better today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsLoading(true);

    try {
      // Simulate API call to AI service
      setTimeout(() => {
        // Sample responses based on common educational questions
        let aiResponse = "I'm currently unable to connect to our AI servers. Please try again later or browse our pre-made study materials in the meantime. We apologize for the inconvenience.";

        const userQuestion = input.toLowerCase();
        if (userQuestion.includes('cellular respiration')) {
          aiResponse = "Cellular respiration is the process cells use to produce energy, usually in the form of ATP. It includes glycolysis, the citric acid cycle, and the electron transport chain. In this process, glucose is broken down and oxygen is consumed to produce carbon dioxide, water, and energy.";
        } else if (userQuestion.includes('photosynthesis')) {
          aiResponse = "Photosynthesis is the process by which plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose. The basic equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂";
        } else if (userQuestion.includes('mitosis')) {
          aiResponse = "Mitosis is the process of cell division that results in two identical daughter cells. It involves prophase, metaphase, anaphase, and telophase, followed by cytokinesis. This process is essential for growth, development, and repair in multicellular organisms.";
        }

        setMessages(prev => [...prev, { role: 'system', content: aiResponse }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Sorry, I encountered an error processing your request.' }]);
      setIsLoading(false);
    }

    setInput('');
  };

  // Check if chat is minimized
  if (minimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 z-50"
        onClick={() => setMinimized(false)}
      >
        <MessageCircle className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md h-[600px]">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
            <span className="text-sm">AI</span>
          </div>
          <span className="font-medium">AI Study Tutor</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">Beta</span>
        </div>
        <div className="flex space-x-2">
          <button 
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            onClick={() => setMinimized(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                <span className="text-sm">AI</span>
              </div>
            )}
            <div 
              className={`max-w-3/4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
              <span className="text-sm">AI</span>
            </div>
            <div className="max-w-3/4 p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your studies..."
            className="flex-grow py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Sample questions */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setInput("Explain cellular respiration")}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            >
              Explain cellular respiration
            </button>
            <button 
              onClick={() => setInput("How does photosynthesis work?")}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            >
              How does photosynthesis work?
            </button>
            <button 
              onClick={() => setInput("Explain the stages of mitosis")}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            >
              Explain the stages of mitosis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple placeholder for document uploader
const DocumentUploader = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
        <div className="flex flex-col items-center">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload your study materials</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop files here or click to browse
          </p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Select Files
          </button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            PDF, DOCX, TXT up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
