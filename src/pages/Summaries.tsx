import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Sparkles, Type, Trash2 } from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import { useToast } from "@/components/ui/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// --- PDF.js Worker Setup ---
// This ensures that the PDF processing happens in a background thread.
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

// --- Helper function to clean up the summary ---
function stripFirstMarkdownHeading(summary: string) {
  return summary.replace(/^#+.*\n*/g, '').trim();
}

// --- Main Summarizer Component ---
export default function Summaries() {
  // State management
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();
  const { toast } = useToast();

  // --- Handlers for file upload and text extraction ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    
    resetStateForNewInput();
    setFile(uploadedFile);
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
      setExtractedText(fullText);
      setProgress(70);
    } catch (err: any) {
      setError(`Failed to process PDF: ${err.message}`);
      setProgress(0);
      endSession("summary", uploadedFile.name, false);
    }
  };

  // --- Handler for summary generation ---
  const generateSummary = async () => {
    const textToSummarize = inputType === 'upload' ? extractedText : pastedText;
    const sourceName = inputType === 'upload' ? file?.name : 'Pasted Text';

    if (!textToSummarize.trim()) {
      toast({ title: "No content to summarize.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProgress(85);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSummarize, filename: sourceName || 'document' }),
      });

      if (!response.ok) throw new Error('Failed to generate summary from the server.');

      const data = await response.json();
      setSummary(data.summary || data.response);
      setProgress(100);
      trackSummaryGeneration();
      endSession("summary", sourceName || 'document', true);
      toast({ title: "Summary generated successfully! 🎉" });
      setTimeout(() => setProgress(0), 1000);
    } catch (err: any) {
      setError(`Failed to generate summary: ${err.message}`);
      setProgress(0);
      endSession("summary", sourceName || 'document', false);
      toast({ title: "Error generating summary", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- State reset functions ---
  const resetStateForNewInput = () => {
    setError("");
    setExtractedText("");
    setSummary("");
    setProgress(0);
    setFile(null);
    setPastedText("");
  };

  const resetAll = () => {
    resetStateForNewInput();
    setInputType('upload');
  };

  const isReadyToGenerate = (inputType === 'upload' && extractedText) || (inputType === 'text' && pastedText.trim());

  // --- Neon Brutalist Styling ---
  const neonColors = {
    cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]',
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          
          {/* --- Header --- */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 relative"
          >
            <div className="absolute top-0 left-0">
                <BackToDashboardButton />
            </div>
            <div className="flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-cyan-400"/>
                <h1 className="text-4xl md:text-5xl font-black text-white">AI Summarizer</h1>
            </div>
            <p className="text-gray-400 mt-2">Generate concise summaries from PDFs or pasted text.</p>
          </motion.div>

          {/* --- Main Content Area --- */}
          <AnimatePresence mode="wait">
            {!summary ? (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* --- Input Type Toggle --- */}
                <div className="flex justify-center gap-2 mb-6 p-1 bg-gray-900 border-2 border-gray-700 rounded-none w-fit mx-auto">
                  <Button onClick={() => setInputType('upload')} className={`rounded-none font-bold ${inputType === 'upload' ? 'bg-cyan-500 text-black' : 'bg-transparent text-white'}`}>
                    <Upload className="w-4 h-4 mr-2"/> Upload PDF
                  </Button>
                  <Button onClick={() => setInputType('text')} className={`rounded-none font-bold ${inputType === 'text' ? 'bg-pink-500 text-black' : 'bg-transparent text-white'}`}>
                    <Type className="w-4 h-4 mr-2"/> Paste Text
                  </Button>
                </div>

                {/* --- Input Area --- */}
                <div className={`bg-gray-900 border-2 rounded-none p-6 ${inputType === 'upload' ? neonColors.cyan : neonColors.pink}`}>
                  <AnimatePresence mode="wait">
                    {inputType === 'upload' ? (
                      <motion.div key="upload-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 p-10 cursor-pointer hover:border-cyan-400 hover:bg-gray-800 transition-colors">
                          <Upload className="w-12 h-12 text-gray-500 mb-4"/>
                          <span className="font-bold text-white">{file ? file.name : "Click to browse or drag & drop"}</span>
                          <span className="text-sm text-gray-500 mt-1">PDF only, max 50MB</span>
                        </label>
                        <input id="file-upload" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden"/>
                      </motion.div>
                    ) : (
                      <motion.div key="text-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Textarea
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                          placeholder="Paste your text here to be summarized..."
                          className="w-full h-48 bg-gray-800 border-2 border-gray-600 rounded-none text-white p-4 focus:border-pink-500 focus:ring-0 resize-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* --- Generate Button --- */}
                <div className="mt-6 text-center">
                  <Button 
                    onClick={generateSummary}
                    disabled={!isReadyToGenerate || isProcessing}
                    className="bg-green-500 text-black border-2 border-green-400 hover:bg-green-400 rounded-none font-black text-lg h-14 px-8 transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:border-gray-600 disabled:shadow-none shadow-[4px_4px_0px_#22c55e] hover:shadow-[6px_6px_0px_#22c55e]"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-6 h-6 mr-2" /> Generate Summary</>}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className={`bg-gray-900 border-2 rounded-none p-6 ${neonColors.green}`}>
                    <h2 className="text-2xl font-bold text-white mb-4">Your AI Summary</h2>
                    <div className="max-h-[50vh] overflow-y-auto p-4 bg-gray-800 border-2 border-gray-700 rounded-none">
                        <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {stripFirstMarkdownHeading(summary)}
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-center items-center gap-4">
                    <DownloadNotesButton content={summary} filename={file?.name?.replace(".pdf", "_summary") || "summary"} />
                    <Button onClick={resetAll} className="bg-gray-800 text-white border-2 border-gray-600 hover:bg-gray-700 rounded-none font-bold">
                        <Trash2 className="w-4 h-4 mr-2" /> Create New
                    </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Progress Bar --- */}
          {progress > 0 && progress < 100 && (
            <div className="mt-6">
              <p className="text-center text-cyan-400 mb-2">Processing document...</p>
              <Progress value={progress} className="h-2 bg-gray-800 border-2 border-cyan-400 rounded-none p-0" />
            </div>
          )}

        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
