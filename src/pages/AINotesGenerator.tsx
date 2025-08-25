import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  BookOpen,
  Loader2,
  Download,
  Sparkles,
  RefreshCcw,
  MessageCircle,
  Upload,
  FileText,
  Send,
  HelpCircle,
  Zap,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCw,
} from "lucide-react";
import {
  AINote,
  AINoteContent,
  Flashcard,
  QuizQuestion,
  generateNotesAI,
} from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";

// Required for pdfjs to work
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

// --- Helper Interfaces & Functions ---
export interface ExtractionResult {
  text: string;
  filename: string;
}

export const extractTextFromFile = async (file: File): Promise<ExtractionResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text = "";
  switch (extension) {
    case 'pdf':
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ');
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StoredNote {
  note: AINote;
  sourceFilename: string;
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
    className={`w-full flex items-center justify-center gap-3 text-lg font-bold p-4 border-2 rounded-lg border-neutral-700 bg-neutral-900 text-neutral-200 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group ${className}`}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98, y: 0 }}
  >
    <div className="absolute inset-0 bg-neutral-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    <div className="relative flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-black">
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Icon className="w-6 h-6" />
      )}
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
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); },
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
    };

    return (
        <div
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer ${isDragging ? 'border-lime-400 bg-lime-950/50' : 'border-neutral-700 bg-neutral-950'}`}
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

// --- NEW VIEW COMPONENTS FOR TABS ---

const NoteView = ({ content, sourceFilename }: { content: AINoteContent, sourceFilename: string }) => (
    <div className="h-full overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{content.title}</h1>
            <p className="text-neutral-400 mt-2 text-lg">{content.summary}</p>
            <p className="text-xs text-neutral-500 mt-4">SOURCE: {sourceFilename}</p>
        </div>

        {/* Key Takeaways */}
        <div className="mb-8 p-6 bg-neutral-950 border border-neutral-800 rounded-lg">
             <h2 className="text-2xl font-bold text-cyan-400 mb-4">Key Takeaways</h2>
             <ul className="space-y-3">
                {content.keyTakeaways.map((takeaway, index) => (
                    <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 text-lime-400 mt-1 flex-shrink-0" />
                        <span className="text-neutral-300">{takeaway}</span>
                    </motion.li>
                ))}
             </ul>
        </div>
        
        {/* Full Notes */}
        <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b-2 border-cyan-500/20 pb-2">Full Notes</h2>
            <div className="space-y-6">
                {content.fullNotes.map((section, index) => (
                    <div key={index}>
                        <h3 className="text-xl font-semibold text-neutral-100 mb-2">{section.heading}</h3>
                        <div className="prose prose-invert max-w-none prose-p:text-neutral-300 prose-ul:text-neutral-400 prose-li:marker:text-cyan-400 prose-strong:text-white prose-table:border-neutral-700 prose-th:text-neutral-200 prose-tr:border-neutral-800 prose-td:text-neutral-400">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const QuizView = ({ questions }: { questions: QuizQuestion[] }) => {
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [showResults, setShowResults] = useState<Record<number, boolean>>({});

    const handleSelect = (qIndex: number, oIndex: number) => {
        if (showResults[qIndex]) return;
        setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    return (
        <div className="h-full overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800 space-y-6">
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-6 bg-neutral-950 border border-neutral-800 rounded-lg">
                    <p className="font-bold text-lg text-neutral-100 mb-4">{qIndex + 1}. {q.question}</p>
                    <div className="space-y-3 mb-4">
                        {q.options.map((opt, oIndex) => {
                            const isSelected = answers[qIndex] === oIndex;
                            const isCorrect = q.correct === oIndex;
                            const revealed = showResults[qIndex];

                            let buttonClass = "bg-neutral-800 hover:bg-neutral-700 border-neutral-700";
                            if (revealed) {
                                if (isCorrect) buttonClass = "bg-green-500/20 border-green-500 text-white";
                                else if (isSelected && !isCorrect) buttonClass = "bg-red-500/20 border-red-500 text-white";
                            } else if (isSelected) {
                                buttonClass = "bg-cyan-500/20 border-cyan-500 text-white";
                            }
                            
                            return (
                                <button key={oIndex} onClick={() => handleSelect(qIndex, oIndex)} className={`w-full text-left p-3 border rounded-md transition-all text-neutral-300 ${buttonClass}`}>
                                    {String.fromCharCode(65 + oIndex)}. {opt}
                                </button>
                            );
                        })}
                    </div>
                    {!showResults[qIndex] ? (
                        <button 
                            disabled={answers[qIndex] == null} 
                            onClick={() => setShowResults(prev => ({...prev, [qIndex]: true}))} 
                            className="text-sm font-semibold text-lime-400 disabled:text-neutral-500 disabled:cursor-not-allowed"
                        >
                            Check Answer
                        </button>
                    ) : (
                         <AnimatePresence>
                             <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 bg-neutral-900 rounded-md border border-neutral-700 text-sm"
                             >
                                <p className="font-bold flex items-center gap-2">
                                    {answers[qIndex] === q.correct ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                                    Correct Answer: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
                                </p>
                                <p className="text-neutral-400 mt-2">{q.explanation}</p>
                            </motion.div>
                         </AnimatePresence>
                    )}
                </div>
            ))}
        </div>
    );
};

const FlashcardView = ({ flashcards }: { flashcards: Flashcard[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!flashcards || flashcards.length === 0) {
        return <div className="text-center text-neutral-500">No flashcards available.</div>;
    }
    
    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(i => (i + 1) % flashcards.length), 150);
    };
    
    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(i => (i - 1 + flashcards.length) % flashcards.length), 150);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            {/* Card */}
            <div className="w-full max-w-lg h-72 perspective-1000">
                <motion.div 
                    className="relative w-full h-full preserve-3d"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 text-center bg-neutral-800 border-2 border-neutral-700 rounded-lg cursor-pointer">
                        <p className="text-2xl font-bold text-neutral-100">{flashcards[currentIndex].question}</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 text-center bg-cyan-900/50 border-2 border-cyan-700 rounded-lg cursor-pointer rotate-y-180">
                        <p className="text-xl text-neutral-200">{flashcards[currentIndex].answer}</p>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full max-w-lg mt-6">
                <button onClick={prevCard} className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><ChevronLeft /></button>
                <div className="text-center">
                    <p className="font-mono text-neutral-300">{currentIndex + 1} / {flashcards.length}</p>
                    <button onClick={() => setIsFlipped(!isFlipped)} className="text-xs text-neutral-500 flex items-center gap-1 hover:text-lime-400"><RotateCw className="w-3 h-3"/> Click card to flip</button>
                </div>
                <button onClick={nextCard} className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"><ChevronRight /></button>
            </div>
        </div>
    );
};


// --- Main AI Notes Generator Component ---
const AINotesGenerator = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const { trackNoteCreated } = useStudyTracking();
  const { addHistoryEntry } = useHistory('notes');

  // State
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [sourceText, setSourceText] = useState("");
  const [sourceFilename, setSourceFilename] = useState("Pasted Text");
  const [note, setNote] = useState<AINote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // New UI State
  const [activeTab, setActiveTab] = useState<'note' | 'quiz' | 'flashcards'>('note');

  // Local Storage
  useEffect(() => {
    try {
        const savedNoteData = localStorage.getItem('ai-generated-note');
        if (savedNoteData) {
            const { note: savedNote, sourceFilename: savedFilename }: StoredNote = JSON.parse(savedNoteData);
            setNote(savedNote);
            setSourceFilename(savedFilename);
            toast({ title: "Welcome back!", description: "Your previous note has been loaded." });
        }
    } catch (error) {
        console.error("Failed to load note from local storage:", error);
        localStorage.removeItem('ai-generated-note');
    }
  }, [toast]);

  useEffect(() => {
    try {
        if (note) {
            const dataToStore: StoredNote = { note, sourceFilename };
            localStorage.setItem('ai-generated-note', JSON.stringify(dataToStore));
        } else {
            localStorage.removeItem('ai-generated-note');
        }
    } catch (error) {
        console.error("Failed to save note to local storage:", error);
    }
  }, [note, sourceFilename]);
  
  // Handlers
  const handleFileProcessed = (result: ExtractionResult) => {
    setSourceText(result.text);
    setSourceFilename(result.filename);
    generateNotes(result.text, result.filename);
  };

  const handleTextSubmit = () => {
    if (!sourceText.trim()) {
      toast({ variant: "destructive", title: "Text is empty!" });
      return;
    }
    generateNotes(sourceText, "Pasted Text");
  };

  const generateNotes = useCallback(async (text: string, filename: string) => {
    setIsLoading(true);
    setNote(null);
    setProgress(10);
    try {
      let progressInterval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 5, 90)), 500);
      const generatedNote = await generateNotesAI(text, filename, user?.uid || "anonymous");
      clearInterval(progressInterval);
      setProgress(100);

      setNote(generatedNote);
      setActiveTab('note');
      
      await addHistoryEntry(`Source: ${filename}`, JSON.stringify(generatedNote.content, null, 2), { title: generatedNote.content.title, type: 'notes_generation' });
      trackNoteCreated();
      toast({ title: "Notes Generated Successfully! 🎉" });

    } catch (error) {
      toast({ variant: "destructive", title: "Error Generating Notes", description: error instanceof Error ? error.message : "An unknown error occurred." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  }, [user, addHistoryEntry, trackNoteCreated, toast]);

  const serializeNoteToMarkdown = (noteToSerialize: AINote): string => {
      const { content, flashcards, quiz } = noteToSerialize;
      let md = `# ${content.title}\n\n`;
      md += `**Source:** ${noteToSerialize.filename}\n\n`;
      md += `## Summary\n${content.summary}\n\n`;
      md += `## Key Takeaways\n`;
      content.keyTakeaways.forEach(t => md += `- ${t}\n`);
      md += `\n## Full Notes\n`;
      content.fullNotes.forEach(s => {
          md += `### ${s.heading}\n${s.content}\n\n`;
      });
      md += `---\n\n## Quiz\n`;
      quiz.forEach((q, i) => {
        md += `${i + 1}. ${q.question}\n`;
        q.options.forEach((o, j) => md += `    - ${String.fromCharCode(65 + j)}. ${o}\n`);
        md += `\n**Answer:** ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}\n\n`;
      });
      md += `\n## Flashcards\n`;
      flashcards.forEach(f => md += `- **Q:** ${f.question}\n  - **A:** ${f.answer}\n`);
      return md;
  };
  
  const downloadNotes = () => {
    if (!note) return;
    const markdownContent = serializeNoteToMarkdown(note);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.content.title.replace(/ /g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({title: "Download Started"});
  };

  const startOver = () => {
    setSourceText("");
    setSourceFilename("Pasted Text");
    setNote(null);
    setInputType('upload');
  };
  
  const panelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const TabButton = ({ tabName, icon: Icon }: { tabName: 'note' | 'quiz' | 'flashcards'; icon: React.ElementType }) => (
      <button 
          onClick={() => setActiveTab(tabName)}
          className="relative px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors text-neutral-400 hover:text-white"
      >
          <Icon className="w-5 h-5"/>
          <span className="capitalize">{tabName}</span>
          {activeTab === tabName && (
              <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" layoutId="underline" />
          )}
      </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-200 font-sans">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black text-neutral-50 flex items-center justify-center gap-4">
              <BrainCircuit className="w-10 h-10 md:w-14 md:h-14 text-lime-400"/>
              AI Notes Generator
            </h1>
            <p className="text-neutral-400 mt-3 max-w-2xl mx-auto">
              Transform any document or text into structured notes, quizzes, and flashcards instantly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 space-y-8 lg:space-y-0">
            {/* --- LEFT PANEL: INPUT & ACTIONS --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg flex flex-col min-h-[70vh]">
                <AnimatePresence mode="wait">
                    {!note ? (
                        <motion.div key="input" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                           {/* Input components */}
                           <h2 className="text-2xl font-bold text-neutral-100 mb-4">1. Provide Your Source</h2>
                            <div className="flex justify-center gap-2 mb-6 p-1 bg-neutral-950 border border-neutral-800 rounded-md w-fit mx-auto">
                                <button onClick={() => setInputType('upload')} className={`px-4 py-1.5 text-sm font-bold transition-colors rounded ${inputType === 'upload' ? 'bg-lime-400 text-black' : 'bg-transparent text-neutral-300'}`}><Upload className="w-4 h-4 mr-2 inline"/> Upload</button>
                                <button onClick={() => setInputType('text')} className={`px-4 py-1.5 text-sm font-bold transition-colors rounded ${inputType === 'text' ? 'bg-lime-400 text-black' : 'bg-transparent text-neutral-300'}`}><FileText className="w-4 h-4 mr-2 inline"/> Paste Text</button>
                            </div>
                            
                            {inputType === 'upload' ? (
                                <FileUploaderComponent onFileProcessed={handleFileProcessed} isProcessing={isLoading} />
                            ) : (
                                <>
                                    <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your text, transcript, or article here..." className="w-full h-48 md:h-64 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-300 p-4 focus:border-lime-400 focus:ring-0 resize-none transition-colors scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"/>
                                    <button onClick={handleTextSubmit} disabled={isLoading || !sourceText.trim()} className="w-full mt-6 flex items-center justify-center gap-3 text-lg font-bold p-4 bg-lime-400 text-black rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Sparkles className="w-6 h-6"/> Generate Notes </>}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="actions" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full">
                           <h2 className="text-2xl font-bold text-neutral-100 mb-4">Actions</h2>
                            <p className="text-neutral-400 mb-6">Your materials are ready. You can now download them or start over.</p>
                            <div className="space-y-4">
                                <ActionButton onClick={downloadNotes} icon={Download} className="hover:border-lime-400">Download All (.md)</ActionButton>
                                {/* Chat button can be added back here if desired */}
                            </div>
                            <div className="mt-auto pt-6">
                                <button onClick={startOver} className="w-full flex items-center justify-center gap-3 p-3 bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors font-bold">
                                    <RefreshCcw className="w-5 h-5"/> Generate New Notes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- RIGHT PANEL: OUTPUT --- */}
            <div className={`bg-neutral-900 border p-6 rounded-lg flex flex-col min-h-[70vh] transition-colors duration-500 ${note ? 'border-cyan-500/50' : 'border-neutral-800'}`}>
                <AnimatePresence mode="wait">
                    {isLoading && !note ? (
                        <motion.div key="loading" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center">
                            <Loader2 className="w-16 h-16 animate-spin text-lime-400 mb-6"/>
                            <h3 className="text-2xl font-bold text-neutral-100">AI Is Working Its Magic...</h3>
                            <p className="text-neutral-400 mt-2">Analyzing, summarizing, and building materials.</p>
                            <div className="w-full max-w-sm mt-6 bg-neutral-800 border border-neutral-700 h-2 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-lime-400" initial={{width: 0}} animate={{width: `${progress}%`}} transition={{duration: 0.5, ease: "linear"}}/>
                            </div>
                        </motion.div>
                    ) : note ? (
                        <motion.div key="notes" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full overflow-hidden">
                            {/* Tab Navigation */}
                            <div className="flex-shrink-0 border-b border-neutral-800 mb-4 flex items-center space-x-4">
                               <TabButton tabName="note" icon={BookOpen} />
                               <TabButton tabName="quiz" icon={HelpCircle} />
                               <TabButton tabName="flashcards" icon={Zap} />
                            </div>
                            
                            {/* Tab Content */}
                            <div className="flex-grow overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full"
                                    >
                                        {activeTab === 'note' && <NoteView content={note.content} sourceFilename={sourceFilename} />}
                                        {activeTab === 'quiz' && <QuizView questions={note.quiz} />}
                                        {activeTab === 'flashcards' && <FlashcardView flashcards={note.flashcards} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="placeholder" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center text-neutral-600">
                            <Sparkles className="w-20 h-20 mb-6"/>
                            <h3 className="text-2xl font-black text-neutral-500">Your Notes Will Appear Here</h3>
                            <p>Upload a file or paste text to begin.</p>
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
};

export default AINotesGenerator;
