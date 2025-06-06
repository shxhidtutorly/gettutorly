import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, Loader2, Moon, Sun, BookOpen, Sparkles, ArrowLeft } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import * as pdfjsLib from "pdfjs-dist";

// Helper function to strip first Markdown heading
function stripFirstMarkdownHeading(summary: string) {
  return summary.replace(/^#+.*\n*/g, '').trim();
}

// Set up PDF.js worker for Vite
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

export default function Summaries() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showSummaryAnim, setShowSummaryAnim] = useState(false);
  
  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      setDarkMode(systemPrefersDark);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setProgress(10);
    startSession(); // Start tracking session

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
      setError(`Failed to process PDF: ${error.message}`);
      setProgress(0);
      endSession('summary', uploadedFile.name, false);
    }
  };

  const generateSummary = async () => {
    if (!extractedText.trim()) {
      setError("No text available to summarize");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(70);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: extractedText
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${responseText.substring(0, 100)}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.summary) {
        throw new Error("No summary received from API");
      }

      setSummary(data.summary);
      setProgress(100);
      setShowSummaryAnim(false);
      setTimeout(() => setShowSummaryAnim(true), 100);
      
      // Track summary generation
      trackSummaryGeneration();
      endSession('summary', file?.name || 'Summary', true);
      
    } catch (error: any) {
      setError(`Failed to generate summary: ${error.message}`);
      setProgress(70);
      endSession('summary', file?.name || 'Summary', false);
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
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? "bg-black"
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <Navbar />

      <div className="container mx-auto px-4 py-4 md:py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header with Dark Mode Toggle and Back Button */}
          <div className="text-center mb-6 md:mb-8 relative">
            <div className="absolute top-0 left-0">
              <BackToDashboardButton size="sm" />
            </div>
            
            <div className="absolute top-0 right-0">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className={`transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-center mb-4 pt-12 md:pt-0">
              <BookOpen className={`h-6 w-6 md:h-8 md:w-8 mr-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              <h1 className={`text-2xl md:text-4xl font-bold bg-gradient-to-r ${
                darkMode
                  ? "from-blue-400 to-purple-400 text-transparent bg-clip-text"
                  : "from-blue-600 to-purple-600 text-transparent bg-clip-text"
              }`}>
                AI Study Summarizer
              </h1>
            </div>
            <p className={`text-sm md:text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Transform your PDF documents into concise, intelligent summaries
            </p>
            <div className="flex items-center justify-center mt-2">
              <Sparkles className={`h-4 w-4 mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-500"}`} />
              <span className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Powered by Advanced AI
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              darkMode
                ? "bg-red-900/20 border-red-500 text-red-300"
                : "bg-red-50 border-red-500 text-red-700"
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 4a1 1 0 00-2 0v4a1 1 0 002 0v-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-6">
              <div className={`flex justify-between text-sm mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing your document...
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className={`h-3 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              />
            </div>
          )}

          {/* File Upload */}
          <div className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-100"
          }`}>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 hover:border-blue-400 ${
              darkMode
                ? "border-gray-600 hover:bg-gray-700/50"
                : "border-gray-300 hover:bg-blue-50/50"
            }`}>
              <Upload className={`mx-auto h-12 w-12 mb-4 ${
                darkMode ? "text-gray-400" : "text-gray-400"
              }`} />
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className={`text-lg font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}>
                    Choose a PDF file to upload
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Supports PDF files up to 50MB
              </p>
              {file && (
                <div className={`mt-4 inline-flex items-center px-3 py-2 rounded-lg ${
                  darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                }`}>
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="font-medium">{file.name}</span>
                  <span className="ml-2 text-sm opacity-75">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Text Preview */}
          {extractedText && (
            <div className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100"
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}>
                <FileText className="h-5 w-5 mr-2" />
                Extracted Content Preview
              </h3>
              <div className={`p-4 rounded-lg max-h-40 overflow-y-auto ${
                darkMode ? "bg-gray-900/50 border border-gray-600" : "bg-gray-50 border border-gray-200"
              }`}>
                <p className={`text-sm whitespace-pre-wrap ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && "..."}
                </p>
              </div>
              <div className={`mt-3 text-sm flex justify-between ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                <span>Total characters: {extractedText.length.toLocaleString()}</span>
                <span>Ready for summarization</span>
              </div>
            </div>
          )}

          {/* Generate Summary Button */}
          {extractedText && !summary && (
            <div className="text-center mb-6">
              <Button
                onClick={generateSummary}
                disabled={isProcessing}
                className={`px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-3 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    Generating AI Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-4 w-4 md:h-5 md:w-5" />
                    Generate AI Summary
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Summary Display */}
          {summary && (
            <div>
              {/* Action buttons */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
                <DownloadNotesButton 
                  content={summary}
                  filename={file?.name?.replace('.pdf', '_summary') || 'summary'}
                />
              </div>
              
              <div
                className={`rounded-2xl md:rounded-3xl shadow-2xl border-2 border-blue-400/60 p-6 md:p-10 mb-6 md:mb-10 mx-auto transition-all duration-500 bg-gradient-to-br ${
                  darkMode
                    ? "from-gray-900 via-gray-800 to-gray-900 border-blue-900/40"
                    : "from-white via-blue-50 to-purple-100 border-blue-400/60"
                } min-h-[300px] md:min-h-[450px] max-h-[500px] md:max-h-[650px] flex flex-col justify-between animate-fade-in-up`}
                style={{
                  animation: showSummaryAnim
                    ? "fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) both"
                    : undefined,
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-lg md:text-2xl font-bold flex items-center ${
                      darkMode ? "text-blue-200" : "text-blue-900"
                    }`}
                  >
                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 mr-3 text-yellow-400 animate-pulse" />
                    AI Generated Summary
                  </h3>
                </div>
                <div className={`p-4 md:p-6 rounded-lg border-l-4 overflow-y-auto min-h-[200px] md:min-h-[320px] max-h-[300px] md:max-h-[380px] mt-3 mb-2 ${
                  darkMode
                    ? "bg-gray-900/70 border-blue-500 text-gray-100"
                    : "bg-blue-50 border-blue-400 text-gray-900"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-lg">
                    {stripFirstMarkdownHeading(summary)}
                  </p>
                </div>
                <div className={`mt-5 text-xs md:text-sm text-right italic ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Summary generated • {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(file || summary) && (
            <div className="text-center">
              <Button
                onClick={resetAll}
                variant="outline"
                className={`px-4 md:px-6 py-2 md:py-3 transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Start New Summary
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
      <Footer />

      {/* Animation styles */}
      <style>
        {`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(70px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        `}
      </style>
    </div>
  );
}
