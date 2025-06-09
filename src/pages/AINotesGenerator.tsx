import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FileUploader from "@/components/features/FileUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Loader2, Download, Sparkles, RefreshCcw } from "lucide-react";
import { ExtractionResult } from "@/lib/fileExtractor";
import { generateNotesAI, AINote, Flashcard } from "@/lib/aiNotesService";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { DownloadNotesButton } from "@/components/features/DownloadNotesButton";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { QuizFromNotesButton } from "@/components/features/QuizFromNotesButton";

const AINotesGenerator = () => {
  const [extractedFile, setExtractedFile] = useState<ExtractionResult | null>(null);
  const [note, setNote] = useState<AINote | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesProgress, setNotesProgress] = useState(0);
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

    try {
      setNotesProgress(30);
      const generatedNote = await generateNotesAI(fileResult.text, fileResult.filename);
      setNotesProgress(80);

      setNote(generatedNote);
      setNotesProgress(100);

      // Track the notes creation
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

  // No longer used, but kept for NotesDisplay prop compatibility
  const handleFlashcardsGenerated = (flashcards: Flashcard[]) => {
    // you can handle flashcards here if needed
  };

  const startOver = () => {
    setExtractedFile(null);
    setNote(null);
    setNotesProgress(0);
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white relative"
      style={{
        background: "linear-gradient(135deg, #232946 0%, #18122B 100%)",
        transition: "background 0.5s",
      }}
    >
      <Navbar />

<main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
  <div className="container max-w-6xl mx-auto">
    {/* Back to Dashboard button top left */}
    <div className="mb-4 flex items-center">
      <BackToDashboardButton />
    </div>

    <div
      className="text-center mb-6 md:mb-8 animate-fadeInDown transition-all duration-300"
    >
      <div className="flex items-center justify-center mb-4">
        <span className="text-3xl md:text-4xl mr-2" role="img" aria-label="sparkles">
          ✨
        </span>
        <BookOpen className="h-8 w-8 md:h-10 md:w-10 mr-3 text-primary" />
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-sm tracking-wide">
          AI Notes Generator
        </h1>
    
              <span className="text-3xl md:text-4xl ml-2" role="img" aria-label="books">
                📚
              </span>
            </div>
            <p className="max-w-2xl mx-auto text-base md:text-lg font-medium text-white/80">
              Turn any study file into detailed AI-powered notes, flashcards, and quizzes — all in one place.
            </p>
          </div>

          {!extractedFile && !note && (
            <div
              className="animate-fadeInUp"
              style={{
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
                borderRadius: "1.25rem",
                background: "rgba(255,255,255,0.01)",
                backdropFilter: "blur(6px)",
              }}
            >
              <FileUploader
                onFileProcessed={handleFileProcessed}
                isProcessing={isGeneratingNotes}
              />
            </div>
          )}

          {isGeneratingNotes && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="text-center mb-4">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin mx-auto mb-2 text-yellow-400" />
                <h3 className="text-lg md:text-xl font-bold tracking-wide">
                  Creating AI Notes... <span role="img" aria-label="robot">🤖</span>
                </h3>
                <p className="text-white/70 text-base md:text-lg">
                  Our AI is analyzing your content and creating structured study notes
                </p>
              </div>
              <Progress value={notesProgress} className="h-3 bg-gradient-to-r from-yellow-400 to-pink-500" />
              <p className="text-base text-center text-white/70 mt-2">
                {notesProgress < 30
                  ? "Processing file... ⏳"
                  : notesProgress < 80
                  ? "Generating notes... 📝"
                  : "Finalizing... 🚀"}
              </p>
            </div>
          )}

          {note && (
            <div className="space-y-8 animate-fadeInUp">
              {/* Only keep Back to Dashboard button on top left, so nothing here */}
              {/* Action buttons after notes are generated */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <DownloadNotesButton
                  content={note.content}
                  filename={note.title}
                >
                  <Download className="w-4 h-4" />
                  Download Notes
                </DownloadNotesButton>
                <QuizFromNotesButton
                  notesContent={note.content}
                  notesTitle={note.title}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Quiz
                </QuizFromNotesButton>
                {/* "Generate AI Flashcards" button removed as requested */}

                {/* NEW BUTTON: Upload Another File */}
                <Button
                  onClick={startOver}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Upload Another File
                </Button>
              </div>

              <NotesDisplay
                note={note}
                onFlashcardsGenerated={handleFlashcardsGenerated}
              />

              {/* Upload Another File button removed, as well as Back to Dashboard duplicate */}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      {/* CSS Keyframes for fadeInDown/fadeInUp */}
      <style jsx global>{`
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.85s;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.85s;
        }
      `}</style>
    </div>
  );
};

export default AINotesGenerator;
