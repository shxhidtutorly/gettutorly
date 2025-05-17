
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, ListChecks, X, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface CreateQuizDialogProps {
  onSave: (quizName: string, questions: QuizQuestion[]) => void;
  trigger?: React.ReactNode;
}

const CreateQuizDialog = ({ onSave, trigger }: CreateQuizDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }
  ]);
  const { toast } = useToast();

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove question",
        description: "A quiz must have at least one question",
        variant: "destructive"
      });
    }
  };

  const handleQuestionChange = (index: number, question: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = question;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quiz name
    if (!quizName.trim()) {
      toast({
        title: "Quiz name required",
        description: "Please enter a name for your quiz",
        variant: "destructive"
      });
      return;
    }

    // Check if questions are complete
    const incompleteQuestions = questions.filter(q => 
      !q.question.trim() || q.options.some(opt => !opt.trim())
    );
    
    if (incompleteQuestions.length > 0) {
      toast({
        title: "Incomplete questions",
        description: "Please complete all questions and options",
        variant: "destructive"
      });
      return;
    }

    // Save the quiz
    onSave(quizName, questions);
    
    // Reset form
    setQuizName("");
    setQuestions([{
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }]);
    setIsOpen(false);
    
    toast({
      title: "Quiz created",
      description: `Created ${questions.length} questions in "${quizName}"`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="spark-button-primary button-click-effect">
            <Plus className="mr-2 h-4 w-4" /> Create New Quiz
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-spark-primary" />
            Create New Quiz
          </DialogTitle>
          <DialogDescription>
            Create a quiz with multiple-choice questions
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="quizName">Quiz Name</Label>
            <Input
              id="quizName"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="e.g., Biology 101 Quiz"
              className="w-full"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Questions</h4>
              <span className="text-sm text-muted-foreground">{questions.length} questions</span>
            </div>
            
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Question {qIndex + 1}</h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemoveQuestion(qIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`question-${qIndex}`}>Question</Label>
                  <Textarea
                    id={`question-${qIndex}`}
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    placeholder="Enter your question here"
                    className="w-full min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Options (select the correct answer)</Label>
                  <RadioGroup value={question.correctAnswer.toString()} onValueChange={(v) => handleCorrectAnswerChange(qIndex, parseInt(v))}>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2 bg-white p-2 rounded-md border my-2">
                        <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                        <div className="flex-1">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="border-0 focus-visible:ring-0"
                          />
                        </div>
                        {question.correctAnswer === oIndex && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={handleAddQuestion}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Quiz</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialog;
