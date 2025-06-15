
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Trash2, Clock } from "lucide-react";
import { getQuizzes, deleteQuiz, StoredQuiz } from "@/lib/quizStorage";
import { useToast } from "@/components/ui/use-toast";

interface SavedQuizzesProps {
  onQuizSelect: (quiz: StoredQuiz) => void;
}

export const SavedQuizzes = ({ onQuizSelect }: SavedQuizzesProps) => {
  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    const savedQuizzes = getQuizzes();
    setQuizzes(savedQuizzes);
  };

  const handleDeleteQuiz = (id: string) => {
    deleteQuiz(id);
    setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
    toast({
      title: "Quiz deleted",
      description: "The quiz has been removed from your library."
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (quizzes.length === 0) {
    return (
      <Card className="bg-gray-900/80 border-gray-700">
        <CardContent className="text-center py-8">
          <p className="text-gray-400 mb-4">No saved quizzes yet</p>
          <p className="text-gray-500 text-sm">Create your first quiz or generate one from AI notes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Your Quizzes</h3>
      <div className="grid gap-4">
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900/80 border-gray-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">
                      {quiz.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(quiz.createdAt)}
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {quiz.questions.length} questions
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onQuizSelect(quiz)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-400 hover:bg-red-900/20 hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
