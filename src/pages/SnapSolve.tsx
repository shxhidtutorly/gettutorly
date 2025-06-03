
import { useState, useEffect } from "react";
import { Camera, Upload, Brain, Clock, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Import Tesseract.js types
declare global {
  interface Window {
    Tesseract: any;
  }
}

interface SnapSolveSession {
  question: string;
  answer: string;
  timestamp: number;
}

const SnapSolve = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [isProcessingOCR, setIsProcessingOCR] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Groq API key placeholder
  const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";

  useEffect(() => {
    // Load usage count from localStorage
    const count = localStorage.getItem('snapSolveUsageCount');
    setUsageCount(count ? parseInt(count) : 0);

    // Load Tesseract.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setExtractedText("");
      setAiAnswer("");
      setError("");
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractTextFromImage = async () => {
    if (!selectedImage || !window.Tesseract) {
      setError("Tesseract.js not loaded or no image selected");
      return;
    }

    setIsProcessingOCR(true);
    setError("");

    try {
      const { data: { text } } = await window.Tesseract.recognize(
        selectedImage,
        'eng',
        {
          logger: (m: any) => console.log(m)
        }
      );

      const cleanedText = text.trim();
      setExtractedText(cleanedText);
      
      if (cleanedText) {
        await getAIAnswer(cleanedText);
      } else {
        setError("No text could be extracted from the image. Please try a clearer image.");
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError("Failed to extract text from image. Please try again.");
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const getAIAnswer = async (question: string) => {
    if (GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
      setError("Please configure your Groq API key to get AI answers.");
      return;
    }

    setIsProcessingAI(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'user',
              content: `Answer this question clearly and concisely: ${question}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || 'No answer received from AI';
      setAiAnswer(answer);

      // Save session to localStorage
      saveSession(question, answer);
      
    } catch (err) {
      console.error('AI Error:', err);
      setError("Failed to get AI answer. Please check your API key and try again.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const saveSession = (question: string, answer: string) => {
    const session: SnapSolveSession = {
      question,
      answer,
      timestamp: Date.now()
    };

    // Save session
    const existingSessions = JSON.parse(localStorage.getItem('snapSolveSessions') || '[]');
    existingSessions.push(session);
    localStorage.setItem('snapSolveSessions', JSON.stringify(existingSessions));

    // Increment usage count
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('snapSolveUsageCount', newCount.toString());
  };

  const resetSession = () => {
    setSelectedImage(null);
    setImagePreview("");
    setExtractedText("");
    setAiAnswer("");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Camera className="h-8 w-8 text-blue-500" />
              Snap & Solve
            </h1>
            <p className="text-muted-foreground">
              Upload an image of a question and get instant AI-powered answers
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Questions Solved: {usageCount}
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image with text or math questions
                    </p>
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Uploaded question"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={extractTextFromImage}
                    disabled={!selectedImage || isProcessingOCR || isProcessingAI}
                    className="flex-1"
                  >
                    {isProcessingOCR ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Extracting Text...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Process Image
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetSession}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {extractedText && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Extracted Question:
                    </label>
                    <Textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      placeholder="Extracted text will appear here..."
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {isProcessingAI && (
                  <div className="flex items-center justify-center p-4">
                    <Clock className="h-6 w-6 mr-2 animate-spin text-blue-500" />
                    <span>Getting AI answer...</span>
                  </div>
                )}

                {aiAnswer && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      AI Answer:
                    </label>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="whitespace-pre-wrap">{aiAnswer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usage Info */}
          {usageCount > 0 && (
            <Card className="mt-6 dark:bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    You've solved {usageCount} questions using Snap & Solve
                  </span>
                  {usageCount > 10 && (
                    <Badge variant="secondary">
                      Heavy user! 🎉
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default SnapSolve;
