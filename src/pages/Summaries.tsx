import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Moon, Sun, Sparkles, ArrowLeft, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import { useToast } from "@/components/ui/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Helper function to strip first Markdown heading
function stripFirstMarkdownHeading(summary: string) {
  return summary.replace(/^#+.*\n*/g, '').trim();
}

// Set up PDF.js worker for Vite
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

// Summary Card Component
const SummaryCard = ({ summary, filename, onView }: { summary: string, filename: string, onView: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewText = summary.slice(0, 150) + (summary.length > 150 ? "..." : "");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2a2a5e] hover:border-[#4a4a8e] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            {filename || "AI Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed mb-4">
            {isExpanded ? summary : previewText}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              {summary.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 px-3"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show More
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={onView}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-8 px-3"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Full
              </Button>
            </div>
            <DownloadNotesButton
              content={summary}
              filename={filename?.replace(".pdf", "_summary") || "summary"}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Loading Shimmer Component
const LoadingShimmer = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="bg-[#1a1a2e] border-[#2a2a5e] animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty State Component
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center py-16"
  >
    <div className="mb-6">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No summaries yet</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        Upload a lecture or use AI Notes to generate your first summary and boost your learning.
      </p>
    </div>
    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
      <Upload className="h-4 w-4 mr-2" />
      Upload Your First Document
    </Button>
  </motion.div>
);

export default function Summaries() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showSummaryAnim, setShowSummaryAnim] = useState(false);
  const [viewMode, setViewMode] = useState<'upload' | 'summary' | 'list'>('upload');

  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();
  const { toast } = useToast();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      setDarkMode(systemPrefersDark);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("❗ Please upload a PDF file only.");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setProgress(10);
    setExtractedText("");
    setSummary("");
    setShowSummaryAnim(false);
    startSession();

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      setProgress(30);

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
        setProgress(30 + (i / numPages) * 40);
      }

      setExtractedText(fullText);
      setProgress(70);
    } catch (error: any) {
      setError(`❗ Failed to process PDF: ${error.message}`);
      setProgress(0);
      endSession("summary", uploadedFile.name, false);
    }
  };

  const generateSummary = async () => {
    if (!extractedText.trim()) {
      toast({
        title: "No content to summarize",
        description: "Please upload a valid PDF file first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(85);

    try {
      // Call your existing AI summary API
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: extractedText,
          filename: file?.name || 'document'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary || data.response);
      setProgress(100);
      setShowSummaryAnim(true);
      setViewMode('summary');

      trackSummaryGeneration();
      endSession("summary", file?.name || 'document', true);

      toast({
        title: "Summary generated successfully! 🎉",
        description: "Your AI-powered summary is ready.",
      });

      setTimeout(() => setProgress(0), 1000);
    } catch (error: any) {
      setError(`❗ Failed to generate summary: ${error.message}`);
      setProgress(0);
      endSession("summary", file?.name || 'document', false);
      toast({
        variant: "destructive",
        title: "Error generating summary",
        description: error.message || "Please try again"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setExtractedText("");
    setSummary("");
    setProgress(0);
    setError("");
    setShowSummaryAnim(false);
    setViewMode('upload');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0a0a] via-[#1a0f2e] to-[#0a0a0a]">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 py-6 pb-32">
          <motion.div 
            className="w-full max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >

            {/* Header */}
            <div className="text-center mb-10 relative">
              
              {/* Back button (top-left) */}
              <div className="absolute top-0 left-0">
                <BackToDashboardButton size="sm" />
              </div>

              {/* Toggle Dark Mode Button (top-right) */}
              <div className="absolute top-0 right-0">
                <Button
                  onClick={toggleDarkMode}
                  variant="outline"
                  size="sm"
                  className="bg-[#322778] text-yellow-400 border-[#4a4a8e] hover:bg-[#4a4a8e] transition-all duration-300"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              {/* Title */}
              <motion.div 
                className="pt-12 md:pt-0"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                    AI Study Summarizer
                  </h1>
                </div>
                <p className="text-lg text-gray-400 font-medium flex items-center justify-center gap-2">
                  <Sparkles className="inline h-5 w-5 text-purple-400" />
                  Transform your PDF notes into smart summaries
                </p>
              </motion.div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-900/20 text-red-300 shadow-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 font-bold">!</span>
                  </div>
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            <AnimatePresence>
              {progress > 0 && progress < 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6"
                >
                  <div className="flex justify-between text-sm mb-3 text-blue-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing your document...
                    </span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-[#1a1a2e]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <AnimatePresence mode="wait">
              {viewMode === 'upload' && !file && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2a2a5e] hover:border-[#4a4a8e] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                    <CardContent className="p-8">
                      <div className="border-2 border-dashed border-[#4a4a8e] rounded-xl p-12 text-center hover:bg-[#1a1a2e]/60 transition-all duration-300">
                        <Upload className="mx-auto h-16 w-16 mb-6 text-purple-400" />
                        <div className="mb-6">
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-3"
                          >
                            <span className="text-xl font-semibold text-white">
                              Upload your PDF document
                            </span>
                            <span className="text-2xl">📄</span>
                            <input
                              id="file-upload"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-gray-400">Maximum file size: 50MB</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {file && !summary && (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2a2a5e] p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-blue-400" />
                      <span className="font-semibold text-white">{file.name}</span>
                      <span className="text-sm text-gray-400">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <p className="text-blue-400 text-sm mb-6">Ready to generate your AI summary! 🚀</p>
                  </Card>

                  <Button
                    onClick={generateSummary}
                    disabled={isProcessing || !extractedText}
                    className="px-8 py-4 text-lg font-bold rounded-full shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        Generate AI Summary
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {summary && viewMode === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
                    <DownloadNotesButton
                      content={summary}
                      filename={file?.name?.replace(".pdf", "_summary") || "summary"}
                    />
                    <BackToDashboardButton size="sm" />
                  </div>

                  <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2a2a5e] shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        AI Generated Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-6 rounded-xl bg-[#0f0f23]/60 border border-[#2a2a5e] min-h-[400px] overflow-y-auto max-h-[70vh]">
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-200 text-lg">
                          {stripFirstMarkdownHeading(summary)}
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-right text-gray-400 italic">
                        Summary generated • {new Date().toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Button */}
            <AnimatePresence>
              {(file || summary) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-8"
                >
                  <Button
                    onClick={resetAll}
                    variant="outline"
                    className="px-6 py-3 rounded-full bg-[#1a1a2e] border-[#2a2a5e] text-gray-300 hover:bg-[#2a2a5e] hover:text-white font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    🔄 Create New Summary
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <Footer />
    </div>
  );
}
