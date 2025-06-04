import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FileUploader from "@/components/features/FileUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Loader2, Download, Sparkles, Layers } from "lucide-react";
import { ExtractionResult } from "@/lib/fileExtractor";
import { generateNotesAI, AINote, Flashcard } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { QuizFromNotesButton } from "@/components/features/QuizFromNotesButton";
import confetti from "canvas-confetti";
import clsx from "clsx";

const AINotesGenerator = () => {
  const [extractedFile, setExtractedFile] = useState<ExtractionResult | null>(null);
  const [note, setNote] = useState<AINote | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesProgress, setNotesProgress] = useState(0);
  const [showFadeIn, setShowFadeIn] = useState(false);
  const { trackNotesCreation, endSession, startSession } = useStudyTracking();
  const { toast } = useToast();

  const handleFileProcessed = async (result: ExtractionResult) => {
    setExtractedFile(result);
    startSession(); // Start tracking session
    await generateNotes(result);
  };

  const generateNotes = async (fileResult: ExtractionResult) => {
    setIsGeneratingNotes(true);
    setNotesProgress(10);
    setShowFadeIn(false);

    try {
      setNotesProgress(30);
      const generatedNote = await generateNotesAI(fileResult.text, fileResult.filename);
      setNotesProgress(80);

      setNote(generatedNote);
      setNotesProgress(100);

      // Animation: confetti on notes creation 🎉
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.7 }
      });
      setTimeout(() => setNotesProgress(0), 800);

      // Fade-in for notes and buttons
      setTimeout(() => setShowFadeIn(true), 200);

      // Track the notes creation
      trackNotesCreation();
      endSession("notes", generatedNote.title, true);

      toast({
        title: "Notes generated successfully!",
        description: "Your AI-powered study notes are ready."
      });
    } catch (error) {
      console.error("Error generating notes:", error);
      setNotesProgress(0);
      endSession("notes", fileResult.filename, false);
      toast({
        variant: "destructive",
        title: "Error generating notes",
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleFlashcardsGenerated = (flashcards: Flashcard[]) => {
    toast({
      title: "AI Flashcards generated!",
      description: `You have ${flashcards.length} new AI-powered flashcards.`
    });
  };

  const startOver = () => {
    setExtractedFile(null);
    setNote(null);
    setNotesProgress(0);
    setShowFadeIn(false);
  };

  return (
    <div className={clsx(
      "min-h-screen flex flex-col transition-colors duration-300",
      "bg-white dark:bg-black"
    )}>
      <Navbar />

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-10">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 md:h-10 md:w-10 mr-3 text-primary animate-bounce" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Notes Generator
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg font-medium">
              📚 Upload your study files and let AI create organized, concise study notes, quizzes, and flashcards instantly!
            </p>
          </div>

          {!extractedFile && !note && (
            <FileUploader
              onFileProcessed={handleFileProcessed}
              isProcessing={isGeneratingNotes}
            />
          )}

          {isGeneratingNotes && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="text-center mb-4">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin mx-auto mb-2 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold">Generating your AI Notes...</h3>
                <p className="text-muted-foreground text-base md:text-lg">
                  Please wait while our AI analyzes your content and crafts your study materials.
                </p>
              </div>
              <Progress value={notesProgress} className="h-3 transition-all" />
              <p className="text-md text-center text-muted-foreground mt-2">
                {notesProgress < 30 ? "Processing file..." :
                  notesProgress < 80 ? "Generating notes..." :
                    "Finalizing..."}
              </p>
            </div>
          )}

          {note && (
            <div className={clsx(
              "space-y-8 transition-all duration-700",
              showFadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <BackToDashboardButton />
                <Button
                  onClick={startOver}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Upload Another File
                </Button>
              </div>

              {/* Action buttons after notes are generated */}
              <div
                className={clsx(
                  "flex flex-col md:flex-row gap-4 justify-center items-center",
                  "transition-opacity duration-700",
                  showFadeIn ? "opacity-100" : "opacity-0"
                )}
              >
                <DownloadNotesButton
                  content={note.content}
                  filename={note.title}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Notes
                </DownloadNotesButton>

                <QuizFromNotesButton
                  notesContent={note.content}
                  notesTitle={note.title}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Quiz
                </QuizFromNotesButton>

                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    // You must have a method to generate flashcards from notes
                    // here just a placeholder for your actual logic
                    handleFlashcardsGenerated([
                      { question: "Flashcard Q1", answer: "A1" },
                      { question: "Flashcard Q2", answer: "A2" }
                    ]);
                  }}
                >
                  <Flashcards className="w-4 h-4" />
                  Generate AI Flashcards
                </Button>
              </div>

              <NotesDisplay
                note={note}
                onFlashcardsGenerated={handleFlashcardsGenerated}
                className={clsx("transition-opacity duration-700",
                  showFadeIn ? "opacity-100" : "opacity-0")}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AINotesGenerator;
