import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { extractTextFromUrl } from "@/lib/jinaReader";
import { extractTextFromFile } from "@/lib/fileExtractor";
import { generateNotesAI, generateFlashcardsAI } from "@/lib/aiNotesService";
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Sparkles, 
  CheckSquare, 
  Square, 
  X, 
  File, 
  PlayCircle,
  MessageCircle,
  Brain,
  FileCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  ArrowRight,
  Check,
  Download,
  RotateCcw,
  Shuffle,
  BookOpen,
  PenTool,
  Settings,
  HelpCircle,
  FlipHorizontal,
  Share2,
  Archive,
  Clock,
  Bookmark,
  Edit3,
  Save,
  Play,
  Pause,
  RefreshCw,
  Confetti
} from "lucide-react";

// Types
interface SessionDoc {
  id: string;
  name: string;
  type: string;
  text: string;
  selected: boolean;
  uploadedAt: Date;
}

interface QuizQuestion { 
  question: string; 
  options: string[]; 
  correct: number;
  explanation?: string;
}

interface FlashCard {
  id: string;
  question: string;
  answer: string;
}

interface StudyTimer {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'study' | 'break';
}

interface StudySession {
  id: string;
  name: string;
  docs: SessionDoc[];
  notes: string;
  summary: string;
  flashcards: FlashCard[];
  quiz: QuizQuestion[];
  createdAt: Date;
  lastModified: Date;
}

type ActiveTab = 'notes' | 'quiz' | 'flashcards' | 'edit' | 'original';

