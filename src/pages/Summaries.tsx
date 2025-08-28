import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
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
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

// --- Helper Functions & Interfaces ---
interface ExtractionResult {
  text: string;
  filename: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

const extractTextFromFile = async (file: File): Promise<ExtractionResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text = "";
  try {
    switch (extension) {
      case 'pdf':
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + "\n";
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
  } catch (err) {
    throw new Error(`Failed to extract text: ${(err as Error).message}`);
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
    className={`w-full flex items-center justify-center gap-3 text-lg font-bold p-4 border-2 border-neutral-700 bg-neutral-900 text-neutral-200 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group rounded-lg ${className}`}
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
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md transition-all duration-300 ${isDragging ? 'border-lime-400 bg-lime-950/20' : 'border-neutral-700 bg-neutral-900'}`}
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

// --- Note View ---
const SummaryView = ({ summary, sourceFilename }: { summary: string; sourceFilename: string; }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
    <header className="mb-6">
      <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">Summary of {sourceFilename}</h1>
      <p className="text-xs text-neutral-500 mt-2">Source file: {sourceFilename}</p>
    </header>
    <div className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-300 prose-headings:text-lime-400 prose-strong:text-neutral-50 prose-a:text-cyan-400">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {summary}
      </ReactMarkdown>
    </div>
  </motion.div>
);

// --- Quiz View ---
const QuizView = ({ questions }: { questions: QuizQuestion[] }) => {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const select = (qi: number, oi: number) => {
    if (revealed[qi]) return;
    setAnswers(prev => ({ ...prev, [qi]: oi }));
    setRevealed(prev => ({ ...prev, [qi]: true }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full overflow-y-auto px-4 -mx-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Quiz</h1>
      {questions.length === 0 && <div className="text-center text-neutral-500">No quiz questions generated.</div>}
      {questions.map((q, qi) => (
        <div key={qi} className="p-6 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="font-bold text-neutral-100 text-lg mb-4">{qi + 1}. {q.question}</div>
          <div className="space-y-3">
            {q.options.map((opt, oi) => {
              const sel = answers[qi] === oi;
              const isCorrect = q.correct === oi;
              const show = revealed[qi];
              let className = 'w-full text-left p-3 border rounded-lg transition-colors flex items-center gap-3';
              if (show) {
                className += isCorrect ? ' bg-green-600/30 border-green-500 text-white' : (sel ? ' bg-red-600/30 border-red-500 text-white' : ' bg-neutral-800 border-neutral-700 text-neutral-300');
              } else if (sel) {
                className += ' bg-cyan-600/20 border-cyan-500 text-white';
              } else {
                className += ' bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700';
              }
              return (
                <button key={oi} onClick={() => select(qi, oi)} className={className}>
                  <span className="font-mono text-sm">{String.fromCharCode(65 + oi)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {revealed[qi] && (
            <div className="mt-4 text-sm text-neutral-300">
              <div className="font-semibold text-lime-400">Correct: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</div>
              <div className="text-neutral-400 mt-1">{q.explanation}</div>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

// --- Flashcard View ---
const FlashcardView = ({ flashcards }: { flashcards: Flashcard[] }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (flashcards.length === 0) { setIdx(0); setFlipped(false); }
    else setIdx(i => Math.min(i, flashcards.length - 1));
  }, [flashcards]);

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-center text-neutral-500">No flashcards available.</div>;
  }

  const next = () => { setFlipped(false); setIdx(i => (i + 1) % flashcards.length); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + flashcards.length) % flashcards.length); };

  const cardContainerStyle: React.CSSProperties = {
    perspective: 1200,
  };
  const flipperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    transition: 'transform 0.6s ease',
  };
  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    boxSizing: 'border-box',
    borderRadius: 12,
  };
  const frontStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(0deg)',
    background: 'rgba(31,41,55,0.9)',
    border: '1px solid rgba(71,85,105,0.6)',
  };
  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
    background: 'rgba(31,41,55,0.9)',
    border: '1px solid rgba(71,85,105,0.6)',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col items-center justify-center gap-6">
      <div className="w-full max-w-lg h-64" style={cardContainerStyle}>
        <div style={flipperStyle} onClick={() => setFlipped(f => !f)} role="button" aria-pressed={flipped} className="cursor-pointer">
          <div style={frontStyle} className="rounded-md">
            <div className="text-center px-4">
              <div className="text-neutral-200 text-xl font-bold">{flashcards[idx].question}</div>
            </div>
          </div>
          <div style={backStyle} className="rounded-md">
            <div className="text-center px-4">
              <div className="text-neutral-100 text-lg">{flashcards[idx].answer}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full max-w-lg">
        <button onClick={prev} className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><ChevronLeft /></button>
        <div className="text-center">
          <div className="font-mono text-neutral-300">{idx + 1} / {flashcards.length}</div>
          <button onClick={() => setFlipped(f => !f)} className="text-xs text-neutral-400 mt-1 hover:text-lime-400 flex items-center gap-2">
            <RotateCw className="w-3 h-3"/> Tap card to flip
          </button>
        </div>
        <button onClick={next} className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><ChevronRight /></button>
      </div>
    </motion.div>
  );
};

// --- Main Summarizer Component ---
export default function SummarizerPage() {
  const { toast } = useToast();
  const { trackSummaryGeneration, endSession, startSession } = useStudyTracking();

  // --- State Management ---
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [sourceText, setSourceText] = useState("");
  const [sourceFilename, setSourceFilename] = useState("Pasted Text");
  const [summary, setSummary] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'input'|'summary'|'quiz'|'flashcards'>('input');

  const generateSummary = useCallback(async (text: string, filename: string) => {
    if (!text.trim()) {
      toast({ title: "No content to summarize.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setSummary("");
    setQuiz([]);
    setFlashcards([]);
    setProgress(10);
    setActiveTab('summary');
    startSession();

    try {
      const progressInterval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 5, 90)), 500);
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename }),
      });

      clearInterval(progressInterval);
      if (!response.ok) throw new Error('Failed to get a response from the server.');
      
      const data = await response.json();
      const generatedSummary = data.summary || data.response;

      if (!generatedSummary || typeof generatedSummary !== 'string') {
        throw new Error("The AI didn't return a valid summary.");
      }
      
      setSummary(generatedSummary);
      
      // Generate quiz and flashcards in the background
      const quizResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a quiz with 5 multiple choice questions based on this summary. Format as a clean JSON array: [{"question": "What is...?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "This is why the answer is correct."}]. ONLY output the JSON array. Summary: ${generatedSummary}`,
          model: 'gemini'
        })
      });
      const quizData = await quizResponse.json();
      const generatedQuiz = safeJsonParse(quizData.response);
      if (generatedQuiz && Array.isArray(generatedQuiz)) {
        setQuiz(generatedQuiz);
      }

      const flashcardResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate flashcards from this summary. Format as clean JSON: [{"question": "Term", "answer": "Definition"}]. Summary: ${generatedSummary}`,
          model: 'gemini'
        })
      });
      const flashcardData = await flashcardResponse.json();
      const generatedFlashcards = safeJsonParse(flashcardData.response);
      if (generatedFlashcards && Array.isArray(generatedFlashcards)) {
        setFlashcards(generatedFlashcards);
      }

      setProgress(100);
      trackSummaryGeneration();
      endSession("summary", filename, true);
      toast({ title: "Content generated successfully! 🎉" });

    } catch (err) {
      const error = err as Error;
      endSession("summary", filename, false);
      toast({ title: "Error Generating Content", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  }, [toast, startSession, endSession, trackSummaryGeneration]);

  const handleFileProcessed = (res: ExtractionResult) => {
    setSourceText(res.text);
    setSourceFilename(res.filename);
    generateSummary(res.text, res.filename);
  };

  const handleTextSubmit = () => {
    generateSummary(sourceText, 'Pasted Text');
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
    toast({ title: "Download Started", description: `${a.download} is being saved.` });
  };

  const startOver = () => {
    setSourceText("");
    setSourceFilename("Pasted Text");
    setSummary("");
    setQuiz([]);
    setFlashcards([]);
    setProgress(0);
    setInputType('upload');
    setIsLoading(false);
    setActiveTab('input');
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div key="loading" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="w-16 h-16 animate-spin text-lime-400 mb-6" />
          <h3 className="text-2xl font-bold text-neutral-100">Generating Content...</h3>
          <p className="text-neutral-400 mt-2">The AI is reading and condensing your text.</p>
          <div className="w-full max-w-sm mt-6 bg-neutral-800 border-2 border-neutral-700 h-3 overflow-hidden rounded-full">
            <motion.div className="h-full bg-lime-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "linear" }} />
          </div>
        </motion.div>
      );
    }
    
    if (summary) {
      if (activeTab === 'summary') return <SummaryView summary={summary} sourceFilename={sourceFilename} />;
      if (activeTab === 'quiz') return <QuizView questions={quiz} />;
      if (activeTab === 'flashcards') return <FlashcardView flashcards={flashcards} />;
    }

    return (
      <motion.div key="input" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-neutral-100 mb-4">1. Provide Content</h2>
        <div className="flex justify-center gap-2 mb-6 p-1 bg-neutral-950 border-2 border-neutral-700 w-fit mx-auto rounded-lg">
          <button onClick={() => setInputType('upload')} className={`px-4 py-2 font-bold transition-colors rounded-md ${inputType === 'upload' ? 'bg-cyan-400 text-black' : 'bg-transparent text-neutral-300'}`}><Upload className="w-4 h-4 mr-2 inline" /> Upload File</button>
          <button onClick={() => setInputType('text')} className={`px-4 py-2 font-bold transition-colors rounded-md ${inputType === 'text' ? 'bg-cyan-400 text-black' : 'bg-transparent text-neutral-300'}`}><FileText className="w-4 h-4 mr-2 inline" /> Paste Text</button>
        </div>
        {inputType === 'upload' ? (
          <FileUploaderComponent onFileProcessed={handleFileProcessed} isProcessing={isLoading} />
        ) : (
          <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your article or text here..." className="w-full h-48 md:h-64 bg-neutral-950 border-2 border-neutral-700 rounded-md text-neutral-300 p-4 focus:border-cyan-400 focus:ring-0 resize-none transition-colors scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800" />
        )}
        <div className="mt-6">
          <button onClick={handleTextSubmit} disabled={isLoading || !sourceText} className="w-full flex items-center justify-center gap-3 text-lg font-bold p-4 bg-lime-400 text-black border-2 border-lime-400 hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Sparkles className="w-6 h-6" /> Generate Summary </>}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-200 font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black text-neutral-50 flex items-center justify-center gap-4">
              <BookMarked className="w-10 h-10 md:w-14 md:h-14 text-cyan-400" />
              AI Summarizer
            </h1>
            <p className="text-neutral-400 mt-3 max-w-2xl mx-auto">
              Distill long documents and texts into concise, easy-to-digest summaries.
            </p>
          </motion.div>

          {summary && (
            <div className="flex justify-center gap-4 mb-6">
              <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'summary' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-950'}`}>
                <BookOpen className="inline w-4 h-4 mr-2"/> Summary
              </button>
              <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'quiz' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-950'}`}>
                <HelpCircle className="inline w-4 h-4 mr-2"/> Quiz
              </button>
              <button onClick={() => setActiveTab('flashcards')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'flashcards' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-950'}`}>
                <Zap className="inline w-4 h-4 mr-2"/> Flashcards
              </button>
            </div>
          )}

          <div className="bg-neutral-900 border-2 border-neutral-800 p-6 flex flex-col min-h-[70vh] rounded-lg">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>

          {summary && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <ActionButton onClick={downloadSummary} icon={Download} className="w-full">Download Summary</ActionButton>
              <button onClick={startOver} className="w-full p-3 rounded-lg border border-neutral-800 bg-neutral-800 text-neutral-200 font-semibold hover:bg-neutral-700">Start Over</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
