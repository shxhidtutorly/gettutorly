import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  BookOpen,
  Loader2,
  Download,
  Sparkles,
  RefreshCcw,
  Upload,
  FileText,
  HelpCircle,
  Zap,
  BookMarked,
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Libraries for File Extraction ---
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import { Flashcard } from "@/lib/aiNotesService"; // Assuming this type is available

// Required for pdfjs to work in modern bundlers
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();


// --- Helper Functions & Interfaces (Now self-contained) ---

interface ExtractionResult {
  text: string;
  filename: string;
}

const extractTextFromFile = async (file: File): Promise<ExtractionResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text = "";

  switch (extension) {
    case 'pdf':
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Ensure item is typed correctly
        text += content.items.map((item: { str: string }) => item.str).join(' ') + "\n";
      }
      break;
    case 'docx':
      const docxBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: docxBuffer });
      text = result.value;
      break;
    case 'txt':
    case 'md':
      text = await file.text();
      break;
    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
  return { text, filename: file.name };
};

const safeJsonParse = (str: string) => {
  try {
    const match = str.match(/(\[.*\]|\{.*\})/s);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {
    console.error("JSON parsing failed:", e);
  }
  return null;
};

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}


// --- Reusable UI Components ---

const ActionButton = ({
  onClick,
  disabled,
  children,
  icon: Icon,
  className = '',
  isLoading = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  icon: React.ElementType;
  className?: string;
  isLoading?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`w-full flex items-center justify-center gap-3 text-lg font-bold p-4 border-2 border-neutral-200 bg-neutral-950 text-neutral-200 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group ${className}`}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98, y: 0 }}
  >
    <div className="absolute inset-0 bg-neutral-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    <div className="relative flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-black">
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Icon className="w-6 h-6" />}
      <span>{children}</span>
    </div>
  </motion.button>
);

const FileUploaderComponent = ({ onFileProcessed, isProcessing }: { onFileProcessed: (result: ExtractionResult) => void; isProcessing: boolean; }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        try {
            const result = await extractTextFromFile(file);
            onFileProcessed(result);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error Processing File",
                description: error instanceof Error ? error.message : "Could not read the file.",
            });
        }
    };

    const dragProps = {
        onDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); },
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); },
    };

    return (
        <div
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md transition-all duration-300 ${isDragging ? 'border-lime-400 bg-lime-950' : 'border-neutral-700 bg-neutral-900'}`}
            {...dragProps}
            onClick={() => fileInputRef.current?.click()}
        >
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept=".pdf,.doc,.docx,.txt,.md" />
            <Upload className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-lime-400' : 'text-neutral-500'}`} />
            <p className="font-semibold text-neutral-300">Drag & drop a file or click to browse</p>
            <p className="text-sm text-neutral-500">Supports PDF, DOCX, TXT, MD</p>
            {isProcessing && <Loader2 className="w-6 h-6 mt-4 animate-spin text-lime-400" />}
        </div>
    );
};


