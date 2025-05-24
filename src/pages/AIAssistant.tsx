import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MessageCircle, Send, Upload, X, FileText, Check, Paperclip, User, Bot } from "lucide-react";

const AIAssistant = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.title = "AI Assistant | Tutorly";
    return () => {
      document.title = "Tutorly - Smart Learning Platform";
    };
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation Bar */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tutorly</span>
              </div>
              
              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-6">
                <a href="#" className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <span>📊</span>
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <span>📚</span>
                  <span>Library</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <span>📋</span>
                  <span>Study Plans</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <span>📈</span>
                  <span>Progress</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-purple-600 font-medium">
                  <span>🤖</span>
                  <span>AI Assistant</span>
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your materials..."
                  className={`pl-4 pr-10 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-600'} hover:opacity-80`}
              >
                {darkMode ? '🌙' : '☀️'}
              </button>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                AJ
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Learning Assistant
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get instant help with your studies and upload materials for personalized learning
          </p>
        </div>

        <Tabs defaultValue="chat" className="max-w-6xl mx-auto">
          <TabsList className={`grid grid-cols-2 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-1 shadow-sm`}>
            <TabsTrigger 
              value="chat" 
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300' 
                  : 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Ask Questions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300' 
                  : 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Upload Study Material</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="focus:outline-none">
            <AIChat darkMode={darkMode} />
          </TabsContent>

          <TabsContent value="upload" className="focus:outline-none">
            <DocumentUploader darkMode={darkMode} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const AIChat = ({ darkMode }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your AI Study Tutor. How can I help you understand your material better today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input;
    setInput('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      let aiResponse = generateAIResponse(currentInput);
      
      const assistantMessage = { 
        role: 'assistant', 
        content: aiResponse, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('cellular respiration')) {
      return "Cellular respiration is a crucial metabolic process that converts glucose into ATP energy. It occurs in three main stages:\n\n1. **Glycolysis** - Glucose is broken down in the cytoplasm\n2. **Citric Acid Cycle** - Takes place in the mitochondrial matrix\n3. **Electron Transport Chain** - Occurs on the inner mitochondrial membrane\n\nThe overall equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP\n\nWould you like me to explain any of these stages in more detail?";
    } else if (lowerQuestion.includes('photosynthesis')) {
      return "Photosynthesis is the process plants use to convert light energy into chemical energy. It has two main phases:\n\n**Light Reactions:**\n- Occur in the thylakoids\n- Chlorophyll absorbs light energy\n- Water is split, releasing oxygen\n- ATP and NADPH are produced\n\n**Calvin Cycle (Dark Reactions):**\n- Occurs in the stroma\n- CO₂ is fixed into glucose\n- Uses ATP and NADPH from light reactions\n\nOverall: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nWhat aspect would you like to explore further?";
    } else if (lowerQuestion.includes('mitosis')) {
      return "Mitosis is cell division that produces two identical diploid cells. The phases are:\n\n**Prophase:** Chromosomes condense, nuclear envelope breaks down\n**Metaphase:** Chromosomes align at the cell's equator\n**Anaphase:** Sister chromatids separate and move to opposite poles\n**Telophase:** Nuclear envelopes reform, chromosomes decondense\n**Cytokinesis:** Cytoplasm divides, completing cell division\n\nThis process is essential for growth, repair, and asexual reproduction in organisms.\n\nWould you like me to explain the differences between mitosis and meiosis?";
    } else {
      return `I understand you're asking about "${question}". I can help with a wide range of academic topics including:\n\n• Biology (cellular processes, genetics, ecology)\n• Chemistry (atomic structure, reactions, organic chemistry)\n• Physics (mechanics, thermodynamics, electromagnetism)\n• Mathematics (algebra, calculus, statistics)\n• Study strategies and techniques\n\nCould you provide more details about what specifically you'd like to learn or understand better?`;
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} h-[600px] overflow-hidden`}>
      {/* Chat header */}
      <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Study Tutor</span>
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full font-medium">Beta</span>
            </div>
            <span className="text-xs text-green-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Online
            </span>
          </div>
        </div>
        <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Open Full Chat
        </button>
      </div>

      {/* Chat messages area */}
      <div className={`flex-grow overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className="flex flex-col max-w-2xl">
              <div 
                className={`p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-md ml-auto' 
                    : `${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-bl-md border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left ml-11'
              }`}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white ml-3 flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white mr-3">
              <Bot className="h-4 w-4" />
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-3 rounded-2xl rounded-bl-md border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
        <div className={`flex rounded-xl border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} overflow-hidden`}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your studies..."
            className={`flex-grow py-3 px-4 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900 placeholder-gray-500'} focus:outline-none`}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Sample questions */}
        <div className="mt-3">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Explain cellular respiration",
              "How does photosynthesis work?",
              "Explain the stages of mitosis"
            ].map((question, index) => (
              <button 
                key={index}
                onClick={() => setInput(question)}
                className={`px-3 py-1 text-sm ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                } rounded-full border transition-colors`}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentUploader = ({ darkMode }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }))]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    setUploading(true);
    
    for (let fileObj of files) {
      if (fileObj.status === 'pending') {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'completed' } : f
        ));
      }
    }
    
    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div 
        className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          dragActive ? (darkMode ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50') : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <Upload className={`h-16 w-16 mb-4 ${dragActive ? 'text-purple-500' : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} />
          <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Upload your study materials
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-lg`}>
            Drag and drop files here or click to browse
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold transition-all duration-200"
          >
            Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Supports PDF, DOCX, TXT files up to 10MB each
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Uploaded Files</h4>
            {files.some(f => f.status === 'pending') && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold transition-all duration-200"
              >
                {uploading ? 'Processing...' : 'Process Files'}
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {files.map((fileObj) => (
              <div key={fileObj.id} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                <div className="flex items-center space-x-4">
                  <FileText className={`h-8 w-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{fileObj.file.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(fileObj.file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {fileObj.status === 'pending' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Pending</span>
                  )}
                  {fileObj.status === 'uploading' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Processing...</span>
                  )}
                  {fileObj.status === 'completed' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Ready
                    </span>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className={`p-1 hover:${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full transition-colors duration-200`}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;