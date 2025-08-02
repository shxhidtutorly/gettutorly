"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FileUploader from "@/components/features/FileUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import NotesChat from "@/components/features/NotesChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ExternalLink,
} from "lucide-react";
import { ExtractionResult } from "@/lib/fileExtractor";
import { generateNotesAI, AINote, Flashcard } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useHistory } from "@/hooks/useHistory";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import { QuizFromNotesButton } from "@/components/features/QuizFromNotesButton";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AINotesGenerator = () => {
  const [user] = useAuthState(auth);
  const [extractedFile, setExtractedFile] = useState<ExtractionResult | null>(null);
  const [note, setNote] = useState<AINote | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesProgress, setNotesProgress] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);

  const { trackNotesCreation, endSession, startSession } = useStudyTracking();
  const { addHistoryEntry } = useHistory("notes");
  const { toast } = useToast();

  const handleFileProcessed = async (result: ExtractionResult) => {
    setExtractedFile(result);
    startSession();
    await generateNotes(result);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter some text to generate notes from",
      });
      return;
    }

    const result: ExtractionResult = {
      text: textInput.trim(),
      filename: "Text Input",
      fileType: "text",
    };
    setExtractedFile(result);
    startSession();
    await generateNotes(result);
  };

  const generateNotes = async (fileResult: ExtractionResult) => {
    setIsGeneratingNotes(true);
    setNotesProgress(10);
    try {
      setNotesProgress(30);
      const generatedNote = await generateNotesAI(fileResult.text, fileResult.filename, user?.uid || "");
      setNotesProgress(80);
      setNote(generatedNote);
      setNotesProgress(100);

      await addHistoryEntry(
        `Source: ${fileResult.filename}`,
        generatedNote.content,
        { title: generatedNote.title, type: "notes_generation" }
      );
      trackNotesCreation();
      endSession("notes", generatedNote.title, true);

      setTimeout(() => setNotesProgress(0), 1000);

      toast({
        title: "Notes generated successfully! 🎉",
        description: "Your AI-powered study notes are ready.",
      });
    } catch (error) {
      console.error("Error generating notes:", error);
      setNotesProgress(0);
      endSession("notes", fileResult.filename, false);
      toast({
        variant: "destructive",
        title: "Error generating notes",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !note) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);
    try {
      // Simulate AI response - in production, you'd call your AI service
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Based on these notes: "${note.content}"\n\nUser question: ${currentInput}`,
          model: "groq",
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");
      const data = await response.json();
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.response || data.message || "I apologize, but I had trouble processing your question.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);

      await addHistoryEntry(currentInput, aiMessage.content, {
        type: "notes_chat",
        notesTitle: note.title,
      });
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I apologize, but I had trouble processing your question. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateFlashcardsFromNotes = async () => {
    setIsGeneratingNotes(true);
    try {
      const flashcards = await generateFlashcardsAI(note.content);
      localStorage.setItem("flashcards", JSON.stringify(flashcards));
      localStorage.setItem("flashcards-source", note.title);
      setFlashcardsGenerated(true);
      toast({
        title: "Flashcards generated!",
        description: `Created ${flashcards.length} flashcards from your notes.`,
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        variant: "destructive",
        title: "Error generating flashcards",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const startOver = () => {
    setExtractedFile(null);
    setNote(null);
    setNotesProgress(0);
    setTextInput("");
    setShowChat(false);
    setChatMessages([]);
    setActiveTab("upload");
    setFlashcardsGenerated(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-black">
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8 animate-fadeInDown transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl md:text-3xl mr-2" role="img" aria-label="sparkles">
                ✨
              </span>
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">AI Notes Generator</h1>
              <span className="text-2xl md:text-3xl ml-2" role="img" aria-label="books">
                📚
              </span>
            </div>
            <p className="max-w-2xl mx-auto text-sm md:text-base font-medium text-white/80">
              Turn any study file or text into detailed AI-powered notes, flashcards, and quizzes — all in one place.
            </p>
          </div>

          {isGeneratingNotes && notesProgress > 0 && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="text-center mb-4">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin mx-auto mb-2 text-yellow-400" />
                <h3 className="text-lg md:text-xl font-bold tracking-wide">
                  Creating AI Notes... <span role="img" aria-label="robot">🤖</span>
                </h3>
                <p className="text-white/70 text-sm md:text-base">
                  {notesProgress < 30
                    ? "Thinking... 🤔"
                    : notesProgress < 80
                    ? "Structuring Notes... 📝"
                    : "Generating with AI... 🚀"}
                </p>
              </div>
              <Progress value={notesProgress} className="h-3 bg-gradient-to-r from-yellow-400 to-pink-500" />
            </div>
          )}

          {!note && !isGeneratingNotes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="animate-fadeInUp mb-6 md:mb-8"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Paste Text</span>
                    <span className="sm:hidden">Text</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <FileUploader
                    onFileProcessed={handleFileProcessed}
                    isProcessing={isGeneratingNotes}
                  />
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Paste Your Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste your study material, lecture notes, or any text content here..."
                        className="min-h-[200px] resize-none bg-gray-800 border-gray-700 text-white"
                        disabled={isGeneratingNotes}
                      />
                      <Button
                        onClick={handleTextSubmit}
                        disabled={isGeneratingNotes || !textInput.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isGeneratingNotes ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Notes
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {note && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center flex-wrap">
                <Button onClick={startOver} variant="ghost" className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-500">
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Notes</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
                <DownloadNotesButton content={note.content} filename={note.title}>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Notes</span>
                  <span className="sm:hidden">Download</span>
                </DownloadNotesButton>
                <QuizFromNotesButton notesContent={note.content} notesTitle={note.title}>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate Quiz</span>
                  <span className="sm:hidden">Quiz</span>
                </QuizFromNotesButton>
                <Button onClick={handleGenerateFlashcardsFromNotes} disabled={isGeneratingNotes || flashcardsGenerated} variant="default" className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700">
                  {isGeneratingNotes ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : flashcardsGenerated ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">View Flashcards</span>
                      <span className="sm:hidden">View Cards</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Generate Flashcards</span>
                      <span className="sm:hidden">Cards</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="w-full max-w-6xl mx-auto space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-400" />
                          {note.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Badge variant="secondary" className="bg-gray-700 text-gray-200">{note.filename}</Badge>
                          <span>•</span>
                          <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="notes" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat with Notes
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notes">
                    <Card className="bg-gray-900 border-gray-700">
                      <Separator className="bg-gray-700" />
                      <CardContent className="p-6">
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="chat">
                    <NotesChat noteId={note.id || `note-${Date.now()}`} noteContent={note.content} noteTitle={note.title} />
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AINotesGenerator;
