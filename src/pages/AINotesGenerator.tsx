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
} from "lucide-react";
import { generateNotesAI, generateFlashcardsAI, AINote, Flashcard } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Libraries for File Extraction ---
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";

// Required for pdfjs to work in a Vite/Next.js environment
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();


// --- Helper Functions & Interfaces (File Extraction logic is now here) ---

export interface ExtractionResult {
  text: string;
  filename: string;
}

/**
 * Extracts text from various file types (PDF, DOCX, TXT, MD).
 * This function now lives inside your component file.
 */
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
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
    className={`w-full flex items-center justify-center gap-3 text-lg font-bold p-4 border-2 border-neutral-200 bg-neutral-950 text-neutral-200 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group ${className}`}
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
            const result = await extractTextFromFile(file); // This will now work correctly
            onFileProcessed(result);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error Processing File",
                description: error instanceof Error ? error.message : "Could not read the file.",
            });
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    return (
        <div
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md transition-all duration-300 ${isDragging ? 'border-lime-400 bg-lime-950' : 'border-neutral-700 bg-neutral-900'}`}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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

const ChatInterface = ({ messages, onSendMessage, isLoading }: { messages: ChatMessage[], onSendMessage: (input: string) => void, isLoading: boolean }) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput("");
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-neutral-950 border-t-2 border-neutral-700 mt-4 pt-4">
            <p className="text-sm font-bold text-magenta-400 mb-2 pl-1">Chat With Your Notes</p>
            <div className="flex-grow overflow-y-auto pr-2 space-y-3 mb-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-magenta-800 text-neutral-100 rounded-br-none' : 'bg-neutral-800 text-neutral-300 rounded-bl-none'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>

                        </motion.div>
                    ))}
                     {isLoading && (
                         <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                             <div className="p-3 rounded-lg bg-neutral-800 flex items-center gap-2">
                                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse delay-0" />
                                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse delay-150" />
                                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse delay-300" />
                            </div>
                         </motion.div>
                     )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about your notes..."
                    className="flex-grow bg-neutral-800 border-2 border-neutral-700 focus:border-magenta-500 focus:ring-0 outline-none rounded-md px-4 text-sm text-neutral-200 transition-colors"
                />
                <button type="submit" disabled={isLoading || !input} className="p-2.5 bg-magenta-500 text-black border-2 border-magenta-500 rounded-md hover:bg-magenta-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};


// --- Main AI Notes Generator Component ---

const AINotesGenerator = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackNoteCreated } = useStudyTracking();
  const { addHistoryEntry } = useHistory('notes');

  // --- State Management ---
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [sourceText, setSourceText] = useState("");
  const [sourceFilename, setSourceFilename] = useState("Pasted Text");
  const [note, setNote] = useState<AINote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Loading states for actions
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Load note from local storage on initial render
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

  // Save note to local storage whenever it changes
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

  const handleFileProcessed = (result: ExtractionResult) => {
    setSourceText(result.text);
    setSourceFilename(result.filename);
    generateNotes(result.text, result.filename);
  };

  const handleTextSubmit = () => {
    if (!sourceText.trim()) {
      toast({ variant: "destructive", title: "Text is empty!", description: "Please paste some text to generate notes." });
      return;
    }
    generateNotes(sourceText, "Pasted Text");
  };

  const generateNotes = useCallback(async (text: string, filename: string) => {
    setIsLoading(true);
    setNote(null); // Clear previous notes
    setProgress(10);
    try {
      let progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 5, 90));
      }, 500);

      const generatedNote = await generateNotesAI(text, filename, user?.uid || "anonymous");
      
      clearInterval(progressInterval);
      setProgress(100);

      setNote(generatedNote);
      setShowChat(false);
      setChatMessages([]);
      
      await addHistoryEntry(`Source: ${filename}`, generatedNote.content, { title: generatedNote.title, type: 'notes_generation' });
      trackNoteCreated();
      toast({ title: "Notes Generated Successfully! 🎉", description: "You can now create quizzes, flashcards, or chat with your new notes." });

    } catch (error) {
      console.error("Error generating notes:", error);
      toast({ variant: "destructive", title: "Error Generating Notes", description: error instanceof Error ? error.message : "An unknown error occurred. Please try again." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  }, [user, addHistoryEntry, trackNoteCreated, toast]);

  const handleChatSubmit = async (input: string) => {
    if (!note) return;

    const newUserMessage: ChatMessage = { role: 'user', content: input };
    const currentChatHistory = [...chatMessages, newUserMessage];
    setChatMessages(currentChatHistory);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on these notes: "${note.content}"\n\nUser question: ${input}`,
          model: 'groq'
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      
      const aiMessage: ChatMessage = { role: 'assistant', content: data.response };
      setChatMessages([...currentChatHistory, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, I hit a snag. Could you try asking that again?' };
      setChatMessages([...currentChatHistory, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const createFlashcards = async () => {
    if (!note) return;
    setIsGeneratingFlashcards(true);
    
    try {
      const flashcards: Flashcard[] = await generateFlashcardsAI(note.content);
      if (!flashcards || flashcards.length === 0) {
        throw new Error("The AI couldn't generate flashcards from this text.");
      }
      localStorage.setItem('flashcards', JSON.stringify(flashcards));
      localStorage.setItem('flashcards-source', note.title);
      toast({ title: "Flashcards Ready! 📚", description: "Taking you to the flashcards page now." });
      navigate('/flashcards');
    } catch (error) {
      toast({ variant: "destructive", title: "Flashcard Generation Failed", description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const createQuiz = async () => {
    if (!note) return;
    setIsGeneratingQuiz(true);
    
    try {
      const quizPrompt = `Create a quiz with 5 multiple choice questions based on these notes. Format the output as a clean JSON array like this: [{"question": "What is...?", "options": ["A", "B", "C", "D"], "correct": 0}] where 'correct' is the zero-based index of the correct option. ONLY output the JSON array, no other text. Notes: ${note.content}`;
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: quizPrompt, model: 'gemini' })
      });
      
      if (!response.ok) throw new Error('Failed to get a response from the AI for the quiz.');
      const data = await response.json();
      
      const questions: QuizQuestion[] = safeJsonParse(data.response);
      
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error("The AI returned an invalid format for the quiz. Please try again.");
      }
      
      localStorage.setItem('generatedQuiz', JSON.stringify({ title: note.title, questions }));
      toast({ title: "Quiz Ready! 📝", description: "Navigating you to your new quiz." });
      navigate('/quiz?source=generated');
    } catch (error) {
      toast({ variant: "destructive", title: "Error Creating Quiz", description: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const downloadNotes = () => {
    if (!note) return;
    const blob = new Blob([`# ${note.title}\n\nSource: ${sourceFilename}\n\n---\n\n${note.content}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/ /g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({title: "Download Started", description: `${a.download} is being saved.`});
  };

  const startOver = () => {
    setSourceText("");
    setSourceFilename("Pasted Text");
    setNote(null);
    setProgress(0);
    setChatMessages([]);
    setInputType('upload');
    setShowChat(false);
    localStorage.removeItem('ai-generated-note');
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
              <BrainCircuit className="w-10 h-10 md:w-14 md:h-14 text-lime-400"/>
              AI Notes Generator
            </h1>
            <p className="text-neutral-400 mt-3 max-w-2xl mx-auto">
              Transform any document, lecture, or pasted text into structured, intelligent notes in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 space-y-8 lg:space-y-0">
            
            {/* --- LEFT PANEL: INPUT & ACTIONS --- */}
            <div className="bg-neutral-900 border-2 border-neutral-800 p-6 flex flex-col min-h-[70vh]">
                <AnimatePresence mode="wait">
                    {!note ? (
                        <motion.div key="input" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="text-2xl font-bold text-neutral-100 mb-4">1. Provide Your Source</h2>
                            <div className="flex justify-center gap-2 mb-6 p-1 bg-neutral-950 border-2 border-neutral-700 w-fit mx-auto">
                                <button onClick={() => setInputType('upload')} className={`px-4 py-2 font-bold transition-colors ${inputType === 'upload' ? 'bg-lime-400 text-black' : 'bg-transparent text-neutral-300'}`}><Upload className="w-4 h-4 mr-2 inline"/> Upload File</button>
                                <button onClick={() => setInputType('text')} className={`px-4 py-2 font-bold transition-colors ${inputType === 'text' ? 'bg-lime-400 text-black' : 'bg-transparent text-neutral-300'}`}><FileText className="w-4 h-4 mr-2 inline"/> Paste Text</button>
                            </div>
                            
                            {inputType === 'upload' ? (
                                <FileUploaderComponent onFileProcessed={handleFileProcessed} isProcessing={isLoading} />
                            ) : (
                                <>
                                    <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your text, transcript, or article here..." className="w-full h-48 md:h-64 bg-neutral-950 border-2 border-neutral-700 rounded-md text-neutral-300 p-4 focus:border-lime-400 focus:ring-0 resize-none transition-colors scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"/>
                                    <button onClick={handleTextSubmit} disabled={isLoading || !sourceText.trim()} className="w-full mt-6 flex items-center justify-center gap-3 text-lg font-bold p-4 bg-lime-400 text-black border-2 border-lime-400 hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Sparkles className="w-6 h-6"/> Generate Notes </>}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="actions" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full">
                            <h2 className="text-2xl font-bold text-neutral-100 mb-4">3. What's Next?</h2>
                            <p className="text-neutral-400 mb-6">Your notes are ready. Now you can create study materials or ask the AI questions.</p>
                            <div className="space-y-4">
                               <ActionButton onClick={createQuiz} icon={HelpCircle} disabled={isGeneratingQuiz} isLoading={isGeneratingQuiz} className="hover:border-cyan-400">Create Quiz</ActionButton>
                               <ActionButton onClick={createFlashcards} icon={Zap} disabled={isGeneratingFlashcards} isLoading={isGeneratingFlashcards} className="hover:border-cyan-400">Generate Flashcards</ActionButton>
                               <ActionButton onClick={() => setShowChat(!showChat)} icon={MessageCircle} className="hover:border-magenta-400">{showChat ? 'Hide Chat' : 'Chat with Notes'}</ActionButton>
                               <ActionButton onClick={downloadNotes} icon={Download} className="hover:border-lime-400">Download Notes</ActionButton>
                            </div>
                            <div className="mt-auto pt-6">
                                <button onClick={startOver} className="w-full flex items-center justify-center gap-3 p-3 bg-neutral-800 text-neutral-300 border-2 border-neutral-700 hover:bg-neutral-700 hover:text-white transition-colors font-bold">
                                    <RefreshCcw className="w-5 h-5"/> Generate New Notes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- RIGHT PANEL: OUTPUT --- */}
            <div className={`bg-neutral-900 border-2 p-6 flex flex-col min-h-[70vh] transition-colors duration-500 ${note ? 'border-cyan-500' : 'border-neutral-800'}`}>
                <AnimatePresence mode="wait">
                    {isLoading && !note ? ( // Show loader only when generating new notes, not just processing a file
                        <motion.div key="loading" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center">
                            <Loader2 className="w-16 h-16 animate-spin text-lime-400 mb-6"/>
                            <h3 className="text-2xl font-bold text-neutral-100">AI Is Working Its Magic...</h3>
                            <p className="text-neutral-400 mt-2">Analyzing your text and structuring the notes.</p>
                            <div className="w-full max-w-sm mt-6 bg-neutral-800 border-2 border-neutral-700 h-3 overflow-hidden">
                                <motion.div className="h-full bg-lime-400" initial={{width: 0}} animate={{width: `${progress}%`}} transition={{duration: 0.5, ease: "linear"}}/>
                            </div>
                        </motion.div>
                    ) : note ? (
                        <motion.div key="notes" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full overflow-hidden">
                            <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-3"><BookOpen/> {note.title}</h2>
                            <p className="text-sm text-neutral-500 mb-4 flex-shrink-0">Source: {sourceFilename}</p>
                            <div className="flex-grow overflow-y-auto pr-2 -mr-2 mb-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm prose-invert max-w-none prose-h3:text-cyan-400 prose-strong:text-neutral-50 prose-a:text-lime-400 prose-a:no-underline hover:prose-a:underline">
                                    {note.content}
                                </ReactMarkdown>
                            </div>
                             <AnimatePresence>
                                {showChat && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, transition: { height: {duration: 0.4}, opacity: {duration: 0.2, delay: 0.2} } }} exit={{ height: 0, opacity: 0, transition: { height: {duration: 0.4, delay: 0.1}, opacity: {duration: 0.1} } }} className="flex-shrink-0 overflow-hidden h-[45vh] max-h-[45vh]">
                                        <ChatInterface messages={chatMessages} onSendMessage={handleChatSubmit} isLoading={isChatLoading} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div key="placeholder" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center text-neutral-600">
                            <Sparkles className="w-20 h-20 mb-6"/>
                            <h3 className="text-2xl font-black text-neutral-500">2. Notes Will Appear Here</h3>
                            <p>Upload a file or paste some text to begin the process.</p>
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
