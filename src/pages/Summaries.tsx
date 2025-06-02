import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, Loader2, Moon, Sun, BookOpen, Sparkles, ArrowLeft, FileType2, FileText as FileTextIcon } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// PDF.js worker for Vite
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

// Optional: Lottie animation JSON (you can replace with your preferred animation)
const loaderSVG = (
  <svg className="mx-auto animate-spin h-16 w-16 text-blue-500" viewBox="0 0 50 50">
    <circle
      className="opacity-30"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    />
    <circle
      className="opacity-80"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeDasharray="31.415, 31.415"
      strokeLinecap="round"
      transform="rotate(72 25 25)"
    />
  </svg>
);

export default function Summaries() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showSummaryAnim, setShowSummaryAnim] = useState(false);
  const [showLoaderAnim, setShowLoaderAnim] = useState(false);
  const [progressMsg, setProgressMsg] = useState("Processing your document...");

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

  // Progress message
  useEffect(() => {
    if (progress >= 100) {
      setProgressMsg("Summary generated!");
    } else {
      setProgressMsg("Processing your document...");
    }
  }, [progress]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  // File type guard
  const isSupportedFileType = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return (
      file.type === "application/pdf" ||
      (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        ext === "docx") ||
      (file.type === "text/plain" || ext === "txt" || ext === "md") ||
      (file.type === "text/html" || ext === "html" || ext === "htm")
    );
  };

  const getFileType = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (file.type === "application/pdf" || ext === "pdf") return "PDF";
    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    )
      return "DOCX";
    if (file.type === "text/plain" || ext === "txt" || ext === "md") return "TXT";
    if (file.type === "text/html" || ext === "html" || ext === "htm") return "HTML";
    return "UNKNOWN";
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!isSupportedFileType(uploadedFile)) {
      setError("Please upload a PDF, DOCX, TXT, MD, or HTML file only.");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setProgress(10);
    setExtractedText("");
    setSummary("");
    setShowSummaryAnim(false);

    try {
      let text = "";
      const type = getFileType(uploadedFile);

      // Animate loader
      setShowLoaderAnim(true);

      if (type === "PDF") {
        // PDF Extraction
        const arrayBuffer = await uploadedFile.arrayBuffer();
        setProgress(30);

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        let fullText = "";

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
          setProgress(30 + (i / numPages) * 40);
        }
        text = fullText;
      } else if (type === "DOCX") {
        // DOCX Extraction with mammoth
        const arrayBuffer = await uploadedFile.arrayBuffer();
        setProgress(30);
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        setProgress(70);
      } else if (type === "TXT") {
        // TXT/MD Extraction with FileReader
        setProgress(30);
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(uploadedFile);
        });
        setProgress(70);
      } else if (type === "HTML") {
        // HTML Extraction with DOMParser
        setProgress(30);
        const htmlText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(uploadedFile);
        });
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        text = doc.body.innerText || "";
        setProgress(70);
      }

      setExtractedText(text);
      setProgress(80);
      setShowLoaderAnim(false);
    } catch (error: any) {
      setError(`Failed to process file: ${error.message}`);
      setProgress(0);
      setShowLoaderAnim(false);
    }
  };

  // Summary generation with animation
  const generateSummary = async () => {
    if (!extractedText.trim()) {
      setError("No text available to summarize");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(80);
    setShowLoaderAnim(true);
    setProgressMsg("Generating summary...");

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
      setTimeout(() => {
        setShowSummaryAnim(true);
        setShowLoaderAnim(false);
      }, 350); // Give a moment for progress bar to finish
    } catch (error: any) {
      setError(`Failed to generate summary: ${error.message}`);
      setProgress(80);
      setShowLoaderAnim(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.[^.]+$/, "")}_summary.txt` || "summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setExtractedText("");
    setSummary("");
    setProgress(0);
    setError("");
    setShowSummaryAnim(false);
    setShowLoaderAnim(false);
    setProgressMsg("Processing your document...");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-black" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <Navbar />

      {/* Back to Dashboard button */}
      <div className="fixed top-6 left-6 z-30">
        <Button
          asChild
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 transition
            ${darkMode
              ? "bg-gray-900 border-gray-700 text-gray-100 hover:bg-gray-800"
              : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"}
          `}
        >
          <a href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </a>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header with Dark Mode Toggle */}
          <div className="text-center mb-8 relative">
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

            <div className="flex items-center justify-center mb-4">
              <BookOpen className={`h-8 w-8 mr-3 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              <h1
                className={`text-4xl font-bold bg-gradient-to-r ${
                  darkMode
                    ? "from-blue-400 to-purple-400 text-transparent bg-clip-text"
                    : "from-blue-600 to-purple-600 text-transparent bg-clip-text"
                }`}
              >
                AI Study Summarizer
              </h1>
            </div>
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Transform your documents into concise, intelligent summaries
            </p>
            <div className="flex items-center justify-center mt-2">
              <Sparkles className={`h-4 w-4 mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-500"}`} />
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Powered by Advanced AI • <span className="ml-1 font-medium">Text Extraction (In-browser)</span>
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg border-l-4 ${
                darkMode
                  ? "bg-red-900/20 border-red-500 text-red-300"
                  : "bg-red-50 border-red-500 text-red-700"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 4a1 1 0 00-2 0v4a1 1 0 002 0v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar & Loader */}
          {progress > 0 && (
            <div className="mb-6">
              <div
                className={`flex justify-between text-sm mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <span className="flex items-center">
                  {progress < 100 ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-400 animate-bounce" />
                  )}
                  {progressMsg}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className={`h-3 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              />
            </div>
          )}

          {/* Loader Animation */}
          {showLoaderAnim && (
            <div className="flex justify-center items-center mb-6">
              {/* You can replace the SVG loader below with a Lottie animation if desired */}
              {loaderSVG}
            </div>
          )}

          {/* File Upload */}
          {!summary && (
            <div
              className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 hover:border-blue-400 ${
                  darkMode
                    ? "border-gray-600 hover:bg-gray-700/50"
                    : "border-gray-300 hover:bg-blue-50/50"
                }`}
              >
                <Upload
                  className={`mx-auto h-12 w-12 mb-4 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span
                      className={`text-lg font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Choose a PDF, DOCX, TXT, MD, or HTML file to upload
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf, .docx, .txt, .md, .html, .htm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Only accepts PDF, DOCX, TXT, MD, or HTML files (max 50MB)
                </p>
                {file && (
                  <div
                    className={`mt-4 inline-flex items-center px-3 py-2 rounded-lg ${
                      darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <FileType2 className="h-4 w-4 mr-2" />
                    <span className="font-medium">{file.name}</span>
                    <span className="ml-2 text-sm opacity-75">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <span className="ml-2 rounded px-2 py-0.5 text-xs bg-blue-600 text-white">{getFileType(file)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Summary Button */}
          {extractedText && !summary && (
            <div className="text-center mb-6">
              <Button
                onClick={generateSummary}
                disabled={isProcessing}
                className={`px-8 py-4 text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating AI Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-5 w-5" />
                    Generate AI Summary
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Summary Display with animation */}
          {summary && (
            <div
              className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-500 ${
                showSummaryAnim ? "animate-fade-in-up" : "opacity-0"
              } ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-100"
              }`}
              style={{
                animation: showSummaryAnim
                  ? "fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both"
                  : undefined,
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-semibold flex items-center ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Generated Summary
                </h3>
                <Button
                  onClick={downloadSummary}
                  variant="outline"
                  size="sm"
                  className={`transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Summary
                </Button>
              </div>
              <div
                className={`p-5 rounded-lg border-l-4 ${
                  darkMode
                    ? "bg-gray-900/50 border-blue-500 text-gray-200"
                    : "bg-blue-50 border-blue-500 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
              </div>
              <div className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Summary generated • {new Date().toLocaleString()}
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(file || summary) && (
            <div className="text-center">
              <Button
                onClick={resetAll}
                variant="outline"
                className={`px-6 py-3 transition-all duration-300 ${
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
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        `}
      </style>
    </div>
  );
}