const MultiDocSession: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useUserLanguage();
  const { user } = useAuth();
  const { updateStats } = useUserStats();

  // Core state
  const [docs, setDocs] = useState<SessionDoc[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import options
  const [pastedText, setPastedText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');

  // Content state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [editableNotes, setEditableNotes] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // UI state
  const [selectedDocForView, setSelectedDocForView] = useState<string | null>(null);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Timer state
  const [timer, setTimer] = useState<StudyTimer>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'study'
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedDocs = useMemo(() => docs.filter(d => d.selected), [docs]);
  const combinedText = useMemo(() => 
    selectedDocs.map(d => `# ${d.name}\n\n${d.text}`).join("\n\n---\n\n"), 
    [selectedDocs]
  );

  // Load session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('currentStudySession');
    if (savedSession) {
      try {
        const session: StudySession = JSON.parse(savedSession);
        setCurrentSession(session);
        setDocs(session.docs || []);
        setNotes(session.notes || '');
        setEditableNotes(session.notes || '');
        setSummary(session.summary || '');
        setFlashcards(session.flashcards || []);
        setQuiz(session.quiz || []);
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    }
  }, []);

  // Save session to localStorage
  const saveSession = useCallback(() => {
    if (!currentSession && docs.length === 0) return;
    
    const session: StudySession = {
      id: currentSession?.id || `session-${Date.now()}`,
      name: currentSession?.name || `Study Session ${new Date().toLocaleDateString()}`,
      docs,
      notes,
      summary,
      flashcards,
      quiz,
      createdAt: currentSession?.createdAt || new Date(),
      lastModified: new Date()
    };
    
    setCurrentSession(session);
    localStorage.setItem('currentStudySession', JSON.stringify(session));
  }, [currentSession, docs, notes, summary, flashcards, quiz]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveSession, 30000);
    return () => clearInterval(interval);
  }, [saveSession]);

  // Timer logic
  useEffect(() => {
    if (timer.isRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds === 0 && prev.minutes === 0) {
            // Timer finished
            const newMode = prev.mode === 'study' ? 'break' : 'study';
            const newMinutes = newMode === 'study' ? 25 : 5;
            return { 
              minutes: newMinutes, 
              seconds: 0, 
              isRunning: false, 
              mode: newMode 
            };
          }
          
          if (prev.seconds === 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          }
          
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer.isRunning]);

  // Helper functions
  const addDocs = (newOnes: SessionDoc[]) => {
    setDocs(prev => [...newOnes, ...prev]);
    if (newOnes.length > 0) {
      setActiveTab('notes');
    }
  };
  
  const toggleDoc = (id: string) => setDocs(prev => 
    prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d)
  );
  
  const selectAll = (checked: boolean) => setDocs(prev => 
    prev.map(d => ({ ...d, selected: checked }))
  );
  
  const removeDoc = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

  // File handlers
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    setProgress(10);
    setIsLoading(true);
    try {
      const results: SessionDoc[] = [];
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        try {
          const res = await extractTextFromFile(f);
          results.push({ 
            id: `${Date.now()}-${i}-${f.name}`, 
            name: f.name, 
            type: res.fileType, 
            text: res.text, 
            selected: true,
            uploadedAt: new Date()
          });
        } catch (error) {
          console.error(`Failed to process ${f.name}:`, error);
          // Add with placeholder text on error
          results.push({ 
            id: `${Date.now()}-${i}-${f.name}`, 
            name: f.name, 
            type: f.type || 'unknown', 
            text: `Failed to extract text from ${f.name}. Please try again.`, 
            selected: false,
            uploadedAt: new Date()
          });
        }
        setProgress(10 + Math.round(((i + 1) / arr.length) * 50));
      }
      addDocs(results);
      updateStats('documentsUploaded', results.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  // Import functions
  const addPastedText = () => {
    if (!pastedText.trim()) return;
    const id = `${Date.now()}-paste`;
    addDocs([{ 
      id, 
      name: `Pasted Text ${new Date().toLocaleTimeString()}`, 
      type: 'text', 
      text: pastedText.trim(), 
      selected: true,
      uploadedAt: new Date()
    }]);
    setPastedText("");
  };

  const addLink = async () => {
    if (!/^https?:\/\//i.test(linkUrl)) return;
    setIsLoading(true); 
    setProgress(20);
    try {
      const res = await extractTextFromUrl(linkUrl);
      if (res.success && res.content) {
        const id = `${Date.now()}-url`;
        addDocs([{ 
          id, 
          name: res.title || linkUrl, 
          type: 'html', 
          text: res.content, 
          selected: true,
          uploadedAt: new Date()
        }]);
      }
    } catch (e) {
      console.error('Failed to import from link:', e);
    } finally {
      setIsLoading(false); 
      setProgress(0); 
      setLinkUrl("");
    }
  };

  // AI Generation functions
  const generateNotes = async () => {
    if (!combinedText.trim()) return;
    setIsLoading(true);
    setProgress(60);
    
    try {
      const prompt = `Create comprehensive, well-structured study notes from the following content. Format with clear headers, bullet points, and key concepts highlighted:

# STUDY NOTES

## Key Concepts
[Extract main concepts with clear definitions]

## Important Details
[Organize important facts and details]

## Summary Points
[Provide concise summary points for review]

## Study Tips
[Add relevant study tips and mnemonics if applicable]

Content to analyze:
${combinedText}`;

      const note = await generateNotesAI(prompt, 'Multi-Document Study Notes');
      setNotes(note.content);
      setEditableNotes(note.content);
      setActiveTab('notes');
      updateStats('notesGenerated', 1);
    } catch (e) {
      console.error('Failed to generate notes:', e);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const generateFlashcards = async (count: number = 10) => {
    if (!combinedText.trim()) return;
    setIsLoading(true);
    setProgress(60);
    
    try {
      const cards = await generateFlashcardsAI(combinedText);
      const formattedCards = cards.slice(0, count).map((card, i) => ({
        id: `flashcard-${Date.now()}-${i}`,
        question: card.question || card.front || 'Question',
        answer: card.answer || card.back || 'Answer'
      }));
      setFlashcards(formattedCards);
      setActiveTab('flashcards');
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
      updateStats('flashcardsGenerated', formattedCards.length);
    } catch (e) {
      console.error('Failed to generate flashcards:', e);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const generateQuiz = async () => {
    if (!combinedText.trim()) return;
    setIsLoading(true);
    setProgress(60);
    
    try {
      const prompt = `Create a comprehensive multiple-choice quiz from this study material. Generate exactly 10 questions with 4 options each. Return valid JSON only:

{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Study Material:
${combinedText}`;

      // Mock API call - replace with your actual API
      const response = await new Promise<{ questions: QuizQuestion[] }>((resolve) => {
        setTimeout(() => {
          resolve({
            questions: [
              {
                question: "What is the main concept discussed in the material?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct: 1,
                explanation: "This is the correct answer because..."
              }
            ]
          });
        }, 2000);
      });

      setQuiz(response.questions);
      setQuizIndex(0);
      setQuizAnswers(new Array(response.questions.length).fill(-1));
      setQuizCompleted(false);
      setQuizScore(0);
      setActiveTab('quiz');
      updateStats('quizzesGenerated', 1);
    } catch (e) {
      console.error('Failed to generate quiz:', e);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Quiz functions
  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[quizIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      // Quiz completed
      const score = quizAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quiz[index].correct ? 1 : 0);
      }, 0);
      setQuizScore(score);
      setQuizCompleted(true);
      updateStats('quizzesCompleted', 1);
    }
  };

  const prevQuestion = () => {
    if (quizIndex > 0) {
      setQuizIndex(quizIndex - 1);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers(new Array(quiz.length).fill(-1));
    setQuizCompleted(false);
    setQuizScore(0);
  };

  // Flashcard functions
  const nextFlashcard = () => {
    setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevFlashcard = () => {
    setCurrentFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Timer functions
  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimer({
      minutes: timer.mode === 'study' ? 25 : 5,
      seconds: 0,
      isRunning: false,
      mode: timer.mode
    });
  };

  // Download functions
  const downloadContent = (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadNotes = () => downloadContent(notes, 'study-notes.md', 'text/markdown');
  const downloadFlashcards = () => {
    const content = flashcards.map(card => `Q: ${card.question}\nA: ${card.answer}\n---`).join('\n');
    downloadContent(content, 'flashcards.txt');
  };

  // Edit functions
  const saveEditedNotes = () => {
    setNotes(editableNotes);
    setIsEditingNotes(false);
    saveSession();
  };

  const startNewSession = () => {
    if (window.confirm(t('Are you sure you want to start a new session? Current progress will be saved.'))) {
      saveSession();
      setDocs([]);
      setNotes('');
      setEditableNotes('');
      setSummary('');
      setFlashcards([]);
      setQuiz([]);
      setCurrentSession(null);
      setActiveTab('notes');
      localStorage.removeItem('currentStudySession');
    }
  };

  const hasSelectedDocs = selectedDocs.length > 0;
  const currentFlashcard = flashcards[currentFlashcardIndex];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white px-4 py-2 font-bold text-xl rounded-lg">
                StudyAI
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('Multi-Document Study Session')}
                </h1>
                <p className="text-sm text-gray-600">
                  {docs.length > 0 ? `${docs.length} documents • ${selectedDocs.length} selected` : t('Upload documents to start')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowChat(!showChat)}
                variant={showChat ? "default" : "outline"}
                className="font-medium"
              >
                <MessageCircle size={16} className="mr-2" />
                {t('AI Tutor')}
              </Button>
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="outline"
                className="font-medium"
              >
                <Settings size={16} className="mr-2" />
                {showSidebar ? t('Hide Tools') : t('Show Tools')}
              </Button>
              <Button
                onClick={startNewSession}
                variant="outline"
                className="font-medium"
              >
                <RefreshCw size={16} className="mr-2" />
                {t('New Session')}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {progress > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-700 font-medium">{t('Processing...')}</span>
                    <span className="text-blue-600 font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'notes' as ActiveTab, label: t('AI Notes'), icon: BookOpen },
              { id: 'quiz' as ActiveTab, label: t('Quiz'), icon: CheckSquare },
              { id: 'flashcards' as ActiveTab, label: t('Flashcards'), icon: Brain },
              { id: 'edit' as ActiveTab, label: t('Edit'), icon: Edit3 },
              { id: 'original' as ActiveTab, label: t('Original'), icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 space-y-6"
              >
                {/* Upload Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">{t('Import Content')}</h3>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Upload size={16} className="mr-2" />
                      {t('Upload Files')}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button onClick={addLink} disabled={!linkUrl.trim()}>
                        <LinkIcon size={16} />
                      </Button>
                    </div>

                    <Textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={t('Paste text here...')}
                      rows={4}
                    />
                    <Button
                      onClick={addPastedText}
                      disabled={!pastedText.trim()}
                      variant="outline"
                      className="w-full"
                    >
                      {t('Add Text')}
                    </Button>
                  </div>

                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    accept=".pdf,.docx,.txt,.md,.html" 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleFiles(e.target.files)} 
                  />
                </div>

                {/* Documents List */}
                {docs.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-900">
                        {t('Documents')} ({docs.length})
                      </h3>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => selectAll(true)} variant="outline">
                          {t('All')}
                        </Button>
                        <Button size="sm" onClick={() => selectAll(false)} variant="outline">
                          {t('None')}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${doc.selected 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => toggleDoc(doc.id)}
                        >
                          <div className="text-blue-600">
                            {doc.selected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <File size={14} className="text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500 uppercase">{doc.type}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocForView(selectedDocForView === doc.id ? null : doc.id);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeDoc(doc.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">{t('AI Tools')}</h3>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={generateNotes}
                      disabled={isLoading || !hasSelectedDocs}
                      className="w-full justify-start"
                    >
                      <Sparkles size={16} className="mr-2" />
                      {t('Generate Notes')}
                    </Button>
                    <Button
                      onClick={() => generateFlashcards(10)}
                      disabled={isLoading || !hasSelectedDocs}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Brain size={16} className="mr-2" />
                      {t('Create Flashcards')}
                    </Button>
                    <Button
                      onClick={generateQuiz}
                      disabled={isLoading || !hasSelectedDocs}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <CheckSquare size={16} className="mr-2" />
                      {t('Generate Quiz')}
                    </Button>
                  </div>
                </div>

                {/* Study Timer */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    {t('Study Timer')} 
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({timer.mode === 'study' ? t('Study') : t('Break')})
                    </span>
                  </h3>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-4 font-mono">
                      {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={timer.isRunning ? pauseTimer : startTimer}
                        className="flex-1"
                        variant={timer.isRunning ? "outline" : "default"}
                      >
                        {timer.isRunning ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      <Button
                        onClick={resetTimer}
                        variant="outline"
                        size="sm"
                      >
                        <RotateCcw size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg border border-gray-200 p-6 min-h-[600px]"
              >
                {/* AI Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen size={28} className="text-blue-600" />
                        {t('AI Study Notes')}
                      </h2>
                      {notes && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setIsEditingNotes(!isEditingNotes);
                              setEditableNotes(notes);
                            }}
                            variant="outline"
                          >
                            <Edit3 className="mr-2" size={16} />
                            {t('Edit')}
                          </Button>
                          <Button onClick={downloadNotes}>
                            <Download className="mr-2" size={16} />
                            {t('Download')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {notes ? (
                      <div className="prose prose-gray max-w-none">
                        {isEditingNotes ? (
                          <div className="space-y-4">
                            <Textarea
                              value={editableNotes}
                              onChange={(e) => setEditableNotes(e.target.value)}
                              className="min-h-96 font-mono"
                            />
                            <div className="flex gap-2">
                              <Button onClick={saveEditedNotes}>
                                <Save className="mr-2" size={16} />
                                {t('Save Changes')}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingNotes(false)}
                              >
                                {t('Cancel')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap font-sans leading-relaxed text-gray-800">
                              {notes}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <PenTool className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('No Notes Generated')}</h3>
                        <p className="text-gray-600 mb-6">{t('Select documents and generate AI-powered study notes')}</p>
                        <Button
                          onClick={generateNotes}
                          disabled={!hasSelectedDocs || isLoading}
                          size="lg"
                        >
                          <Sparkles className="mr-2" size={20} />
                          {t('Generate Notes')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === 'quiz' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <CheckSquare size={28} className="text-purple-600" />
                        {t('Interactive Quiz')}
                      </h2>
                      {quiz.length > 0 && !quizCompleted && (
                        <div className="flex gap-2">
                          <Button onClick={resetQuiz} variant="outline">
                            <RotateCcw className="mr-2" size={16} />
                            {t('Reset')}
                          </Button>
                          <Button
                            onClick={() => {
                              const shuffled = [...quiz].sort(() => Math.random() - 0.5);
                              setQuiz(shuffled);
                              resetQuiz();
                            }}
                            variant="outline"
                          >
                            <Shuffle className="mr-2" size={16} />
                            {t('Shuffle')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {quizCompleted ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-16 h-16 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{t('Quiz Completed!')}</h3>
                        <p className="text-xl text-gray-600 mb-6">
                          {t('Your score')}: {quizScore}/{quiz.length} ({Math.round((quizScore/quiz.length)*100)}%)
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button onClick={resetQuiz} size="lg">
                            <RotateCcw className="mr-2" size={20} />
                            {t('Try Again')}
                          </Button>
                          <Button onClick={generateQuiz} variant="outline" size="lg">
                            <Sparkles className="mr-2" size={20} />
                            {t('New Quiz')}
                          </Button>
                        </div>
                      </motion.div>
                    ) : quiz.length > 0 ? (
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <span className="font-bold text-lg text-purple-600">
                              {t('Question')} {quizIndex + 1} {t('of')} {quiz.length}
                            </span>
                            <div className="flex gap-1">
                              {quiz.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-4 h-4 rounded-full ${
                                    index === quizIndex ? 'bg-purple-500' : 
                                    quizAnswers[index] !== -1 ? 'bg-green-400' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                              {quiz[quizIndex]?.question}
                            </h3>

                            <div className="space-y-3">
                              {quiz[quizIndex]?.options.map((option, optionIndex) => (
                                <motion.button
                                  key={optionIndex}
                                  onClick={() => selectAnswer(optionIndex)}
                                  className={`
                                    w-full p-4 text-left border-2 rounded-lg font-medium transition-all
                                    ${quizAnswers[quizIndex] === optionIndex
                                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                  `}
                                  whileHover={{ x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-bold mr-4">
                                    {String.fromCharCode(65 + optionIndex)}
                                  </span>
                                  {option}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            onClick={prevQuestion}
                            disabled={quizIndex === 0}
                            variant="outline"
                          >
                            <ChevronLeft size={16} className="mr-2" />
                            {t('Previous')}
                          </Button>

                          <div className="text-center">
                            <div className="text-sm text-gray-600">
                              {quizAnswers.filter(a => a !== -1).length} / {quiz.length} {t('answered')}
                            </div>
                          </div>

                          <Button
                            onClick={nextQuestion}
                            disabled={quizAnswers[quizIndex] === -1}
                          >
                            {quizIndex === quiz.length - 1 ? t('Finish') : t('Next')}
                            <ChevronRight size={16} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <HelpCircle className="w-12 h-12 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('No Quiz Available')}</h3>
                        <p className="text-gray-600 mb-6">{t('Generate quiz questions from your documents')}</p>
                        <Button
                          onClick={generateQuiz}
                          disabled={!hasSelectedDocs || isLoading}
                          size="lg"
                        >
                          <CheckSquare className="mr-2" size={20} />
                          {t('Generate Quiz')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Brain size={28} className="text-pink-600" />
                        {t('Flashcards')}
                      </h2>
                      {flashcards.length > 0 && (
                        <div className="flex gap-2">
                          <Button onClick={downloadFlashcards} variant="outline">
                            <Download className="mr-2" size={16} />
                            {t('Download')}
                          </Button>
                          <Button
                            onClick={() => {
                              setCurrentFlashcardIndex(0);
                              setIsFlipped(false);
                            }}
                            variant="outline"
                          >
                            <RotateCcw className="mr-2" size={16} />
                            {t('Restart')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {flashcards.length > 0 && currentFlashcard ? (
                      <div className="space-y-8">
                        <div className="flex justify-center">
                          <div className="relative w-full max-w-2xl h-80">
                            <motion.div
                              className="w-full h-full cursor-pointer"
                              onClick={flipCard}
                              animate={{ rotateY: isFlipped ? 180 : 0 }}
                              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              {/* Front - Question */}
                              <div 
                                className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-8 flex flex-col justify-center shadow-lg"
                                style={{ backfaceVisibility: 'hidden' }}
                              >
                                <div className="text-center">
                                  <div className="bg-white text-pink-600 px-4 py-2 font-bold text-sm mb-6 inline-block rounded-lg">
                                    {t('QUESTION')}
                                  </div>
                                  <p className="font-semibold text-xl leading-tight mb-8">{currentFlashcard.question}</p>
                                  <div className="flex items-center justify-center gap-2 text-sm font-medium opacity-80">
                                    <FlipHorizontal size={16} />
                                    {t('Click to reveal answer')}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Back - Answer */}
                              <div 
                                className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-8 flex flex-col justify-center shadow-lg"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                              >
                                <div className="text-center">
                                  <div className="bg-white text-green-600 px-4 py-2 font-bold text-sm mb-6 inline-block rounded-lg">
                                    {t('ANSWER')}
                                  </div>
                                  <p className="font-semibold text-xl leading-tight mb-8">{currentFlashcard.answer}</p>
                                  <div className="flex items-center justify-center gap-2 text-sm font-medium opacity-80">
                                    <FlipHorizontal size={16} />
                                    {t('Click to show question')}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button onClick={prevFlashcard} variant="outline" size="lg">
                            <ChevronLeft size={20} className="mr-2" />
                            {t('Previous')}
                          </Button>

                          <div className="text-center">
                            <div className="text-xl font-bold mb-2">
                              {currentFlashcardIndex + 1} / {flashcards.length}
                            </div>
                            <div className="flex gap-1 justify-center">
                              {flashcards.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === currentFlashcardIndex ? 'bg-pink-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <Button onClick={nextFlashcard} variant="outline" size="lg">
                            {t('Next')}
                            <ChevronRight size={20} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                          <Bookmark className="w-12 h-12 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('No Flashcards Created')}</h3>
                        <p className="text-gray-600 mb-6">{t('Generate flashcards from your study materials')}</p>
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={() => generateFlashcards(5)}
                            disabled={!hasSelectedDocs || isLoading}
                            variant="outline"
                          >
                            <Brain className="mr-2" size={16} />
                            {t('5 Cards')}
                          </Button>
                          <Button
                            onClick={() => generateFlashcards(10)}
                            disabled={!hasSelectedDocs || isLoading}
                          >
                            <Brain className="mr-2" size={16} />
                            {t('10 Cards')}
                          </Button>
                          <Button
                            onClick={() => generateFlashcards(20)}
                            disabled={!hasSelectedDocs || isLoading}
                            variant="outline"
                          >
                            <Brain className="mr-2" size={16} />
                            {t('20 Cards')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Tab */}
                {activeTab === 'edit' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Edit3 size={28} className="text-orange-600" />
                        {t('Edit Content')}
                      </h2>
                    </div>

                    {docs.length > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 font-medium mb-2">{t('Select a document to edit:')}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {docs.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => setSelectedDocForEdit(doc.id)}
                                className={`
                                  flex items-center gap-3 p-3 rounded-lg text-left transition-all
                                  ${selectedDocForEdit === doc.id
                                    ? 'bg-blue-200 border-2 border-blue-500'
                                    : 'bg-white border-2 border-gray-200 hover:border-blue-300'
                                  }
                                `}
                              >
                                <File size={16} className="text-blue-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{doc.name}</p>
                                  <p className="text-xs text-gray-500">{doc.type}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {selectedDocForEdit && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">
                                {t('Editing')}: {docs.find(d => d.id === selectedDocForEdit)?.name}
                              </h3>
                              <Button
                                onClick={() => {
                                  const doc = docs.find(d => d.id === selectedDocForEdit);
                                  if (doc) {
                                    const updatedDoc = { ...doc, text: editableNotes };
                                    setDocs(prev => prev.map(d => d.id === selectedDocForEdit ? updatedDoc : d));
                                    saveSession();
                                  }
                                }}
                              >
                                <Save className="mr-2" size={16} />
                                {t('Save Changes')}
                              </Button>
                            </div>
                            <Textarea
                              value={docs.find(d => d.id === selectedDocForEdit)?.text || ''}
                              onChange={(e) => {
                                setDocs(prev => prev.map(d => 
                                  d.id === selectedDocForEdit 
                                    ? { ...d, text: e.target.value }
                                    : d
                                ));
                              }}
                              className="min-h-96 font-mono"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <Edit3 className="w-12 h-12 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('No Documents to Edit')}</h3>
                        <p className="text-gray-600 mb-6">{t('Upload documents first to enable editing')}</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          size="lg"
                        >
                          <Upload className="mr-2" size={20} />
                          {t('Upload Documents')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Original Content Tab */}
                {activeTab === 'original' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText size={28} className="text-green-600" />
                        {t('Original Content')}
                      </h2>
                    </div>

                    {docs.length > 0 ? (
                      <div className="space-y-4">
                        {docs.map((doc) => (
                          <div key={doc.id} className="border border-gray-200 rounded-lg">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                              onClick={() => setSelectedDocForView(selectedDocForView === doc.id ? null : doc.id)}
                            >
                              <div className="flex items-center gap-3">
                                <File size={16} className="text-green-600" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-gray-500">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.selected && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {t('Selected')}
                                  </span>
                                )}
                                <ChevronRight 
                                  size={16} 
                                  className={`transform transition-transform ${
                                    selectedDocForView === doc.id ? 'rotate-90' : ''
                                  }`} 
                                />
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {selectedDocForView === doc.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-gray-200"
                                >
                                  <div className="p-4 bg-gray-50">
                                    <div className="max-h-64 overflow-y-auto">
                                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                        {doc.text}
                                      </pre>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                          <FileCheck className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('No Documents Uploaded')}</h3>
                        <p className="text-gray-600 mb-6">{t('Upload documents to view their original content')}</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          size="lg"
                        >
                          <Upload className="mr-2" size={20} />
                          {t('Upload Documents')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Chat Sidebar */}
          <AnimatePresence>
            {showChat && (
              <motion.aside
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{t('AI Tutor')}</h3>
                        <p className="text-sm text-gray-600">{t('Ask questions')}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowChat(false)}
                      variant="ghost"
                      size="sm"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <ChatBox contextText={combinedText} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <div className="bg-white rounded-xl p-12 text-center shadow-2xl">
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('Drop Files Here')}</h3>
              <p className="text-gray-600">{t('Release to upload documents')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Chat Box Component
const ChatBox: React.FC<{ contextText: string }> = ({ contextText }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<{ role: 'user'|'assistant'; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ask = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages(m => [...m, { role: 'user', content: q }]);
    setInput("");
    setLoading(true);
    
    try {
      // Mock AI response for demonstration - replace with your actual API
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          if (contextText.trim()) {
            resolve(`Based on your study materials, here's what I found: ${q.includes('fragment') ? 'Android Fragments are modular sections of an activity that have their own lifecycle.' : 'I can help you understand this topic better. Could you be more specific about what you\'d like to know?'}`);
          } else {
            resolve("Please upload and select some documents first so I can help you with your studies.");
          }
        }, 1000);
      });
      
      setMessages(m => [...m, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: t('Error fetching answer.') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  const suggestedQuestions = [
    t('What are the main topics?'),
    t('Explain key concepts'),
    t('Create a study plan'),
    t('Summarize important points')
  ];

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && !contextText ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-500 mb-4">{t('No Documents Selected')}</p>
            <p className="text-xs text-gray-400">{t('Upload and select documents to chat')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-3">
            <p className="font-medium text-cyan-600 text-center mb-4">{t('Suggested Questions')}</p>
            {suggestedQuestions.map((question, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setInput(question)}
                className="block w-full text-left bg-gray-50 border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 px-3 py-3 rounded-lg text-sm transition-all"
              >
                💡 {question}
              </motion.button>
            ))}
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-4 rounded-lg text-sm
                ${message.role === 'user' 
                  ? 'bg-cyan-500 text-white ml-8' 
                  : 'bg-gray-100 text-gray-800 mr-8'
                }
              `}
            >
              <div className={`text-xs font-medium mb-1 ${
                message.role === 'user' ? 'text-cyan-100' : 'text-gray-500'
              }`}>
                {message.role === 'user' ? t('You') : t('AI Tutor')}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </motion.div>
          ))
        )}
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-100 text-gray-800 p-4 rounded-lg mr-8"
          >
            <div className="text-xs font-medium text-gray-500 mb-1">{t('AI Tutor')}</div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm">{t('Thinking...')}</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('Ask AI assistant...')}
          className="flex-1"
          disabled={loading || !contextText}
        />
        <Button
          onClick={ask}
          disabled={loading || !input.trim() || !contextText}
          size="sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight size={16} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MultiDocSession;
