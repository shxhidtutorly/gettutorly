// src/pages/AINotesGenerator.tsx
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
  Upload,
  FileText,
  HelpCircle,
  Zap,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCw,
} from "lucide-react";
import { generateNotesAI, AINote, AINoteContent, Flashcard, QuizQuestion } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";

// pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

/* ----------------------------- Helpers ------------------------------ */
export interface ExtractionResult { text: string; filename: string; }

export const extractTextFromFile = async (file: File): Promise<ExtractionResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text = "";
  try {
    switch (extension) {
      case 'pdf': {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        break;
      }
      case 'docx': {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        break;
      }
      case 'txt':
      case 'md': {
        text = await file.text();
        break;
      }
      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }
  } catch (err) {
    throw new Error(`Failed to extract text: ${(err as Error).message}`);
  }
  return { text, filename: file.name };
};

/* -------------------------- Reusable UI pieces ---------------------- */
const ActionButton = ({
  onClick, disabled, children, icon: Icon, className = '', isLoading = false,
}: { onClick?: () => void; disabled?: boolean; children: React.ReactNode; icon: React.ElementType; className?: string; isLoading?: boolean; }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled || isLoading}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.99 }}
    className={`w-full flex items-center justify-center gap-3 text-lg font-semibold p-3 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-100 ${className} disabled:opacity-60`}
  >
    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-lime-400" /> : <Icon className="w-5 h-5" />}
    <span>{children}</span>
  </motion.button>
);

/* -------------------------- File Uploader --------------------------- */
const FileUploaderComponent = ({ onFileProcessed, isProcessing }: { onFileProcessed: (result: ExtractionResult) => void; isProcessing: boolean; }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const res = await extractTextFromFile(file);
      onFileProcessed(res);
    } catch (err: any) {
      toast({ variant: "destructive", title: "File error", description: err?.message || "Failed to read file." });
    }
  };

  const dragProps = {
    onDragEnter: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); },
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
  };

  return (
    <div {...dragProps}
      onClick={() => fileInputRef.current?.click()}
      className={`w-full cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center gap-3 justify-center transition-colors ${isDragging ? 'border-lime-400 bg-lime-950/40' : 'border-neutral-800 bg-neutral-950'}`}>
      <input ref={fileInputRef} type="file" onChange={(e) => handleFiles(e.target.files)} accept=".pdf,.doc,.docx,.txt,.md" className="hidden" />
      <Upload className={`w-12 h-12 ${isDragging ? 'text-lime-400' : 'text-neutral-500'}`} />
      <div className="text-center">
        <div className="font-semibold text-neutral-100">Drag & drop a file</div>
        <div className="text-sm text-neutral-400">or click to browse — PDF, DOCX, TXT, MD</div>
      </div>
      {isProcessing && <Loader2 className="w-6 h-6 mt-2 animate-spin text-lime-400" />}
    </div>
  );
};

