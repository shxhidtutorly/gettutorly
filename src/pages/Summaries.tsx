import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, Loader2, Moon, Sun, BookOpen, Sparkles, ArrowLeft } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker for Vite
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

export default function Summaries() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showSummaryAnim, setShowSummaryAnim] = useState(false);

  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();

  // Dark mode sync
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(saved ? JSON.parse(saved) : sys);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // File upload handler (no preview, instant summary)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    setFile(uploadedFile);
    setError("");
    setSummary("");
    setProgress(10);
    startSession();

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      setProgress(30);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        setProgress(30 + (i / pdf.numPages) * 40);
      }
      await generateSummary(fullText);
    } catch (error: any) {
      setError(`Failed to process PDF: ${error.message}`);
      setProgress(0);
      endSession("summary", uploadedFile.name, false);
    }
  };

  // Generate summary (request longer output)
  const generateSummary = async (text: string) => {
    if (!text.trim()) {
      setError("No text available to summarize");
      return;
    }
    setIsProcessing(true);
    setError("");
    setProgress(70);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length: "long" }),
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response format");
      }
      if (data.error) throw new Error(data.error);
      if (!data.summary) throw new Error("No summary received from API");
      setSummary(data.summary);
      setProgress(100);
      setShowSummaryAnim(false);
      setTimeout(() => setShowSummaryAnim(true), 100);
      trackSummaryGeneration();
      endSession("summary", file?.name || "Summary", true);
    } catch (error: any) {
      setError(`Failed to generate summary: ${error.message}`);
      setProgress(70);
      endSession("summary", file?.name || "Summary", false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset session/history
  const resetAll = () => {
    setFile(null);
    setSummary("");
    setProgress(0);
    setError("");
    setShowSummaryAnim(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 bg-gradient-to-br from-[#101542] via-[#221b44] to-[#311d5a] dark:from-[#0a0e2b] dark:via-[#1b1336] dark:to-[#230a4a]`}
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #0a0e2b 0%, #1b1336 50%, #230a4a 100%)"
          : "linear-gradient(135deg, #101542 0%, #221b44 50%, #311d5a 100%)",
      }}
    >
      <Navbar />

      {/* Back to Dashboard */}
      <div className="fixed top-4 left-4 z-40">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/dashboard")}
          className="flex items-center gap-2 text-md font-semibold bg-gradient-to-r from-blue-900/80 to-purple-800/70 text-white hover:brightness-150 rounded-xl shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" /> Dashboard
        </Button>
      </div>

      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <Button onClick={() => setDarkMode((d) => !d)} size="icon" className="rounded-full shadow-lg bg-gradient-to-br from-purple-700 to-blue-800 text-yellow-300 hover:scale-110 transition-all">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 pb-24 flex flex-col items-center">
        {/* Title & Stats */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 mr-2 text-blue-400 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              ✨ Study Summaries
            </h1>
          </div>
          <p className="text-md md:text-xl text-gray-300 font-medium">
            Instantly turn your PDFs into beautiful, detailed AI-powered notes!
          </p>
        </div>

        {/* Stats Row */}
        <div className="w-full max-w-3xl flex flex-wrap gap-4 justify-center mb-10 animate-fade-in-up">
          <StatCard icon="📄" label="PDFs Summarized" value="12" accent="from-pink-500 to-orange-400" />
          <StatCard icon="⏱️" label="Avg. Session" value="2m 11s" accent="from-blue-500 to-purple-500" />
          <StatCard icon="🤖" label="AI Power" value="GPT-4" accent="from-green-400 to-blue-400" />
        </div>

        {/* Upload Card */}
        {!summary && (
          <Card className="max-w-xl w-full p-8 bg-gradient-to-tr from-[#181b36] via-[#23204a] to-[#38146e] border-0 animate-fade-in-up shadow-xl">
            <div className="flex flex-col items-center">
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center mb-6 transition-transform active:scale-95">
                <span className="mb-2 text-lg text-blue-200 font-semibold flex items-center gap-2">
                  <Upload className="h-6 w-6" /> Upload PDF
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-sm text-gray-400">Only PDF files up to 50MB</span>
              </label>
              {isProcessing && (
                <>
                  <Progress value={progress} className="w-full mb-4 bg-gray-800" />
                  <div className="text-blue-300 flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" /> Generating summary...
                  </div>
                </>
              )}
              {error && <div className="text-red-400 mt-4">{error}</div>}
            </div>
          </Card>
        )}

        {/* Summary Card */}
        {summary && (
          <Card className={`max-w-2xl w-full p-8 mt-10 shadow-2xl border-0 animate-fade-in-up bg-gradient-to-br from-[#21255a] via-[#341c57] to-[#3b146e]`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-400 animate-pulse h-6 w-6" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  AI Generated Summary
                </h3>
              </div>
              {/* Download Button */}
              <DownloadNotesButton content={summary} filename={file?.name?.replace('.pdf', '_summary') || 'summary'} />
            </div>
            <div className="rounded-xl p-6 border-l-4 border-blue-500 bg-gradient-to-br from-[#23285a] to-[#2d1555] text-lg text-blue-100 shadow-xl animate-fade-in-up whitespace-pre-line">
              <span role="img" aria-label="star">🌟</span>
              <span className="ml-2">{summary}</span>
            </div>
            <div className="mt-4 text-xs text-right text-blue-300 italic">
              Summary generated • {new Date().toLocaleString()}
            </div>
            <div className="text-center mt-8">
              <Button
                onClick={resetAll}
                variant="outline"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition shadow-lg border-0"
              >
                New Session
              </Button>
            </div>
          </Card>
        )}
      </div>
      <BottomNav />
      <Footer />

      {/* Animation styles */}
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(70px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-up { animation: fadeInUp 0.9s cubic-bezier(0.23,1,0.32,1) both;}
        `}
      </style>
    </div>
  );
}
