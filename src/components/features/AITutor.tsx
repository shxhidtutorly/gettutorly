import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, MessageSquare, BookOpen, RefreshCw, Send, Sparkles, User, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface AITutorProps {
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  onClose?: () => void;
}

const AITutor = ({ isFullscreen = false, toggleFullscreen, onClose }: AITutorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Study Tutor. How can I help you understand your material better today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    
    const userMessage = input.trim();
    console.log("🚀 Sending message to AI:", userMessage);
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsThinking(true);
    
    try {
      // Simulate AI response for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponses = [
        "That's a great question! Let me explain that concept step by step...",
        "I can help you understand this topic better. Here's what you need to know...",
        "Excellent! Let's break this down into simpler parts...",
        "That's an important concept in your studies. Here's how it works...",
        "Good question! This is a fundamental topic that connects to many other areas..."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: randomResponse
        }
      ]);
      
      toast({
        title: "AI Tutor Response",
        description: "Response generated successfully",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ AI Tutor Error:', error);
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment."
        }
      ]);
      
      toast({
        title: "Connection Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsThinking(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Hello! I'm your AI Study Tutor. How can I help you understand your material better today?"
    }]);
    toast({
      title: "Chat Cleared",
      description: "Starting fresh conversation",
      duration: 2000,
    });
  };
  
  // Shorter, more concise suggested questions optimized for 200 tokens
  const suggestedQuestions = [
    "Explain cellular respiration briefly",
    "Quiz me on photosynthesis",
    "What is osmosis?",
    "Define mitosis",
    "Explain DNA structure"
  ];
  
  return (
    <Card className={`w-full ${isFullscreen ? 'h-full' : 'min-h-[500px]'} flex flex-col transition-all duration-300 bg-background border`}>
      <CardHeader className="px-4 py-3 border-b flex-shrink-0 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-md">
              <BrainCircuit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-base font-medium text-foreground">AI Study Tutor</CardTitle>
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={clearChat}
              title="Clear Chat"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear
            </Button>
            {toggleFullscreen && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            {isFullscreen && onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onClose}
                title="Close Chat"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Tabs defaultValue="chat" className="w-auto">
              <TabsList className="h-8 p-1">
                <TabsTrigger value="chat" className="text-xs px-2 py-1 h-6">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="quiz" className="text-xs px-2 py-1 h-6">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Quiz Me
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto flex-grow min-h-[400px] bg-background">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`flex max-w-[80%] items-start gap-2 ${
                  message.role === "user" 
                    ? "flex-row-reverse" 
                    : "flex-row"
                }`}
              >
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <BrainCircuit className="h-4 w-4" />
                  )}
                </div>
                
                <div 
                  className={`px-4 py-2 rounded-xl break-words whitespace-pre-wrap ${
                    message.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  }`}
                  style={{ overflowWrap: 'anywhere', maxWidth: '100%' }}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] px-4 py-3 bg-muted rounded-xl rounded-tl-none flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Thinking</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {messages.length === 1 && !isThinking && (
        <div className="px-4 mb-2">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm font-medium mb-2 text-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button 
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-background hover:bg-muted transition-colors"
                  onClick={() => {
                    setInput(question);
                  }}
                >
                  <span className="whitespace-normal text-left">
                    {question}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <CardFooter className={`px-4 py-3 border-t flex-shrink-0 bg-background ${isFullscreen ? 'pb-safe' : ''}`}>
        <div className="flex items-center gap-2 w-full">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0 hover:bg-muted transition-colors"
            title="AI Suggestions"
            onClick={() => {
              const randomQuestion = suggestedQuestions[Math.floor(Math.random() * suggestedQuestions.length)];
              setInput(randomQuestion);
            }}
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
          <div className="flex items-center w-full relative">
            <input
              type="text"
              placeholder="Ask anything about your material..."
              className="w-full rounded-full border border-input bg-background pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-foreground placeholder:text-muted-foreground"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
            />
            <Button 
              size="icon" 
              className={`absolute right-1 text-white hover:bg-blue-700 rounded-full h-7 w-7 transition-colors ${!input.trim() || isThinking ? 'bg-blue-500 opacity-50 cursor-not-allowed' : 'bg-blue-600'}`}
              onClick={handleSendMessage}
              disabled={!input.trim() || isThinking}
            >
              {isThinking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AITutor;
