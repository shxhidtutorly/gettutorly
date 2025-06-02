
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FileUploader from "@/components/features/FileUploader";
import NotesDisplay from "@/components/features/NotesDisplay";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { ExtractionResult } from "@/lib/fileExtractor";
import { generateNotesAI, AINote, Flashcard } from "@/lib/aiNotesService";

const AINotesGenerator = () => {
  const [extractedFile, setExtractedFile] = useState<ExtractionResult | null>(null);
  const [note, setNote] = useState<AINote | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesProgress, setNotesProgress] = useState(0);
  const { toast } = useToast();

  const handleFileProcessed = async (result: ExtractionResult) => {
    setExtractedFile(result);
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
      
      setTimeout(() => setNotesProgress(0), 1000);
      
      toast({
        title: "Notes generated successfully!",
        description: "Your AI-powered study notes are ready."
      });
    } catch (error) {
      console.error('Error generating notes:', error);
      setNotesProgress(0);
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
    console.log('Flashcards generated:', flashcards.length);
  };

  const startOver = () => {
    setExtractedFile(null);
    setNote(null);
    setNotesProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 mr-3 text-primary" />
              <h1 className="text-3xl font-bold">AI Notes Generator</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your study materials and let AI transform them into structured, comprehensive notes
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
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Generating AI Notes...</h3>
                <p className="text-muted-foreground">
                  Our AI is analyzing your content and creating structured study notes
                </p>
              </div>
              <Progress value={notesProgress} className="h-3" />
              <p className="text-sm text-center text-muted-foreground mt-2">
                {notesProgress < 30 ? 'Processing file...' : 
                 notesProgress < 80 ? 'Generating notes...' : 
                 'Finalizing...'}
              </p>
            </div>
          )}

          {note && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Button 
                  onClick={startOver}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Upload Another File
                </Button>
              </div>
              
              <NotesDisplay 
                note={note} 
                onFlashcardsGenerated={handleFlashcardsGenerated}
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
