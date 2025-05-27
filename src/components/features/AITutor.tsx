
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, MessageSquare, BookOpen, RefreshCw, Send, Sparkles, User, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { callVercelAI } from "@/lib/vercelAiClient";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface AITutorProps {
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}

const AITutor = ({ isFullscreen = false, toggleFullscreen }: AITutorProps) => {
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
  
  // Load saved messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutorly_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tutorly_chat", JSON.stringify(messages));
  }, [messages]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    console.log("Sending request", input, "gemini");
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setIsThinking(true);
    
    try {
      // Use the Vercel AI client to get a response
      const result = await callVercelAI(input, 'gemini');
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: result
        }
      ]);
      
      toast({
        title: "Tutor AI Response",
        description: "New explanation available",
        duration: 3000,
      });
    } catch (error) {
      console.error('AI Tutor Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I had trouble answering that. Please try again."
        }
      ]);
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
  
  // Shorter, more concise suggested questions
  const suggestedQuestions = [
    "Explain cellular respiration",
    "Quiz me on photosynthesis",
    "Define osmosis"
  ];
  
  return (
    <Card className={`w-full ${isFullscreen ? 'h-full' : 'min-h-[500px]'} flex flex-col hover-glow transition-all duration-300`}>
      <CardHeader className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-spark-light rounded-md">
              <BrainCircuit className="h-5 w-5 text-spark-primary" />
            </div>
            <CardTitle className="text-base font-medium text-foreground">AI Study Tutor</CardTitle>
            <Badge variant="outline" className="ml-2 bg-spark-light text-spark-secondary border-0">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-2">
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
      
      <CardContent className="p-4 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-spark-light scrollbar-track-transparent min-h-[400px]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-scale-in`}
              style={{ animationDelay: `${index * 100}ms` }}
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
                    ? "bg-spark-primary text-white"
                    : "bg-spark-light text-spark-primary"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <BrainCircuit className="h-4 w-4" />
                  )}
                </div>
                
                <div 
                  className={`px-4 py-2 rounded-xl break-words ${
                    message.role === "user" 
                      ? "bg-spark-primary text-white rounded-tr-none"
                      : "bg-spark-light text-foreground rounded-tl-none"
                  }`}
                  style={{ overflowWrap: 'anywhere', maxWidth: '100%' }}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-spark-light text-spark-primary flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] px-4 py-3 bg-spark-light rounded-xl rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 bg-spark-secondary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-spark-secondary rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-spark-secondary rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {messages.length === 1 && !isThinking && (
        <div className="px-4 mb-2">
          <div className="bg-spark-light/50 rounded-lg p-3">
            <p className="text-sm font-medium mb-2 text-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button 
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white hover:bg-spark-light transition-colors button-click-effect dark:bg-muted dark:hover:bg-accent dark:text-foreground suggestion-box"
                  onClick={() => {
                    setInput(question);
                  }}
                >
                  <span className="whitespace-normal overflow-wrap-break-word text-left">
                    {question}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <CardFooter className={`px-4 py-3 border-t flex-shrink-0 ${isFullscreen ? 'pb-safe' : ''}`}>
        <div className="flex items-center gap-2 w-full">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0 hover:bg-spark-light transition-colors button-click-effect"
            title="AI Suggestions"
          >
            <Sparkles className="h-4 w-4 text-spark-primary" />
          </Button>
          <div className={`flex items-center w-full relative ${isFullscreen ? 'input-container' : ''}`}>
            <input
              type="text"
              placeholder="Ask anything about your material..."
              className="w-full rounded-full border border-spark-light pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-spark-primary transition-all dark:bg-muted dark:border-muted text-foreground"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
            />
            <Button 
              size="icon" 
              className={`absolute right-1 text-white hover:bg-opacity-90 rounded-full h-7 w-7 transition-colors button-click-effect ${!input.trim() || isThinking ? 'bg-spark-primary opacity-50 cursor-not-allowed' : 'bg-spark-primary'}`}
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