/* --------------------------- Views -------------------------------- */
const NoteView = ({ content, sourceFilename }: { content: AINoteContent; sourceFilename: string; }) => (
  <div className="h-full overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800 p-2">
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">{content.title}</h1>
      <p className="text-neutral-400 mt-3 max-w-3xl">{content.summary}</p>
      <p className="text-xs text-neutral-500 mt-3">SOURCE: {sourceFilename}</p>
    </header>

    <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
        <h2 className="text-lg font-bold text-cyan-400 mb-3">Key Takeaways</h2>
        <ul className="space-y-2">
          {content.keyTakeaways.map((k, i) => (
            <li key={i} className="flex items-start gap-3 text-neutral-300">
              <CheckCircle2 className="w-5 h-5 text-lime-400 mt-1 flex-shrink-0" />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-2 p-6 bg-neutral-950 border border-neutral-800 rounded-lg prose prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-3 text-cyan-300">Full Notes</h3>
        {content.fullNotes.map((s, idx) => (
          <article key={idx} className="mb-6">
            <h4 className="text-lg font-bold text-neutral-100 mb-2">{s.heading}</h4>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
          </article>
        ))}
      </div>
    </section>
  </div>
);

const QuizView = ({ questions }: { questions: QuizQuestion[] }) => {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const select = (qi: number, oi: number) => {
    if (revealed[qi]) return;
    setAnswers(prev => ({ ...prev, [qi]: oi }));
  };

  return (
    <div className="h-full overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800 p-2 space-y-4">
      {questions.length === 0 && <div className="text-neutral-500">No quiz questions generated.</div>}
      {questions.map((q, qi) => (
        <div key={qi} className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="font-bold text-neutral-100 mb-3">{qi + 1}. {q.question}</div>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const sel = answers[qi] === oi;
              const isCorrect = q.correct === oi;
              const show = revealed[qi];
              let className = 'w-full text-left p-3 border rounded-md transition-colors flex items-center gap-3';
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

          <div className="mt-3">
            {!revealed[qi] ? (
              <button
                disabled={answers[qi] == null}
                onClick={() => setRevealed(prev => ({ ...prev, [qi]: true }))}
                className="text-sm font-semibold text-lime-400 disabled:text-neutral-600"
              >
                Check Answer
              </button>
            ) : (
              <div className="mt-2 text-sm text-neutral-300">
                <div className="font-semibold">Correct: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</div>
                <div className="text-neutral-400 mt-1">{q.explanation}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------- Flashcard View (fixed) ------------------ */
const FlashcardView = ({ flashcards }: { flashcards: Flashcard[] }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    // ensure index within bounds when flashcards change
    if (flashcards.length === 0) { setIdx(0); setFlipped(false); }
    else setIdx(i => Math.min(i, flashcards.length - 1));
  }, [flashcards]);

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-center text-neutral-500">No flashcards available.</div>;
  }

  const next = () => { setFlipped(false); setIdx(i => (i + 1) % flashcards.length); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + flashcards.length) % flashcards.length); };

  // Styles for 3D flip
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
    background: 'rgba(31,41,55,0.9)', // neutral-800
    border: '1px solid rgba(71,85,105,0.6)', // neutral-700
  };
  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
    background: 'linear-gradient(180deg, rgba(6,95,70,0.12), rgba(6,78,59,0.08))',
    border: '1px solid rgba(6,95,70,0.2)',
    color: '#E6FFFA',
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <div className="w-full max-w-lg h-64" style={cardContainerStyle}>
        <div style={flipperStyle} onClick={() => setFlipped(f => !f)} role="button" aria-pressed={flipped} className="cursor-pointer">
          {/* Front */}
          <div style={frontStyle} className="rounded-md">
            <div className="text-center px-4">
              <div className="text-neutral-200 text-xl font-bold">{flashcards[idx].question}</div>
            </div>
          </div>

          {/* Back */}
          <div style={backStyle} className="rounded-md">
            <div className="text-center px-4">
              <div className="text-neutral-100 text-lg">{flashcards[idx].answer}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
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
    </div>
  );
};

/* -------------------------- Main Component ------------------------- */
const AINotesGenerator = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const { trackNoteCreated } = useStudyTracking();
  const { addHistoryEntry } = useHistory('notes');

  const [inputType, setInputType] = useState<'upload'|'text'>('upload');
  const [sourceText, setSourceText] = useState("");
  const [sourceFilename, setSourceFilename] = useState("Pasted Text");
  const [note, setNote] = useState<AINote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'note'|'quiz'|'flashcards'>('note');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-generated-note');
      if (saved) {
        const parsed = JSON.parse(saved) as { note: AINote; sourceFilename: string; };
        setNote(parsed.note);
        setSourceFilename(parsed.sourceFilename);
        toast({ title: "Loaded previous note", description: "Resuming from last session." });
      }
    } catch {
      localStorage.removeItem('ai-generated-note');
    }
  }, []);

  useEffect(() => {
    try {
      if (note) localStorage.setItem('ai-generated-note', JSON.stringify({ note, sourceFilename }));
      else localStorage.removeItem('ai-generated-note');
    } catch (err) { /* ignore */ }
  }, [note, sourceFilename]);

  const handleFileProcessed = (res: ExtractionResult) => {
    setSourceText(res.text);
    setSourceFilename(res.filename);
    generateNotes(res.text, res.filename);
  };

  const handleTextSubmit = () => {
    if (!sourceText.trim()) { toast({ variant: "destructive", title: "Text empty" }); return; }
    generateNotes(sourceText, 'Pasted Text');
  };

  const generateNotes = useCallback(async (text: string, filename: string) => {
    setIsLoading(true); setNote(null); setProgress(8);

    const progressInterval = setInterval(() => setProgress(p => Math.min(95, p + Math.random() * 7)), 450);

    try {
      const generated = await generateNotesAI(text, filename, user?.uid); // allowed to pass extra param
      clearInterval(progressInterval);
      setProgress(100);
      setNote(generated);
      setActiveTab('note');
      await addHistoryEntry(`Source: ${filename}`, generated.content.summary || '', { title: generated.content.title, type: 'notes_generation' });
      trackNoteCreated();
      toast({ title: "Notes generated" });
    } catch (err: any) {
      clearInterval(progressInterval);
      const m = err?.message || String(err);
      toast({ variant: "destructive", title: "Failed generating notes", description: m });
      console.error("generateNotes error:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 700);
    }
  }, [user, addHistoryEntry, trackNoteCreated, toast]);

  const serializeNoteToMarkdown = (n: AINote) => {
    const { content, flashcards, quiz } = n;
    let md = `# ${content.title}\n\n**Source:** ${n.filename}\n\n## Summary\n${content.summary}\n\n## Key Takeaways\n`;
    content.keyTakeaways.forEach(k => md += `- ${k}\n`);
    md += `\n## Full Notes\n`;
    content.fullNotes.forEach(s => { md += `### ${s.heading}\n${s.content}\n\n`; });
    md += `---\n\n## Quiz\n`;
    quiz.forEach((q, i) => {
      md += `${i+1}. ${q.question}\n`;
      q.options.forEach((o, j) => md += `  - ${String.fromCharCode(65+j)}. ${o}\n`);
      md += `\n**Answer:** ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}\n\n`;
    });
    md += `\n## Flashcards\n`;
    flashcards.forEach(f => md += `- Q: ${f.question}\n  - A: ${f.answer}\n`);
    return md;
  };

  const downloadNotes = () => {
    if (!note) return;
    const md = serializeNoteToMarkdown(note);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = note.content.title.replace(/[^\w-]+/g, '_').slice(0, 60) || 'notes';
    a.download = `${safe}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download started" });
  };

  const resetAll = () => { setSourceText(''); setSourceFilename('Pasted Text'); setNote(null); setInputType('upload'); };

  const panelVariants = { hidden: { opacity: 0, y: -8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.36 } }, exit: { opacity: 0, y: 8 } };

  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-200">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black flex items-center justify-center gap-4">
              <BrainCircuit className="w-10 h-10 text-lime-400"/> AI Notes Generator
            </h1>
            <p className="text-neutral-400 mt-2 max-w-3xl mx-auto">Upload or paste text and get structured notes, quizzes and flashcards — optimized for mobile & dark mode.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: Input / Actions */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg min-h-[64vh] flex flex-col">
              <AnimatePresence mode="wait">
                {!note ? (
                  <motion.div key="input" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-2xl font-bold">1. Provide Source</h2>
                      <p className="text-neutral-400 mt-1">Upload a file (PDF, DOCX, TXT, MD) or paste text.</p>
                    </div>

                    <div className="flex gap-3 items-center">
                      <button onClick={() => setInputType('upload')} className={`px-3 py-1 rounded-md font-semibold ${inputType === 'upload' ? 'bg-lime-400 text-black' : 'bg-neutral-800 text-neutral-300'}`}>Upload</button>
                      <button onClick={() => setInputType('text')} className={`px-3 py-1 rounded-md font-semibold ${inputType === 'text' ? 'bg-lime-400 text-black' : 'bg-neutral-800 text-neutral-300'}`}>Paste Text</button>
                    </div>

                    {inputType === 'upload' ? (
                      <FileUploaderComponent onFileProcessed={handleFileProcessed} isProcessing={isLoading} />
                    ) : (
                      <div className="flex flex-col gap-3">
                        <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} rows={10} placeholder="Paste your article, transcript or notes here..." className="w-full resize-none p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                          <ActionButton onClick={handleTextSubmit} icon={Sparkles} isLoading={isLoading}>Generate Notes</ActionButton>
                          <button onClick={() => { setSourceText(''); setSourceFilename('Pasted Text'); }} className="p-3 rounded-lg border border-neutral-800 bg-neutral-800 text-neutral-300">Clear</button>
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      <p className="text-sm text-neutral-500 mb-2">Tip: For best results keep source ≤ 100k characters — split large files into sections.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="actions" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Actions</h2>
                    <p className="text-neutral-400">Your materials are ready. Download, create new or view tabs on the right.</p>
                    <div className="grid grid-cols-1 gap-3">
                      <ActionButton onClick={downloadNotes} icon={Download}>Download All (.md)</ActionButton>
                      <button onClick={resetAll} className="w-full p-3 rounded-lg border border-neutral-800 bg-neutral-800 text-neutral-200 font-semibold">Start Over</button>
                    </div>
                    <div className="text-xs text-neutral-500 mt-4">Generated: {note && new Date(note.timestamp).toLocaleString()}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Output */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg min-h-[64vh] flex flex-col">
              <AnimatePresence mode="wait">
                {isLoading && !note ? (
                  <motion.div key="loading" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center gap-4 h-full">
                    <Loader2 className="w-14 h-14 animate-spin text-lime-400" />
                    <div className="text-center">
                      <h3 className="font-bold text-neutral-100">Generating…</h3>
                      <p className="text-neutral-400">This can take a few seconds depending on the model.</p>
                    </div>
                    <div className="w-full max-w-md h-2 rounded-full bg-neutral-800 overflow-hidden mt-3">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-lime-400" transition={{ ease: 'linear', duration: 0.6 }} />
                    </div>
                  </motion.div>
                ) : note ? (
                  <motion.div key="note" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full">
                    {/* Tabs */}
                    <div className="flex items-center gap-4 border-b border-neutral-800 pb-3 mb-4">
                      <button onClick={() => setActiveTab('note')} className={`px-3 py-2 rounded-md font-semibold ${activeTab === 'note' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}><BookOpen className="inline w-4 h-4 mr-1"/> Note</button>
                      <button onClick={() => setActiveTab('quiz')} className={`px-3 py-2 rounded-md font-semibold ${activeTab === 'quiz' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}><HelpCircle className="inline w-4 h-4 mr-1"/> Quiz</button>
                      <button onClick={() => setActiveTab('flashcards')} className={`px-3 py-2 rounded-md font-semibold ${activeTab === 'flashcards' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}><Zap className="inline w-4 h-4 mr-1"/> Flashcards</button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className="h-full">
                          {activeTab === 'note' && <NoteView content={note.content} sourceFilename={sourceFilename} />}
                          {activeTab === 'quiz' && <QuizView questions={note.quiz} />}
                          {activeTab === 'flashcards' && <FlashcardView flashcards={note.flashcards} />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center gap-4 h-full text-center text-neutral-500">
                    <Sparkles className="w-16 h-16 text-lime-400" />
                    <div className="text-lg font-semibold">Your notes will appear here</div>
                    <div>Upload a file or paste text to generate structured notes, quizzes and flashcards.</div>
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
