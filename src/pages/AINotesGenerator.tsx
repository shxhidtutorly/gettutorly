import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  Trash2,
  HelpCircle,
  Zap
} from "lucide-react";
import { ExtractionResult, extractTextFromFile } from "@/lib/fileExtractor";
import FileUploader from "@/components/features/FileUploader";
// Assuming you have this helper
import { generateNotesAI, AINote, Flashcard } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Interfaces ---
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// --- Main Component ---
const AINotesGenerator = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackNotesCreation, endSession, startSession } = useStudyTracking();
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
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- Handlers ---
  const handleFileProcessed = async (result: ExtractionResult) => {
    setSourceText(result.text);
    setSourceFilename(result.filename);
    await generateNotes(result.text, result.filename);
  };

  const handleTextSubmit = async () => {
    if (!sourceText.trim()) {
      toast({ variant: "destructive", title: "Please enter some text." });
      return;
    }
    await generateNotes(sourceText, "Pasted Text");
  };

  const generateNotes = async (text: string, filename: string) => {
    setIsLoading(true);
    setProgress(10);
    startSession();

    try {
      setProgress(30);
      const generatedNote = await generateNotesAI(text, filename, user?.uid || "");
      setProgress(80);
      setNote(generatedNote);
      setProgress(100);

      await addHistoryEntry(`Source: ${filename}`, generatedNote.content, { title: generatedNote.title, type: 'notes_generation' });
      trackNotesCreation();
      endSession("notes", generatedNote.title, true);

      toast({ title: "Notes Generated Successfully! 🎉" });
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error("Error generating notes:", error);
      endSession("notes", filename, false);
      toast({ variant: "destructive", title: "Error Generating Notes", description: error instanceof Error ? error.message : "Please try again." });
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !note) return;

    const newUserMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    const currentChatHistory = [...chatMessages, newUserMessage];
    setChatMessages(currentChatHistory);
    const currentInput = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Based on these notes: "${note.content}"\n\nUser question: ${currentInput}`,
          model: 'groq' // Or your preferred model
        })
      });
      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      const aiMessage: ChatMessage = { role: 'assistant', content: data.response };
      setChatMessages([...currentChatHistory, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setChatMessages([...currentChatHistory, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const createFlashcards = () => {
    if (!note) return;
    localStorage.setItem('flashcards', JSON.stringify(note.flashcards));
    localStorage.setItem('flashcards-source', note.title);
    toast({ title: "Flashcards Ready! 📚", description: "Navigating you to the flashcards page." });
    navigate('/flashcards');
  };

  const createQuiz = () => {
    if (!note) return;
    localStorage.setItem('generatedQuiz', JSON.stringify({ title: note.title, questions: note.quiz }));
    toast({ title: "Quiz Ready! 📝", description: "Navigating you to the quiz page." });
    navigate('/quiz?source=generated');
  };

  const startOver = () => {
    setSourceText("");
    setSourceFilename("Pasted Text");
    setNote(null);
    setProgress(0);
    setChatMessages([]);
    setInputType('upload');
  };

  // --- UI Components & Styles ---
  const neonColors = {
    green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]',
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
  };

  const BrutalistButton = ({ children, onClick, disabled, className = '' }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean, className?: string }) => (
    <Button onClick={onClick} disabled={disabled} className={`bg-transparent border-2 hover:bg-gray-800 rounded-none font-bold transition-all duration-200 ${className}`}>
      {children}
    </Button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-green-400"/>
              AI Notes Generator
            </h1>
            <p className="text-gray-400 mt-2">Generate notes, flashcards, and quizzes from any document or text.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* --- LEFT PANEL: INPUT --- */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className={`bg-gray-900 border-2 rounded-none p-6 min-h-[60vh] ${note ? 'border-gray-700' : neonColors.green}`}>
                <AnimatePresence mode="wait">
                  {note ? (
                     <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                        <h2 className="text-2xl font-black text-white mb-4">Actions</h2>
                        <div className="space-y-4">
                           <BrutalistButton onClick={createQuiz} className={`w-full h-14 text-lg ${neonColors.green}`}><HelpCircle className="mr-2"/> Create Quiz</BrutalistButton>
                           <BrutalistButton onClick={createFlashcards} className={`w-full h-14 text-lg ${neonColors.pink}`}><Zap className="mr-2"/> Create Flashcards</BrutalistButton>
                           <DownloadNotesButton content={note.content} filename={note.title} />
                        </div>
                        <div className="mt-auto pt-4">
                           <Button onClick={startOver} className="w-full bg-gray-800 text-white border-2 border-gray-600 hover:bg-gray-700 rounded-none font-bold h-12">
                              <RefreshCcw className="mr-2"/> Generate New Notes
                           </Button>
                        </div>
                     </motion.div>
                  ) : (
                    <motion.div key="input-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex justify-center gap-2 mb-6 p-1 bg-black border-2 border-gray-700 rounded-none w-fit mx-auto">
                        <Button onClick={() => setInputType('upload')} className={`rounded-none font-bold ${inputType === 'upload' ? 'bg-green-500 text-black' : 'bg-transparent text-white'}`}><Upload className="w-4 h-4 mr-2"/> Upload</Button>
                        <Button onClick={() => setInputType('text')} className={`rounded-none font-bold ${inputType === 'text' ? 'bg-green-500 text-black' : 'bg-transparent text-white'}`}><FileText className="w-4 h-4 mr-2"/> Paste Text</Button>
                      </div>
                      
                      {inputType === 'upload' ? (
                        <FileUploader onFileProcessed={handleFileProcessed} isProcessing={isLoading} />
                      ) : (
                        <Textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your text here..." className="w-full h-48 bg-black border-2 border-gray-600 rounded-none text-white p-4 focus:border-green-400 focus:ring-0 resize-none"/>
                      )}
                      
                      <Button onClick={inputType === 'upload' ? () => {} : handleTextSubmit} disabled={isLoading || (inputType === 'text' && !sourceText.trim())} className="w-full mt-6 bg-green-500 text-black border-2 border-green-400 hover:bg-green-400 rounded-none font-black text-lg h-14">
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Sparkles className="w-6 h-6 mr-2"/> Generate Notes </>}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* --- RIGHT PANEL: OUTPUT --- */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
               <div className={`bg-gray-900 border-2 rounded-none p-6 min-h-[60vh] flex flex-col ${note ? neonColors.pink : 'border-gray-700'}`}>
                  <AnimatePresence mode="wait">
                     {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full">
                           <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4"/>
                           <h3 className="text-xl font-bold">Generating AI Notes...</h3>
                           <p className="text-gray-400">This might take a moment.</p>
                           <Progress value={progress} className="w-full max-w-xs mt-4 h-2 bg-black border-2 border-green-400 rounded-none p-0" />
                        </motion.div>
                     ) : note ? (
                        <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                           <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2"><BookOpen/> {note.title}</h2>
                           <p className="text-sm text-gray-500 mb-4">Source: {sourceFilename}</p>
                           <div className="flex-grow overflow-y-auto pr-2">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                                 {note.content}
                              </ReactMarkdown>
                           </div>
                           <div className="mt-4 pt-4 border-t-2 border-gray-700">
                               <div className="flex gap-2">
                                   <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()} placeholder="Chat with your notes..." className="bg-black border-2 border-gray-600 rounded-none h-12 focus:border-pink-500"/>
                                   <Button onClick={handleChatSubmit} disabled={isChatLoading} className="bg-pink-500 text-black border-2 border-pink-400 hover:bg-pink-400 rounded-none font-black h-12 px-5"><Send/></Button>
                               </div>
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                           <Sparkles className="w-16 h-16 mb-4"/>
                           <h3 className="text-2xl font-black text-gray-500">Your Notes Will Appear Here</h3>
                           <p>Upload a file or paste text to get started.</p>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default AINotesGenerator;
