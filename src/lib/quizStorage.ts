
export interface StoredQuiz {
  id: string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
  createdAt: string;
}

const STORAGE_KEY = 'tutorly_user_quizzes';

export const saveQuiz = (quiz: Omit<StoredQuiz, 'id' | 'createdAt'>) => {
  const newQuiz: StoredQuiz = {
    ...quiz,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };

  const existingQuizzes = getQuizzes();
  const updatedQuizzes = [...existingQuizzes, newQuiz];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuizzes));
  return newQuiz;
};

export const getQuizzes = (): StoredQuiz[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading quizzes from localStorage:', error);
    return [];
  }
};

export const deleteQuiz = (id: string) => {
  const existingQuizzes = getQuizzes();
  const updatedQuizzes = existingQuizzes.filter(quiz => quiz.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuizzes));
};

export const getQuizById = (id: string): StoredQuiz | null => {
  const quizzes = getQuizzes();
  return quizzes.find(quiz => quiz.id === id) || null;
};
