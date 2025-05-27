
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { callVercelAI } from "@/lib/vercelAiClient";
import { Loader2, User, BrainCircuit, Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AIChat = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI learning assistant. How can I help with your studies today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutorly_assistant_chat");
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
    localStorage.setItem("tutorly_assistant_chat", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    console.log("Sending request", prompt, "gemini");
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setIsLoading(true);
    setPrompt("");
    
    try {
      const result = await callVercelAI(prompt, 'gemini');
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: result
        }
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I had trouble answering that. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto hover-glow">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-gray-800 dark:text-white">AI Learning Assistant</CardTitle>
        <CardDescription className="text-center text-gray-700 dark:text-gray-200">Ask any question about your study materials</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[500px] max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-scale-in`}
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
                      : "bg-spark-light text-gray-800 dark:text-gray-800 rounded-tl-none"
                  }`}
                  style={{ overflowWrap: 'anywhere', maxWidth: '100%' }}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="flex items-center w-full relative">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 spark-input pr-10 text-gray-800 dark:text-white"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute right-1 text-white hover:bg-opacity-90 rounded-full h-7 w-7 transition-colors button-click-effect bg-spark-primary"
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
