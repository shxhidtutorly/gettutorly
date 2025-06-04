import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  Loader2,
  FileImage,
  Brain,
  Zap,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";

const SnapSolve = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<"upload" | "ocr" | "ai" | "complete">("upload");
  const [progress, setProgress] = useState(0);
  const [usageCount, setUsageCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { trackSnapSolveUsage, endSession, startSession } = useStudyTracking();

  // Load usage count from localStorage
  useEffect(() => {
    const count = localStorage.getItem("snapSolveUsageCount");
    if (count) {
      setUsageCount(parseInt(count));
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setCurrentStep("upload");
    setExtractedText("");
    setAiAnswer("");
    setProgress(0);
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setCurrentStep("ocr");
    setProgress(10);
    startSession();

    try {
      setProgress(20);

      // Use Tesseract.js directly from npm
      const { data: { text } } = await Tesseract.recognize(
        selectedImage,
        "eng",
        {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setProgress(20 + m.progress * 50); // 20-70% for OCR
            }
          },
        }
      );

      if (!text.trim()) {
        throw new Error("No text detected in the image. Please try with a clearer image.");
      }

      setExtractedText(text.trim());
      setProgress(70);
      setCurrentStep("ai");

      // Get AI answer using Groq
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Answer this question clearly and concisely: ${text.trim()}`,
          model: "groq",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setAiAnswer(data.response || "No answer received");
      setProgress(100);
      setCurrentStep("complete");

      // Track usage
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem("snapSolveUsageCount", newCount.toString());
      trackSnapSolveUsage();

      // Store session data
      const session = {
        question: text.trim(),
        answer: data.response || "No answer received",
        timestamp: new Date().toISOString(),
      };

      const sessions = JSON.parse(localStorage.getItem("snapSolveSessions") || "[]");
      sessions.push(session);
      localStorage.setItem("snapSolveSessions", JSON.stringify(sessions));

      endSession("snap-solve", "Question solved", true);

      toast({
        title: "Question solved!",
        description: "AI has analyzed your image and provided an answer.",
      });

      // Show usage warning if needed
      if (newCount >= 10) {
        toast({
          title: "Usage Notice",
          description: `You've used Snap & Solve ${newCount} times today. Consider taking breaks between sessions.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setCurrentStep("upload");
      setProgress(0);
      endSession("snap-solve", "Processing failed", false);

      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again with a different image.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setImagePreview("");
    setExtractedText("");
    setAiAnswer("");
    setCurrentStep("upload");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStepIcon = (step: typeof currentStep) => {
    switch (step) {
      case "upload":
        return <Upload className="h-5 w-5" />;
      case "ocr":
        return <FileImage className="h-5 w-5" />;
      case "ai":
        return <Brain className="h-5 w-5" />;
      case "complete":
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getStepTitle = (step: typeof currentStep) => {
    switch (step) {
      case "upload":
        return "Upload Image";
      case "ocr":
        return "Extracting Text...";
      case "ai":
        return "Getting AI Answer...";
      case "complete":
        return "Complete!";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center mb-4">
              <Camera className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">Snap & Solve</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Take a photo of any math or text question and get instant AI-powered answers
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="text-xs md:text-sm">
                <Zap className="h-3 w-3 mr-1" />
                Powered by Groq AI
              </Badge>
              <Badge variant="outline" className="text-xs md:text-sm">
                Questions solved: {usageCount}
              </Badge>
            </div>
          </div>

          <div className="flex justify-center mb-6 md:mb-8">
            <BackToDashboardButton />
          </div>

          {/* Progress Steps */}
          <div className="mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-4">
              {["upload", "ocr", "ai", "complete"].map((step, index) => (
                <div key={step} className={`flex items-center ${index < 3 ? "flex-1" : ""}`}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-colors ${
                      currentStep === step
                        ? "border-primary bg-primary text-primary-foreground"
                        : index < ["upload", "ocr", "ai", "complete"].indexOf(currentStep)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-muted"
                    }`}
                  >
                    {getStepIcon(step as typeof currentStep)}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 md:mx-4 rounded transition-colors ${
                        index < ["upload", "ocr", "ai", "complete"].indexOf(currentStep)
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-sm md:text-base">{getStepTitle(currentStep)}</h3>
              {isProcessing && <Progress value={progress} className="mt-2 max-w-md mx-auto" />}
            </div>
          </div>

          {/* Upload Section */}
          {!selectedImage && (
            <Card className="mb-6 md:mb-8">
              <CardContent className="p-6 md:p-8">
                <div
                  className="border-2 border-dashed border-muted rounded-lg p-6 md:p-12 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Upload Question Image</h3>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    Click to select an image containing a math problem or text question
                  </p>
                  <Button className="flex items-center gap-2 mx-auto">
                    <Upload className="h-4 w-4" />
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Preview and Processing */}
          {selectedImage && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <FileImage className="h-5 w-5" />
                    Uploaded Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded question"
                      className="max-w-full max-h-64 md:max-h-96 mx-auto rounded-lg shadow-lg mb-4"
                    />
                    <div className="flex flex-col md:flex-row gap-3 justify-center">
                      <Button
                        onClick={processImage}
                        disabled={isProcessing}
                        className="flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4" />
                        )}
                        {isProcessing ? "Processing..." : "Solve Question"}
                      </Button>
                      <Button
                        onClick={resetApp}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Upload Different Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted Text */}
              {extractedText && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <FileImage className="h-5 w-5" />
                      Extracted Question
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={extractedText}
                      readOnly
                      className="min-h-24 resize-none text-sm md:text-base"
                      placeholder="Extracted text will appear here..."
                    />
                  </CardContent>
                </Card>
              )}

              {/* AI Answer */}
              {aiAnswer && (
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-green-700 dark:text-green-300">
                      <Brain className="h-5 w-5" />
                      AI Answer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 md:p-6 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                        {aiAnswer}
                      </p>
                    </div>
                    <div className="mt-4 text-xs md:text-sm text-muted-foreground text-center">
                      Answer generated on {new Date().toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Usage Statistics */}
          {usageCount > 0 && (
            <Card className="mt-6 md:mt-8">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-primary">{usageCount}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Questions</p>
                  </div>
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-green-600">
                      {JSON.parse(localStorage.getItem("snapSolveSessions") || "[]").length}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">Successful Solves</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-lg md:text-2xl font-bold text-blue-600">
                      {usageCount >= 10 ? "10+" : Math.max(10 - usageCount, 0)}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {usageCount >= 10 ? "Daily Limit Reached" : "Remaining Today"}
                    </p>
                  </div>
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