// --- Main Summarizer Component ---
export default function SummarizerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();

  // --- State Management ---
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [sourceText, setSourceText] = useState("");
  const [sourceFilename, setSourceFilename] = useState("Pasted Text");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState<'idle' | 'extracting' | 'summarizing'>('idle');
  const [progress, setProgress] = useState(0);

  // Loading states for actions
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // --- Handlers ---
  const handleFileProcessed = (result: ExtractionResult) => {
    setSourceText(result.text);
    setSourceFilename(result.filename);
  };

  const handleGenerateSummary = useCallback(async () => {
    const textToSummarize = sourceText;
    if (!textToSummarize.trim()) {
      toast({ title: "No content to summarize.", variant: "destructive" });
      return;
    }

    setIsLoading('summarizing');
    setSummary("");
    setProgress(10);
    startSession();

    try {
      const progressInterval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 5, 90)), 500);

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSummarize, filename: sourceFilename }),
      });

      clearInterval(progressInterval);
      if (!response.ok) throw new Error('Failed to get a response from the server.');

      const data = await response.json();
      const generatedSummary = data.summary || data.response;
      if (!generatedSummary) throw new Error("The AI didn't return a summary.");

      setSummary(generatedSummary);
      setProgress(100);
      trackSummaryGeneration();
      endSession("summary", sourceFilename, true);
      toast({ title: "Summary generated successfully! 🎉" });

    } catch (err) {
      const error = err as Error;
      endSession("summary", sourceFilename, false);
      toast({ title: "Error Generating Summary", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading('idle');
      setTimeout(() => setProgress(0), 1500);
    }
  }, [sourceText, sourceFilename, toast, startSession, endSession, trackSummaryGeneration]);

  const createFlashcards = async () => {
    if (!summary) return;
    setIsGeneratingFlashcards(true);
    try {
        const response = await fetch('/api/ai', { // Assuming a generic AI endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `Generate flashcards from this summary. Format as clean JSON: [{"front": "Term", "back": "Definition"}]. Summary: ${summary}`,
                model: 'gemini'
            })
        });
        if (!response.ok) throw new Error('Failed to generate flashcards.');
        const data = await response.json();
        const flashcards: Flashcard[] = safeJsonParse(data.response);
        if (!flashcards || flashcards.length === 0) throw new Error("AI couldn't create flashcards from this summary.");
        
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
        localStorage.setItem('flashcards-source', `${sourceFilename} (Summary)`);
        toast({ title: "Flashcards Ready! 📚", description: "Navigating you to the flashcards page." });
        navigate('/flashcards');
    } catch (error) {
        toast({ variant: "destructive", title: "Flashcard Generation Failed", description: (error as Error).message });
    } finally {
        setIsGeneratingFlashcards(false);
    }
  };

  const createQuiz = async () => {
    if (!summary) return;
    setIsGeneratingQuiz(true);
    try {
        const quizPrompt = `Create a quiz with 5 multiple choice questions based on this summary. Format as a clean JSON array: [{"question": "What is...?", "options": ["A", "B", "C", "D"], "correct": 0}]. ONLY output the JSON array. Summary: ${summary}`;
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: quizPrompt, model: 'gemini' })
        });
        if (!response.ok) throw new Error('Failed to get a response from the AI for the quiz.');
        const data = await response.json();
        const questions: QuizQuestion[] = safeJsonParse(data.response);
        if (!questions || !Array.isArray(questions) || questions.length === 0) throw new Error("AI returned an invalid format for the quiz.");
        
        localStorage.setItem('generatedQuiz', JSON.stringify({ title: `${sourceFilename} (Summary)`, questions }));
        toast({ title: "Quiz Ready! 📝", description: "Navigating you to your new quiz." });
        navigate('/quiz?source=generated');
    } catch (error) {
        toast({ variant: "destructive", title: "Error Creating Quiz", description: (error as Error).message });
    } finally {
        setIsGeneratingQuiz(false);
    }
  };

  const downloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([`# Summary of ${sourceFilename}\n\n---\n\n${summary}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sourceFilename.split('.')[0]}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({title: "Download Started", description: `${a.download} is being saved.`});
  };

  const startOver = () => {
    setSourceText("");
    setSourceFilename("Pasted Text");
    setSummary("");
    setProgress(0);
    setInputType('upload');
    setIsLoading('idle');
  };

  const panelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-200 font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black text-neutral-50 flex items-center justify-center gap-4">
              <BookMarked className="w-10 h-10 md:w-14 md:h-14 text-cyan-400"/>
              AI Summarizer
            </h1>
            <p className="text-neutral-400 mt-3 max-w-2xl mx-auto">
              Distill long documents and texts into concise, easy-to-digest summaries.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 space-y-8 lg:space-y-0">
            {/* --- LEFT PANEL: INPUT & ACTIONS --- */}
            <div className="bg-neutral-900 border-2 border-neutral-800 p-6 flex flex-col min-h-[70vh]">
              <AnimatePresence mode="wait">
                {!summary ? (
                  <motion.div key="input" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                    <h2 className="text-2xl font-bold text-neutral-100 mb-4">1. Provide Content</h2>
                    <div className="flex justify-center gap-2 mb-6 p-1 bg-neutral-950 border-2 border-neutral-700 w-fit mx-auto">
                      <button onClick={() => setInputType('upload')} className={`px-4 py-2 font-bold transition-colors ${inputType === 'upload' ? 'bg-cyan-400 text-black' : 'bg-transparent text-neutral-300'}`}><Upload className="w-4 h-4 mr-2 inline"/> Upload File</button>
                      <button onClick={() => setInputType('text')} className={`px-4 py-2 font-bold transition-colors ${inputType === 'text' ? 'bg-cyan-400 text-black' : 'bg-transparent text-neutral-300'}`}><FileText className="w-4 h-4 mr-2 inline"/> Paste Text</button>
                    </div>
                    {inputType === 'upload' ? (
                      <FileUploaderComponent onFileProcessed={handleFileProcessed} isProcessing={isLoading === 'extracting'} />
                    ) : (
                      <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your article or text here..." className="w-full h-48 md:h-64 bg-neutral-950 border-2 border-neutral-700 rounded-md text-neutral-300 p-4 focus:border-cyan-400 focus:ring-0 resize-none transition-colors scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"/>
                    )}
                    <div className="mt-6">
                        <button onClick={handleGenerateSummary} disabled={isLoading !== 'idle' || !sourceText} className="w-full flex items-center justify-center gap-3 text-lg font-bold p-4 bg-lime-400 text-black border-2 border-lime-400 hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading === 'summarizing' ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Sparkles className="w-6 h-6"/> Generate Summary </>}
                        </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="actions" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-neutral-100 mb-4">3. Create Study Tools</h2>
                    <p className="text-neutral-400 mb-6">Your summary is ready. Now, turn it into interactive study materials.</p>
                    <div className="space-y-4">
                       <ActionButton onClick={createQuiz} icon={HelpCircle} disabled={isGeneratingQuiz} isLoading={isGeneratingQuiz} className="hover:border-magenta-400">Create Quiz</ActionButton>
                       <ActionButton onClick={createFlashcards} icon={Zap} disabled={isGeneratingFlashcards} isLoading={isGeneratingFlashcards} className="hover:border-magenta-400">Generate Flashcards</ActionButton>
                       <ActionButton onClick={downloadSummary} icon={Download} className="hover:border-lime-400">Download Summary</ActionButton>
                    </div>
                    <div className="mt-auto pt-6">
                        <button onClick={startOver} className="w-full flex items-center justify-center gap-3 p-3 bg-neutral-800 text-neutral-300 border-2 border-neutral-700 hover:bg-neutral-700 hover:text-white transition-colors font-bold">
                            <RefreshCcw className="w-5 h-5"/> Summarize Another
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- RIGHT PANEL: OUTPUT --- */}
            <div className={`bg-neutral-900 border-2 p-6 flex flex-col min-h-[70vh] transition-colors duration-500 ${summary ? 'border-lime-500' : 'border-neutral-800'}`}>
              <AnimatePresence mode="wait">
                {isLoading === 'summarizing' ? (
                  <motion.div key="loading" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-lime-400 mb-6"/>
                    <h3 className="text-2xl font-bold text-neutral-100">Generating Summary...</h3>
                    <p className="text-neutral-400 mt-2">The AI is reading and condensing your text.</p>
                    <div className="w-full max-w-sm mt-6 bg-neutral-800 border-2 border-neutral-700 h-3 overflow-hidden">
                        <motion.div className="h-full bg-lime-400" initial={{width: 0}} animate={{width: `${progress}%`}} transition={{duration: 0.5, ease: "linear"}}/>
                    </div>
                  </motion.div>
                ) : summary ? (
                  <motion.div key="summary" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full overflow-hidden">
                    <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-3"><BookOpen/> Summary of {sourceFilename}</h2>
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2 mt-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-300 prose-headings:text-lime-400 prose-strong:text-neutral-50 prose-a:text-cyan-400">
                        {summary}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center text-neutral-600">
                    <BookMarked className="w-20 h-20 mb-6"/>
                    <h3 className="text-2xl font-black text-neutral-500">2. Summary Will Appear Here</h3>
                    <p>Provide your content on the left to get started.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
