import React, { useState, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Download, Book, BookText } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateFlashcardDialog } from "@/components/flashcards/CreateFlashcardDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function DownloadNotesButton({ content, filename }: { content: string, filename: string }) {
  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <Button onClick={downloadFile} variant="secondary">
      <Download className="mr-2 h-4 w-4" />
      Download Notes
    </Button>
  );
}

interface QuizFromNotesButtonProps {
  notesContent: string;
  notesTitle: string;
}

function QuizFromNotesButton({ notesContent, notesTitle }: QuizFromNotesButtonProps) {
  const navigate = useNavigate();

  const handleGenerateQuiz = () => {
    // Navigate to the quiz generation page and pass the notes content and title as state
    navigate('/quiz-generator', { state: { notesContent, notesTitle } });
  };

  return (
    <Button onClick={handleGenerateQuiz} variant="secondary">
      <BookText className="mr-2 h-4 w-4" />
      Generate Quiz
    </Button>
  );
}

const AINotesGenerator = () => {
  const [text, setText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast()
  const { currentUser } = useAuth();

  const generateSummary = useCallback(async () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to generate notes",
      })
      return;
    }

    if (text.length === 0) {
      toast({
        title: "Please add some text",
        description: "You must add some text to generate notes",
      })
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.gpteng.co/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Could not generate summary:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
      })
    } finally {
      setLoading(false);
    }
  }, [text, toast, currentUser]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>AI Notes Generator</CardTitle>
          <CardDescription>Paste your text below to generate notes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              placeholder="Paste your text here."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button onClick={generateSummary} disabled={loading}>
            {loading ? "Loading..." : "Generate Notes"}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Generated Notes</CardTitle>
              <CardDescription>Here are your generated notes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Generated summary will appear here."
                  value={summary}
                  readOnly
                />
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <DownloadNotesButton 
                  content={summary}
                  filename={`notes-${Date.now()}.md`}
                />
                
                <QuizFromNotesButton 
                  notesContent={summary}
                  notesTitle="AI Generated Notes"
                />
                
                <CreateFlashcardDialog
                  onCreateFlashcard={(flashcard) => {
                    const newFlashcard = {
                      id: Date.now().toString(),
                      question: flashcard.question,
                      answer: flashcard.answer,
                    };
                    // Handle flashcard creation
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AINotesGenerator;
