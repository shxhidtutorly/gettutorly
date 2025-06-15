
import { motion } from "framer-motion";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number[];
}

export const QuizProgress = ({ 
  currentQuestion, 
  totalQuestions, 
  answeredQuestions 
}: QuizProgressProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2 text-gray-300">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Question Navigator */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            className={`h-8 w-8 rounded flex items-center justify-center text-xs font-bold transition-all ${
              index === currentQuestion
                ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                : answeredQuestions.includes(index)
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {index + 1}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
