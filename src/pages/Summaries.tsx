import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Moon, Sun, Sparkles, ArrowLeft } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
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

export default function Summaries() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showSummaryAnim, setShowSummaryAnim] = useState(false);

  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();

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
      setError("❗ No text available to summarize");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(80);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: extractedText,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${responseText.substring(0, 100)}`
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          `Invalid response format: ${responseText.substring(0, 100)}...`
        );
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

      trackSummaryGeneration();
      endSession("summary", file?.name || "Summary", true);
    } catch (error: any) {
      setError(`❗ Failed to generate summary: ${error.message}`);
      setProgress(70);
      endSession("summary", file?.name || "Summary", false);
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
    <div
      className={`min-h-screen transition-colors duration-300 dark bg-gradient-to-br from-[#1e2140] via-[#21264b] to-[#151727] relative overflow-x-hidden`}
    >
      <Navbar />

      <div className="container mx-auto px-4 py-4 md:py-8 pb-28">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10 relative">
            <div className="absolute top-0 left-0">
              <BackToDashboardButton size="sm" />
            </div>
            <div className="absolute top-0 right-0">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className={`transition-all duration-300 shadow-md border-0 ${
                  darkMode
                    ? "bg-[#322778] text-yellow-400"
                    : "bg-white text-gray-700"
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4 pt-12 md:pt-0">
              <span className="text-3xl md:text-4xl">📚</span>
              <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] tracking-tight">
                AI Study Summarizer
              </h1>
              <span className="text-3xl md:text-4xl">✨</span>
            </div>
            <p className="text-md md:text-lg text-gray-400 font-medium flex items-center justify-center gap-2">
              <Sparkles className="inline h-5 w-5 text-yellow-400" />
              Turn your PDF notes into smart summaries!
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border-l-4 border-pink-500 bg-pink-800/30 text-pink-200 shadow-lg flex items-center gap-2 animate-bounce-in">
              <span className="text-xl">🚨</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2 text-blue-200">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-[#21264b]" />
            </div>
          )}

          {/* File Upload */}
          {!file && (
            <div className="rounded-xl shadow-2xl p-6 mb-6 bg-[#232453] border border-[#35357a] hover:shadow-blue-600/40 transition-all duration-300">
              <div className="border-2 border-dashed border-[#44449a] rounded-xl p-8 text-center hover:bg-[#20214e]/60 transition-all duration-300">
                <Upload className="mx-auto h-12 w-12 mb-4 text-blue-400" />
                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-lg font-semibold text-blue-200">
                      Upload your PDF here
                    </span>
                    <span className="text-2xl">⬆️</span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-blue-300">Max size: 50MB</p>
              </div>
            </div>
          )}

          {/* Show file info and Generate Summary */}
          {file && !summary && (
            <div>
              <div className="rounded-xl shadow-xl p-6 mb-6 bg-[#232453] border border-[#35357a] flex flex-col items-center">
                <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-300" />
                  <span className="font-medium text-blue-200">{file.name}</span>
                  <span className="text-sm text-blue-300">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <span className="mt-2 text-blue-400 text-sm">
                  Ready to summarize! 🚀
                </span>
              </div>
              <div className="text-center mb-6">
                <Button
                  onClick={generateSummary}
                  disabled={isProcessing || !extractedText}
                  className="px-8 py-4 text-lg font-bold rounded-full shadow-xl bg-gradient-to-r from-[#43e97b] to-[#38f9d7] text-[#232453] hover:from-[#38f9d7] hover:to-[#43e97b] transition-transform duration-300 transform hover:scale-105 flex items-center gap-3 border-0"
                  style={{ boxShadow: "0 2px 40px 0 #43e97b33" }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Summarizing...
                      <span className="text-xl">🤖</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 text-yellow-400 animate-bounce" />
                      Generate AI Summary
                      <span className="text-xl">⚡</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Summary Display */}
          {summary && (
            <div>
              {/* Action buttons */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
                <DownloadNotesButton
                  content={summary}
                  filename={file?.name?.replace(".pdf", "_summary") || "summary"}
                />
                <BackToDashboardButton
                  size="sm"
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] text-white font-semibold shadow-lg px-4 py-2 rounded-full border-0 hover:from-[#22d3ee] hover:to-[#8b5cf6] transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </BackToDashboardButton>
              </div>

              <div
                className={`rounded-3xl shadow-2xl border-2 border-[#43e97b] p-6 md:p-10 mb-10 mx-auto transition-all duration-500 bg-gradient-to-br from-[#232453] via-[#17173a] to-[#1e2140] min-h-[400px] md:min-h-[600px] max-h-[900px] md:max-h-[1200px] flex flex-col justify-between animate-fade-in-up`}
                style={{
                  animation: showSummaryAnim
                    ? "fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) both"
                    : undefined,
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-extrabold flex items-center text-[#43e97b] gap-2">
                    <span className="text-2xl">🧠</span>
                    AI Generated Summary
                  </h3>
                  <span className="text-2xl animate-pulse">🌟</span>
                </div>
                <div className="p-4 md:p-6 rounded-lg border-l-4 overflow-y-auto min-h-[320px] md:min-h-[520px] max-h-[700px] md:max-h-[900px] mt-3 mb-2 bg-[#21264b]/80 border-[#43e97b] text-blue-50">
                  <p className="whitespace-pre-wrap leading-relaxed text-lg font-medium">
                    {stripFirstMarkdownHeading(summary)}
                  </p>
                </div>
                <div className="mt-5 text-xs md:text-sm text-right italic text-blue-400">
                  Summary generated • {new Date().toLocaleString()}{" "}
                  <span className="text-lg">✅</span>
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
                className="px-6 py-3 rounded-full bg-[#21264b] border-[#35357a] text-blue-200 hover:bg-[#35357a] font-semibold shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                🔄 Start New Summary
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
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0.2;}
          60% { transform: scale(1.05); opacity: 1;}
          80% { transform: scale(0.98);}
          100% { transform: scale(1);}
        }
        .animate-bounce-in {
          animation: bounce-in 0.7s;
        }
        `}
      </style>
    </div>
  );
}
