
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

interface QuizCardProps {
  question: string;
  options: string[];
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  questionNumber: number;
  totalQuestions: number;
  showFeedback?: boolean;
  correctAnswer?: number;
}

export const QuizCard = ({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions,
  showFeedback = false,
  correctAnswer
}: QuizCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="text-sm text-gray-400">
              {Math.round((questionNumber / totalQuestions) * 100)}%
            </div>
          </div>
          <CardTitle className="text-xl text-white leading-relaxed">
            {question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {options.map((option, index) => {
            let buttonStyle = "bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/70";
            
            if (showFeedback) {
              if (index === correctAnswer) {
                buttonStyle = "bg-green-900/50 border-green-500 text-green-200";
              } else if (index === selectedAnswer && index !== correctAnswer) {
                buttonStyle = "bg-red-900/50 border-red-500 text-red-200";
              }
            } else if (selectedAnswer === index) {
              buttonStyle = "bg-purple-700/60 border-purple-500 text-purple-100 ring-2 ring-purple-400";
            }

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => onAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 h-auto text-left justify-start transition-all ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      {selectedAnswer === index ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold mr-2 text-gray-400">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};
