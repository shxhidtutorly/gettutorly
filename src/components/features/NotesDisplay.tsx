
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles, Loader2, ExternalLink, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AINote, generateFlashcardsAI, Flashcard } from "@/lib/aiNotesService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import NotesChat from "./NotesChat";

interface NotesDisplayProps {
  note: AINote;
  onFlashcardsGenerated: (flashcards: Flashcard[]) => void;
}

const NotesDisplay = ({ note, onFlashcardsGenerated }: NotesDisplayProps) => {
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);
  const { toast } = useToast();

  const handleGenerateFlashcards = async () => {
    setIsGeneratingFlashcards(true);
    try {
      const flashcards = await generateFlashcardsAI(note.content);
      localStorage.setItem('flashcards', JSON.stringify(flashcards));
      localStorage.setItem('flashcards-source', note.title);
      setFlashcardsGenerated(true);
      onFlashcardsGenerated(flashcards);
      toast({
        title: "Flashcards generated!",
        description: `Created ${flashcards.length} flashcards from your notes.`
      });
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        variant: "destructive",
        title: "Error generating flashcards",
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {note.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{note.filename}</Badge>
                <span>•</span>
                <span>{new Date(note.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!flashcardsGenerated && (
                <Button 
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFlashcards}
                  className="flex items-center gap-2"
                >
                  {isGeneratingFlashcards ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              )}
              {flashcardsGenerated && (
                <div className="text-center">
                  <Badge variant="default" className="mb-2">
                    ✅ Flashcards Generated
                  </Badge>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <a href="/flashcards">
                      View Flashcards
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
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
          <Card>
            <Separator />
            <CardContent className="p-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat">
          <NotesChat 
            noteId={note.id || `note-${Date.now()}`}
            noteContent={note.content}
            noteTitle={note.title}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesDisplay;
