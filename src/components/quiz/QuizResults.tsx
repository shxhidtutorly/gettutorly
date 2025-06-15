
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizResultsProps {
  questions: QuizQuestion[];
  userAnswers: number[];
  score: number;
  onRetake: () => void;
  onGoBack: () => void;
}

export const QuizResults = ({ 
  questions, 
  userAnswers, 
  score, 
  onRetake, 
  onGoBack 
}: QuizResultsProps) => {
  const correctAnswers = userAnswers.reduce((count, answer, index) => {
    return count + (answer === questions[index].correct ? 1 : 0);
  }, 0);

  const getScoreMessage = () => {
    if (score >= 80) return { message: "Excellent work!", emoji: "🏆", color: "text-yellow-400" };
    if (score >= 60) return { message: "Good job!", emoji: "👍", color: "text-green-400" };
    return { message: "Keep practicing!", emoji: "💪", color: "text-blue-400" };
  };

  const scoreInfo = getScoreMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Score Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Quiz Complete!
          </CardTitle>
          <div className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {score}%
          </div>
          <p className="text-xl text-gray-300">
            {correctAnswers} out of {questions.length} correct
          </p>
          <p className={`text-xl font-bold ${scoreInfo.color}`}>
            {scoreInfo.message} {scoreInfo.emoji}
          </p>
        </CardHeader>
      </Card>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">Review Your Answers</h3>
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.correct;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${
                isCorrect ? 'border-l-green-500 bg-green-900/20' : 'border-l-red-500 bg-red-900/20'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-gray-300">{question.question}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${
                          optionIndex === question.correct
                            ? 'bg-green-900/30 border-green-500 text-green-200'
                            : optionIndex === userAnswer && !isCorrect
                            ? 'bg-red-900/30 border-red-500 text-red-200'
                            : 'bg-gray-800/50 border-gray-600 text-gray-300'
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                        {optionIndex === question.correct && (
                          <span className="ml-2 text-green-400 font-semibold">✓ Correct</span>
                        )}
                        {optionIndex === userAnswer && !isCorrect && (
                          <span className="ml-2 text-red-400 font-semibold">✗ Your answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col md:flex-row gap-4 justify-center"
      >
        <Button
          onClick={onRetake}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button
          onClick={onGoBack}
          variant="outline"
          className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
};
