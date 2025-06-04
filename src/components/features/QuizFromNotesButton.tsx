
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface QuizFromNotesButtonProps {
  notesContent: string;
  notesTitle: string;
}

export const QuizFromNotesButton = ({ notesContent, notesTitle }: QuizFromNotesButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateQuiz = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a 10-question multiple choice quiz based on these study notes. Format as JSON with this structure: {"questions": [{"question": "text", "options": ["A", "B", "C", "D"], "correct": 0}]}. Here are the notes: ${notesContent}`,
          model: 'groq'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      // Try to parse the quiz JSON from the response
      let quizData;
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          quizData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid quiz format');
        }
      } catch (parseError) {
        throw new Error('Failed to parse quiz data');
      }

      // Store quiz in localStorage for the quiz page
      localStorage.setItem('generatedQuiz', JSON.stringify({
        title: `Quiz: ${notesTitle}`,
        questions: quizData.questions,
        source: 'notes',
        timestamp: new Date().toISOString()
      }));

      toast({
        title: "Quiz generated!",
        description: "Redirecting to quiz page..."
      });

      // Navigate to quiz page
      navigate('/quiz?source=generated');
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: "destructive",
        title: "Failed to generate quiz",
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateQuiz}
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating Quiz...' : 'Generate AI Quiz'}
    </Button>
  );
};
