import { useState } from "react";

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

  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = parseInt(value);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    if (!quizName.trim()) {
      alert("Please enter a quiz name");
      return;
    }

    const incompleteQuestions = questions.filter(q => 
      !q.question.trim() || q.options.some(opt => !opt.trim())
    );
    
    if (incompleteQuestions.length > 0) {
      alert("Please complete all questions and options");
      return;
    }

    onSave(quizName, questions);
    
    setQuizName("");
    setQuestions([{
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
      >
        <span className="text-lg">+</span> Create New Quiz
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-blue-600">📝</span>
            Create New Quiz
          </h2>
          <p className="text-gray-600 mt-1">Create a quiz with multiple-choice questions</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Quiz Name</label>
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="e.g., Biology 101 Quiz"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Questions</h4>
              <span className="text-sm text-gray-500">{questions.length} questions</span>
            </div>
            
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Question {qIndex + 1}</h5>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={() => handleRemoveQuestion(qIndex)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Question</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    placeholder="Enter your question here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Options (select the correct answer)</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                      <input
                        type="radio"
                        name={`correct-answer-${qIndex}`}
                        value={oIndex}
                        checked={question.correctAnswer === oIndex}
                        onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 px-2 py-1 border-0 focus:outline-none"
                      />
                      {question.correctAnswer === oIndex && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-300 rounded-md py-3 text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
              onClick={handleAddQuestion}
            >
              <span className="text-lg">+</span>
              Add Question
            </button>
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Create Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizDialog;
