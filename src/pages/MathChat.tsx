import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  Upload, 
  Send, 
  Volume2, 
  Loader2, 
  Camera,
  FileText 
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import MathChatHistory from "@/components/features/MathChatHistory";
import MathRenderer from "@/components/features/MathRenderer";
import { createWorker } from 'tesseract.js';

interface MathChatMessage {
  id: string;
  problem: string;
  solution: string;
  timestamp: Date;
  isLoading?: boolean;
}

const MathChat = () => {
  const [problem, setProblem] = useState("");
  const [messages, setMessages] = useState<MathChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { trackMathProblemSolved, startSession, endSession } = useStudyTracking();
  const [ocrWorker, setOcrWorker] = useState<ReturnType<typeof createWorker>>();

  const extractTextFromImage = async (file: File): Promise<string> => {
  setIsProcessingImage(true);
  try {
    const worker = await createWorker();
    await worker.load(); // Load Tesseract core scripts
    await worker.loadLanguage('eng'); // Load English language data
    await worker.initialize('eng'); // Initialize with English
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  } finally {
    setIsProcessingImage(false);
  }
};

  const solveMathProblem = async (mathProblem: string): Promise<string> => {
    const response = await fetch('/api/math-solver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: mathProblem })
    });

    if (!response.ok) {
      throw new Error('Failed to solve math problem');
    }

    const data = await response.json();
    return data.solution;
  };

  const handleSubmit = async () => {
    if (!problem.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter a math problem"
      });
      return;
    }

    setIsLoading(true);
    startSession();

    const newMessage: MathChatMessage = {
      id: Date.now().toString(),
      problem: problem.trim(),
      solution: "",
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, newMessage]);
    setProblem("");

    try {
      const solution = await solveMathProblem(problem.trim());
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, solution, isLoading: false }
            : msg
        )
      );

      trackMathProblemSolved();
      endSession("math", problem.trim(), true);

      toast({
        title: "Problem solved!",
        description: "Math solution generated successfully."
      });

    } catch (error) {
      console.error('Error solving math problem:', error);
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      endSession("math", problem.trim(), false);
      
      toast({
        variant: "destructive",
        title: "Error solving problem",
        description: "Please try again with a different approach."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extractedText = await extractTextFromImage(file);
      setProblem(extractedText);
      
      toast({
        title: "Text extracted successfully!",
        description: "You can now edit the problem before solving."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to extract text",
        description: "Please try again or enter the problem manually."
      });
    }
  };

  const speakSolution = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: "destructive",
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech."
      });
    }
  };

  useEffect(() => {
    const initTesseract = async () => {
      try {
        const worker = await createWorker('eng');
        setOcrWorker(worker);
      } catch (error) {
        console.error('Failed to initialize OCR worker:', error);
      }
    };

    initTesseract();

    return () => {
      if (ocrWorker) {
        ocrWorker.terminate();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">Math Chat Assistant</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Solve math problems with AI assistance. Upload images or type your questions.
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Enter Your Math Problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="flex items-center gap-2"
                >
                  {isProcessingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  Upload Image
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Enter your math problem here... (e.g., Solve for x: 2x + 5 = 15)"
                className="min-h-[100px] resize-none"
              />

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !problem.trim()}
                className="w-full flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Solve Problem
              </Button>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className="border">
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Problem:</span>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <MathRenderer content={message.problem} />
                    </div>
                  </div>

                  {message.isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Solving problem...</span>
                    </div>
                  ) : message.solution && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Solution:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakSolution(message.solution)}
                          className="ml-auto"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <MathRenderer content={message.solution} />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No math problems solved yet. Start by entering a problem above!</p>
            </div>
          )}

          <MathChatHistory />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MathChat;
