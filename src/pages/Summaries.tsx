import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, Loader2, Moon, Sun, BookOpen, Sparkles, ArrowLeft } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker for Vite
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

export default function Summaries() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

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
    } catch (error: any) {
      setError(`Failed to generate summary: ${error.message}`);
      setProgress(70);
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
    a.download = `${file?.name.replace('.pdf', '')}_summary.txt` || "summary.txt";
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
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? "bg-black"
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <Navbar />

      {/* Back to Dashboard button */}
      <div className="fixed top-6 left-6 z-30">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 transition
            ${darkMode
              ? "bg-gray-900 border-gray-700 text-gray-100 hover:bg-gray-800"
              : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"}
          `}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
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
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${
                darkMode
                  ? "from-blue-400 to-purple-400 text-transparent bg-clip-text"
                  : "from-blue-600 to-purple-600 text-transparent bg-clip-text"
              }`}>
                AI Study Summarizer
              </h1>
            </div>
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Transform your PDF documents into concise, intelligent summaries
            </p>
            <div className="flex items-center justify-center mt-2">
              <Sparkles className={`h-4 w-4 mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-500"}`} />
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L1[...]
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

          {/* Summary Display */}
          {summary && (
            <div className={`rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100"
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold flex items-center ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}>
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
              <div className={`p-5 rounded-lg border-l-4 ${
                darkMode
                  ? "bg-gray-900/50 border-blue-500 text-gray-200"
                  : "bg-blue-50 border-blue-500 text-gray-800"
              }`}>
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
    </div>
  );
}
