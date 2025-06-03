import { useState, useEffect, useRef } from "react";
import { Camera, Upload, Brain, Clock, CheckCircle, ImageIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Tesseract.js type for the global window object
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

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY; // Use env

const SnapSolve = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [isProcessingOCR, setIsProcessingOCR] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [tesseractLoaded, setTesseractLoaded] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Load Tesseract.js ---
  useEffect(() => {
    // Load usage count from localStorage
    let count = 0;
    try {
      count = parseInt(localStorage.getItem('snapSolveUsageCount') || "0", 10);
    } catch {}
    setUsageCount(count);

    // Only load if not already loaded
    if (!window.Tesseract) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.async = true;
      script.onload = () => setTesseractLoaded(true);
      script.onerror = () => setError("Failed to load Tesseract.js. Please refresh the page.");
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setTesseractLoaded(true);
    }
  }, []);

  // --- Handle Image Upload / Drag ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    readAndPreviewImage(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      readAndPreviewImage(event.dataTransfer.files[0]);
    }
  };

  const readAndPreviewImage = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setSelectedImage(file);
    setExtractedText("");
    setAiAnswer("");
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // --- OCR Extraction ---
  const extractTextFromImage = async () => {
    setError("");
    setExtractedText("");
    setAiAnswer("");
    if (!selectedImage) {
      setError("Please upload an image first.");
      return;
    }
    if (!window.Tesseract) {
      setError("Tesseract.js not loaded yet. Please wait a moment.");
      return;
    }
    setIsProcessingOCR(true);
    try {
      const { data: { text } } = await window.Tesseract.recognize(
        selectedImage,
        "eng",
        {
          logger: (m: any) => {
            // Optional: progress UI could be implemented here
            // console.log(m);
          }
        }
      );
      const cleanedText = (text || "").replace(/\s{2,}/g, " ").trim();
      setExtractedText(cleanedText);
      if (!cleanedText) {
        setError("No text could be extracted. Try a clearer image.");
      } else {
        // Optionally, immediately get AI answer:
        // await getAIAnswer(cleanedText);
      }
    } catch (err) {
      setError("Failed to extract text from image. Try a different image.");
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // --- AI Answer (Optional, not auto-called for safety) ---
  const getAIAnswer = async (question: string) => {
    setError("");
    setAiAnswer("");
    if (GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE" || !GROQ_API_KEY) {
      setError("Please configure your Groq API key for AI answers.");
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
      if (!response.ok) throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "No answer received from AI";
      setAiAnswer(answer);
      saveSession(question, answer);
    } catch {
      setError("Failed to get AI answer. Please check your API key and try again.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // --- Save Session to localStorage ---
  const saveSession = (question: string, answer: string) => {
    const session: SnapSolveSession = { question, answer, timestamp: Date.now() };
    let existingSessions: SnapSolveSession[] = [];
    try {
      existingSessions = JSON.parse(localStorage.getItem('snapSolveSessions') || "[]");
    } catch {}
    existingSessions.push(session);
    try {
      localStorage.setItem('snapSolveSessions', JSON.stringify(existingSessions));
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('snapSolveUsageCount', newCount.toString());
    } catch {}
  };

  const resetSession = () => {
    setSelectedImage(null);
    setImagePreview("");
    setExtractedText("");
    setAiAnswer("");
    setError("");
  };

  // --- UI ---
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
              Upload or snap an image of a question and get instant OCR & AI-powered answers
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Questions Solved: {usageCount}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload / Snap Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label
                  htmlFor="image-upload"
                  className="border-2 border-dashed border-muted rounded-lg p-6 text-center block cursor-pointer focus:outline-none"
                  tabIndex={0}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="max-w-full h-auto rounded-lg border mx-auto"
                    />
                  ) : (
                    <div>
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click or drag & drop image here (you can also take a photo)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                </label>

                <div className="flex gap-2">
                  <Button
                    onClick={extractTextFromImage}
                    disabled={!selectedImage || isProcessingOCR || isProcessingAI || !tesseractLoaded}
                    className="flex-1"
                  >
                    {isProcessingOCR ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Extract Text
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
                      placeholder="Extracted text from image appears here..."
                      className="min-h-[100px]"
                      disabled={isProcessingAI}
                    />
                    <Button
                      className="mt-2"
                      disabled={isProcessingAI || !extractedText}
                      onClick={() => getAIAnswer(extractedText)}
                    >
                      {isProcessingAI ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Getting AI answer...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Get AI Answer
                        </>
                      )}
                    </Button>
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
