import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
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
  Bookmark
} from "lucide-react";

// Local types
interface SessionDoc {
  id: string;
  name: string;
  type: string;
  text: string;
  selected: boolean;
}

interface QuizQuestion { 
  question: string; 
  options: string[]; 
  correct: number 
}

interface FlashCard {
  id: string;
  question: string;
  answer: string;
}

type ActiveTab = 'note' | 'quiz' | 'flashcards' | 'transcript';

const MultiDocSession: React.FC = () => {
  // Documents state
  const [docs, setDocs] = useState<SessionDoc[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import options
  const [pastedText, setPastedText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('note');

  // Center output state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // View state
  const [selectedDocForView, setSelectedDocForView] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const selectedDocs = useMemo(() => docs.filter(d => d.selected), [docs]);
  const combinedText = useMemo(() => selectedDocs.map(d => `# ${d.name}\n\n${d.text}`).join("\n\n---\n\n"), [selectedDocs]);

  // Mock data for demonstration
  useEffect(() => {
    if (docs.length === 0) {
      // Add sample document
      const sampleDoc: SessionDoc = {
        id: 'sample-1',
        name: 'Detailed Overview of Mobile Technologies and Android Applications',
        type: 'PDF',
        text: `UNIT 1: INTRODUCTION

5.1 History of Mobile Technology
Mobile technology has evolved significantly since the introduction of the first mobile phone in 1973. The journey from analog to digital, from voice-only to multimedia-rich smartphones, represents one of the most remarkable technological transformations in human history.

Key Milestones:
- 1973: First handheld mobile phone by Motorola
- 1991: First GSM network launched
- 2007: Introduction of the iPhone
- 2008: Android OS release
- Present: 5G networks and IoT integration

Android Fundamentals:
An Android Fragment is a reusable component that represents a portion of the user interface in an Activity. Fragments have their own lifecycle and can be added or removed while the activity is running. They are essential for creating flexible UI designs that work across different screen sizes.

Key Features of Fragments:
- Independent lifecycle management
- Reusable across multiple activities
- Dynamic addition and removal
- Communication with parent activities
- Support for different screen configurations

Application Components:
Android applications consist of four main components:
1. Activities - Single screen with user interface
2. Services - Background operations without UI
3. Broadcast Receivers - Respond to system-wide announcements
4. Content Providers - Manage shared application data

The Android Activity lifecycle includes several states: Created, Started, Resumed, Paused, Stopped, and Destroyed. Understanding these states is crucial for proper resource management and user experience.`,
        selected: true
      };
      
      setDocs([sampleDoc]);
      
      // Generate sample content
      setSummary(`This comprehensive guide covers mobile technology evolution from 1973 to present, focusing on Android development fundamentals including Fragments, Activities, and application components with their lifecycles.`);
      
      setNotes(`# Mobile Technology & Android Development Notes

## Key Concepts:
• **Fragments**: Reusable UI components with independent lifecycles
• **Activities**: Single screens representing user interfaces
• **Application Components**: Activities, Services, Broadcast Receivers, Content Providers

## Timeline:
- 1973: First mobile phone (Motorola)
- 2007: iPhone launch
- 2008: Android OS debut
- Present: 5G & IoT integration

## Fragment Lifecycle:
1. Created → Started → Resumed
2. Paused → Stopped → Destroyed

## Best Practices:
- Proper resource management during lifecycle transitions
- Fragment communication through parent activities
- Design for multiple screen configurations`);

      setFlashcards([
        { id: '1', question: 'What is a Fragment in Android?', answer: 'A reusable component that represents a portion of the user interface in an Activity with its own lifecycle.' },
        { id: '2', question: 'When was the first mobile phone introduced?', answer: '1973 by Motorola' },
        { id: '3', question: 'What are the four main Android application components?', answer: 'Activities, Services, Broadcast Receivers, and Content Providers' },
        { id: '4', question: 'What year was Android OS released?', answer: '2008' },
        { id: '5', question: 'What is the main purpose of Android Services?', answer: 'To perform background operations without a user interface' }
      ]);

      setQuiz([
        {
          question: 'What is a Fragment in Android?',
          options: ['A type of activity', 'A part of an activity', 'A background service', 'A notification component'],
          correct: 1
        },
        {
          question: 'Which company introduced the first handheld mobile phone?',
          options: ['Nokia', 'Apple', 'Motorola', 'Samsung'],
          correct: 2
        },
        {
          question: 'In what year was Android OS first released?',
          options: ['2007', '2008', '2009', '2010'],
          correct: 1
        }
      ]);

      setQuizAnswers(new Array(3).fill(-1));
    }
  }, []);

  // Helpers
  const addDocs = (newOnes: SessionDoc[]) => {
    setDocs(prev => [...newOnes, ...prev]);
  };
  
  const toggleDoc = (id: string) => setDocs(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  const selectAll = (checked: boolean) => setDocs(prev => prev.map(d => ({ ...d, selected: checked })));
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
        // Mock file extraction
        results.push({ 
          id: `${Date.now()}-${i}-${f.name}`, 
          name: f.name, 
          type: f.type || 'unknown', 
          text: `Content of ${f.name}...`, 
          selected: true 
        });
        setProgress(10 + Math.round(((i + 1) / arr.length) * 50));
      }
      addDocs(results);
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

  // Quiz functions
  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[quizIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(quizIndex + 1);
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
  };

  const shuffleQuestions = () => {
    const shuffled = [...quiz].sort(() => Math.random() - 0.5);
    setQuiz(shuffled);
    resetQuiz();
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
  const downloadSummary = () => downloadContent(summary, 'summary.txt');
  const downloadFlashcards = () => {
    const content = flashcards.map(card => `Q: ${card.question}\nA: ${card.answer}\n---`).join('\n');
    downloadContent(content, 'flashcards.txt');
  };

  const hasSelectedDocs = selectedDocs.length > 0;
  const currentFlashcard = flashcards[currentFlashcardIndex];

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-cyan-400 rotate-45 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-8 h-8 border-4 border-pink-400 animate-spin"></div>
        <div className="absolute bottom-10 right-10 w-3 h-3 bg-green-400 animate-ping"></div>
      </div>

      {/* Main Header */}
      <header className="relative z-50 bg-black border-b-8 border-white p-6 shadow-[0_8px_0px_#ffffff]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl lg:text-6xl font-black tracking-tight"
              >
                <span className="text-white">STUDY</span>
                <span className="text-yellow-400 ml-4">SESSION</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-gray-400 mt-2"
              >
                {docs.length > 0 ? `${docs.length} DOCUMENTS • ${selectedDocs.length} SELECTED` : 'UPLOAD DOCUMENTS TO START'}
              </motion.p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowChat(!showChat)}
                className={`${showChat ? 'bg-cyan-400 text-black' : 'bg-black text-cyan-400'} border-4 border-cyan-400 font-black hover:bg-cyan-400 hover:text-black shadow-[4px_4px_0px_#22d3ee] transition-all`}
              >
                <MessageCircle size={16} className="mr-2" />
                AI CHAT
              </Button>
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                className="bg-black text-white border-4 border-white font-black hover:bg-white hover:text-black shadow-[4px_4px_0px_#ffffff] transition-all"
              >
                <Settings size={16} className="mr-2" />
                {showSidebar ? 'HIDE' : 'SHOW'} TOOLS
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {progress > 0 && (
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                className="mt-6"
              >
                <div className="bg-gray-900 border-4 border-yellow-400 p-4 shadow-[8px_8px_0px_#fbbf24]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-black">PROCESSING...</span>
                    <span className="text-white font-black">{progress}%</span>
                  </div>
                  <div className="w-full bg-black border-2 border-yellow-400 h-4">
                    <motion.div 
                      className="h-full bg-yellow-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-40 bg-gray-900 border-b-4 border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {[
              { id: 'note' as ActiveTab, label: 'Note', icon: BookOpen, color: 'bg-blue-400' },
              { id: 'quiz' as ActiveTab, label: 'Quiz', icon: CheckSquare, color: 'bg-purple-400' },
              { id: 'flashcards' as ActiveTab, label: 'Flashcards', icon: Brain, color: 'bg-pink-400' },
              { id: 'transcript' as ActiveTab, label: 'Transcript', icon: FileText, color: 'bg-green-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 border-4 border-black font-black text-lg transition-all duration-200 transform hover:scale-105 relative
                    ${isActive 
                      ? `${tab.color} text-black shadow-[6px_6px_0px_rgba(0,0,0,0.5)]` 
                      : 'bg-black text-white border-gray-600 hover:border-white shadow-[4px_4px_0px_rgba(255,255,255,0.1)]'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 border-4 border-white"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-96 bg-gray-900 border-r-8 border-white p-6 space-y-6 sticky top-0 h-screen overflow-y-auto"
            >
              {/* Document Upload Section */}
              <div className="bg-black border-4 border-yellow-400 p-4 shadow-[8px_8px_0px_#fbbf24]">
                <h3 className="text-yellow-400 font-black mb-4 flex items-center gap-2">
                  <Upload size={20} />
                  IMPORT CONTENT
                </h3>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-purple-400 text-black border-4 border-black font-black hover:bg-purple-500 shadow-[4px_4px_0px_#a855f7]"
                  >
                    <File className="mr-2" size={16} />
                    UPLOAD FILES
                  </Button>
                  
                  <div className="flex gap-2">
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-black border-2 border-cyan-400 text-white font-mono"
                    />
                    <Button className="bg-cyan-400 text-black border-2 border-black font-black hover:bg-cyan-500">
                      <LinkIcon size={16} />
                    </Button>
                  </div>
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
                <div className="bg-black border-4 border-white p-4 shadow-[8px_8px_0px_rgba(255,255,255,0.3)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-black flex items-center gap-2">
                      <Archive size={20} />
                      DOCUMENTS ({docs.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => selectAll(true)}
                        size="sm"
                        className="bg-green-400 text-black border-2 border-black font-black hover:bg-green-500"
                      >
                        ALL
                      </Button>
                      <Button
                        onClick={() => selectAll(false)}
                        size="sm"
                        className="bg-red-400 text-black border-2 border-black font-black hover:bg-red-500"
                      >
                        NONE
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`
                          flex items-center gap-3 p-3 border-2 cursor-pointer transition-all
                          ${doc.selected 
                            ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_#fbbf24]' 
                            : 'bg-black text-white border-gray-600 hover:border-white'
                          }
                        `}
                      >
                        <div>
                          {doc.selected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </div>
                        <File size={14} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{doc.name}</p>
                          <p className="text-xs opacity-70 uppercase">{doc.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-black border-4 border-green-400 p-4 shadow-[8px_8px_0px_#22c55e]">
                <h3 className="text-green-400 font-black mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  QUICK ACTIONS
                </h3>
                
                <div className="space-y-2">
                  <Button
                    disabled={!hasSelectedDocs || isLoading}
                    className="w-full bg-blue-400 text-black border-2 border-black font-black hover:bg-blue-500 disabled:opacity-50"
                  >
                    <Sparkles className="mr-2" size={16} />
                    GENERATE NOTES
                  </Button>
                  <Button
                    disabled={!hasSelectedDocs || isLoading}
                    className="w-full bg-pink-400 text-black border-2 border-black font-black hover:bg-pink-500 disabled:opacity-50"
                  >
                    <Brain className="mr-2" size={16} />
                    CREATE FLASHCARDS
                  </Button>
                  <Button
                    disabled={!hasSelectedDocs || isLoading}
                    className="w-full bg-purple-400 text-black border-2 border-black font-black hover:bg-purple-500 disabled:opacity-50"
                  >
                    <CheckSquare className="mr-2" size={16} />
                    GENERATE QUIZ
                  </Button>
                </div>
              </div>

              {/* Study Timer */}
              <div className="bg-black border-4 border-orange-400 p-4 shadow-[8px_8px_0px_#fb923c]">
                <h3 className="text-orange-400 font-black mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  STUDY TIMER
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-black mb-2">25:00</div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-400 text-black border-2 border-black font-black hover:bg-green-500">
                      START
                    </Button>
                    <Button className="flex-1 bg-red-400 text-black border-2 border-black font-black hover:bg-red-500">
                      PAUSE
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900 border-8 border-white p-8 shadow-[16px_16px_0px_rgba(255,255,255,0.2)] min-h-[600px]"
              >
                {/* Note Tab */}
                {activeTab === 'note' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-4xl font-black text-blue-400 flex items-center gap-3">
                        <BookOpen size={40} />
                        STUDY NOTES
                      </h2>
                      {notes && (
                        <Button
                          onClick={downloadNotes}
                          className="bg-blue-400 text-black border-4 border-black font-black hover:bg-blue-500 shadow-[6px_6px_0px_#60a5fa]"
                        >
                          <Download className="mr-2" size={16} />
                          DOWNLOAD
                        </Button>
                      )}
                    </div>

                    {notes ? (
                      <div className="bg-black border-4 border-blue-400 p-6 shadow-[12px_12px_0px_#60a5fa] max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono text-sm">
                          {notes}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-24">
                        <div className="bg-blue-400 w-32 h-32 mx-auto mb-8 flex items-center justify-center border-8 border-black shadow-[12px_12px_0px_#60a5fa]">
                          <PenTool className="w-16 h-16 text-black" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">NO NOTES GENERATED</h3>
                        <p className="text-gray-400 font-bold mb-8 text-lg">Select documents and generate AI-powered study notes</p>
                        <Button
                          disabled={!hasSelectedDocs || isLoading}
                          className="bg-blue-400 text-black border-6 border-black font-black text-xl px-12 py-6 shadow-[8px_8px_0px_#60a5fa] hover:shadow-[12px_12px_0px_#60a5fa] transition-all disabled:opacity-50"
                        >
                          <Sparkles className="mr-3" size={24} />
                          GENERATE NOTES
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === 'quiz' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h2 className="text-4xl font-black text-purple-400 flex items-center gap-3">
                        <CheckSquare size={40} />
                        QUIZ MODE
                      </h2>
                      {quiz.length > 0 && (
                        <div className="flex gap-3">
                          <Button
                            onClick={resetQuiz}
                            className="bg-gray-400 text-black border-4 border-black font-black hover:bg-gray-500 shadow-[4px_4px_0px_#9ca3af]"
                          >
                            <RotateCcw className="mr-2" size={16} />
                            RESET
                          </Button>
                          <Button
                            onClick={shuffleQuestions}
                            className="bg-orange-400 text-black border-4 border-black font-black hover:bg-orange-500 shadow-[4px_4px_0px_#fb923c]"
                          >
                            <Shuffle className="mr-2" size={16} />
                            SHUFFLE
                          </Button>
                        </div>
                      )}
                    </div>

                    {quiz.length > 0 ? (
                      <div className="space-y-6">
                        <div className="bg-black border-4 border-purple-400 p-8 shadow-[12px_12px_0px_#a855f7]">
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-black text-purple-400 text-xl">
                                QUESTION {quizIndex + 1} OF {quiz.length}
                              </span>
                              <div className="flex gap-1">
                                {quiz.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-6 h-6 border-4 border-black ${
                                      index === quizIndex ? 'bg-purple-400' : 
                                      quizAnswers[index] !== -1 ? 'bg-green-400' : 'bg-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="bg-gray-900 border-4 border-white p-6 mb-6">
                              <h3 className="text-2xl font-black text-white mb-6 leading-tight">
                                {quiz[quizIndex]?.question}
                              </h3>

                              <div className="space-y-3">
                                {quiz[quizIndex]?.options.map((option, optionIndex) => (
                                  <motion.button
                                    key={optionIndex}
                                    onClick={() => selectAnswer(optionIndex)}
                                    className={`
                                      w-full p-4 border-4 font-black text-left transition-all transform hover:scale-102
                                      ${quizAnswers[quizIndex] === optionIndex
                                        ? 'bg-yellow-400 text-black border-black shadow-[8px_8px_0px_#fbbf24]'
                                        : 'bg-black text-white border-gray-600 hover:border-white hover:shadow-[4px_4px_0px_rgba(255,255,255,0.3)]'
                                      }
                                    `}
                                    whileHover={{ x: 4, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <span className="inline-block w-8 h-8 bg-white text-black rounded-full text-center leading-8 font-black mr-4">
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    {option}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            disabled={quizIndex === 0}
                            onClick={prevQuestion}
                            className="bg-gray-400 text-black border-4 border-black font-black disabled:opacity-50 shadow-[6px_6px_0px_#9ca3af] px-8 py-4 text-lg"
                          >
                            <ChevronLeft size={20} className="mr-2" />
                            PREVIOUS
                          </Button>

                          <div className="text-center">
                            <div className="text-lg font-black text-gray-400">
                              {quizAnswers.filter(a => a !== -1).length} / {quiz.length} ANSWERED
                            </div>
                          </div>

                          <Button
                            disabled={quizIndex >= quiz.length - 1}
                            onClick={nextQuestion}
                            className="bg-gray-400 text-black border-4 border-black font-black disabled:opacity-50 shadow-[6px_6px_0px_#9ca3af] px-8 py-4 text-lg"
                          >
                            NEXT
                            <ChevronRight size={20} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-24">
                        <div className="bg-purple-400 w-32 h-32 mx-auto mb-8 flex items-center justify-center border-8 border-black shadow-[12px_12px_0px_#a855f7]">
                          <HelpCircle className="w-16 h-16 text-black" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">NO QUIZ AVAILABLE</h3>
                        <p className="text-gray-400 font-bold mb-8 text-lg">Generate quiz questions from your documents</p>
                        <Button
                          disabled={!hasSelectedDocs || isLoading}
                          className="bg-purple-400 text-black border-6 border-black font-black text-xl px-12 py-6 shadow-[8px_8px_0px_#a855f7] hover:shadow-[12px_12px_0px_#a855f7] transition-all disabled:opacity-50"
                        >
                          <CheckSquare className="mr-3" size={24} />
                          GENERATE QUIZ
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h2 className="text-4xl font-black text-pink-400 flex items-center gap-3">
                        <Brain size={40} />
                        FLASHCARDS
                      </h2>
                      {flashcards.length > 0 && (
                        <div className="flex gap-3">
                          <Button
                            onClick={downloadFlashcards}
                            className="bg-blue-400 text-black border-4 border-black font-black hover:bg-blue-500 shadow-[4px_4px_0px_#60a5fa]"
                          >
                            <Download className="mr-2" size={16} />
                            DOWNLOAD
                          </Button>
                          <Button
                            onClick={() => setCurrentFlashcardIndex(0)}
                            className="bg-gray-400 text-black border-4 border-black font-black hover:bg-gray-500 shadow-[4px_4px_0px_#9ca3af]"
                          >
                            <RotateCcw className="mr-2" size={16} />
                            RESTART
                          </Button>
                        </div>
                      )}
                    </div>

                    {flashcards.length > 0 && currentFlashcard ? (
                      <div className="space-y-8">
                        {/* Flashcard */}
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
                                className="absolute inset-0 w-full h-full bg-pink-400 text-black border-8 border-black p-8 flex flex-col justify-center shadow-[16px_16px_0px_#ec4899]"
                                style={{ backfaceVisibility: 'hidden' }}
                              >
                                <div className="text-center">
                                  <div className="bg-black text-pink-400 px-4 py-2 font-black text-sm mb-6 inline-block border-4 border-pink-400">
                                    QUESTION
                                  </div>
                                  <p className="font-black text-2xl leading-tight mb-8">{currentFlashcard.question}</p>
                                  <div className="flex items-center justify-center gap-2 text-sm font-bold opacity-70">
                                    <FlipHorizontal size={16} />
                                    CLICK TO REVEAL ANSWER
                                  </div>
                                </div>
                              </div>
                              
                              {/* Back - Answer */}
                              <div 
                                className="absolute inset-0 w-full h-full bg-green-400 text-black border-8 border-black p-8 flex flex-col justify-center shadow-[16px_16px_0px_#22c55e]"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                              >
                                <div className="text-center">
                                  <div className="bg-black text-green-400 px-4 py-2 font-black text-sm mb-6 inline-block border-4 border-green-400">
                                    ANSWER
                                  </div>
                                  <p className="font-black text-2xl leading-tight mb-8">{currentFlashcard.answer}</p>
                                  <div className="flex items-center justify-center gap-2 text-sm font-bold opacity-70">
                                    <FlipHorizontal size={16} />
                                    CLICK TO SHOW QUESTION
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={prevFlashcard}
                            className="bg-gray-400 text-black border-4 border-black font-black shadow-[6px_6px_0px_#9ca3af] px-8 py-4 text-lg"
                          >
                            <ChevronLeft size={20} className="mr-2" />
                            PREVIOUS
                          </Button>

                          <div className="text-center">
                            <div className="text-2xl font-black mb-2">
                              {currentFlashcardIndex + 1} / {flashcards.length}
                            </div>
                            <div className="flex gap-1 justify-center">
                              {flashcards.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-3 h-3 border-2 border-black ${
                                    index === currentFlashcardIndex ? 'bg-pink-400' : 'bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <Button
                            onClick={nextFlashcard}
                            className="bg-gray-400 text-black border-4 border-black font-black shadow-[6px_6px_0px_#9ca3af] px-8 py-4 text-lg"
                          >
                            NEXT
                            <ChevronRight size={20} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-24">
                        <div className="bg-pink-400 w-32 h-32 mx-auto mb-8 flex items-center justify-center border-8 border-black shadow-[12px_12px_0px_#ec4899]">
                          <Bookmark className="w-16 h-16 text-black" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">NO FLASHCARDS CREATED</h3>
                        <p className="text-gray-400 font-bold mb-8 text-lg">Generate flashcards from your study materials</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                          <Button
                            disabled={!hasSelectedDocs || isLoading}
                            className="bg-pink-400 text-black border-6 border-black font-black text-lg px-8 py-4 shadow-[6px_6px_0px_#ec4899] hover:shadow-[8px_8px_0px_#ec4899] transition-all disabled:opacity-50"
                          >
                            <Brain className="mr-2" size={20} />
                            5 CARDS
                          </Button>
                          <Button
                            disabled={!hasSelectedDocs || isLoading}
                            className="bg-pink-400 text-black border-6 border-black font-black text-lg px-8 py-4 shadow-[6px_6px_0px_#ec4899] hover:shadow-[8px_8px_0px_#ec4899] transition-all disabled:opacity-50"
                          >
                            <Brain className="mr-2" size={20} />
                            10 CARDS
                          </Button>
                          <Button
                            disabled={!hasSelectedDocs || isLoading}
                            className="bg-pink-400 text-black border-6 border-black font-black text-lg px-8 py-4 shadow-[6px_6px_0px_#ec4899] hover:shadow-[8px_8px_0px_#ec4899] transition-all disabled:opacity-50"
                          >
                            <Brain className="mr-2" size={20} />
                            20 CARDS
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Transcript Tab */}
                {activeTab === 'transcript' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-4xl font-black text-green-400 flex items-center gap-3">
                        <FileText size={40} />
                        TRANSCRIPT
                      </h2>
                      {summary && (
                        <Button
                          onClick={downloadSummary}
                          className="bg-green-400 text-black border-4 border-black font-black hover:bg-green-500 shadow-[6px_6px_0px_#22c55e]"
                        >
                          <Download className="mr-2" size={16} />
                          DOWNLOAD
                        </Button>
                      )}
                    </div>

                    {summary ? (
                      <div className="bg-black border-4 border-green-400 p-8 shadow-[12px_12px_0px_#22c55e]">
                        <div className="bg-gray-900 border-4 border-white p-6 max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono text-sm">
                            {summary}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-24">
                        <div className="bg-green-400 w-32 h-32 mx-auto mb-8 flex items-center justify-center border-8 border-black shadow-[12px_12px_0px_#22c55e]">
                          <FileCheck className="w-16 h-16 text-black" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">NO TRANSCRIPT AVAILABLE</h3>
                        <p className="text-gray-400 font-bold mb-8 text-lg">Upload documents to view their content</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-green-400 text-black border-6 border-black font-black text-xl px-12 py-6 shadow-[8px_8px_0px_#22c55e] hover:shadow-[12px_12px_0px_#22c55e] transition-all"
                        >
                          <Upload className="mr-3" size={24} />
                          UPLOAD DOCUMENTS
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* AI Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-96 bg-gray-900 border-l-8 border-cyan-400 p-6 sticky top-0 h-screen overflow-y-auto"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-cyan-400 text-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_#22d3ee]">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-cyan-400">AI TUTOR</h3>
                      <p className="text-gray-400 font-bold text-sm">ASK QUESTIONS</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowChat(false)}
                    size="sm"
                    className="bg-red-400 text-black border-2 border-black hover:bg-red-500"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              <ChatBox contextText={combinedText} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <div className="bg-yellow-400 text-black border-8 border-black p-16 shadow-[24px_24px_0px_#fbbf24] text-center">
              <Upload className="w-24 h-24 mx-auto mb-6" />
              <h3 className="text-4xl font-black mb-4">DROP FILES HERE</h3>
              <p className="text-xl font-bold">Release to upload documents</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Chat Box Component
const ChatBox: React.FC<{ contextText: string }> = ({ contextText }) => {
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
      // Mock AI response for demonstration
      setTimeout(() => {
        const mockResponse = "Based on your study materials, here's what I found: " + 
          "Android Fragments are modular sections of an activity that have their own lifecycle. " +
          "They're essential for creating flexible UIs that work across different screen sizes.";
        setMessages(m => [...m, { role: 'assistant', content: mockResponse }]);
        setLoading(false);
      }, 1500);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error fetching answer.' }]);
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
    "What are the main topics?",
    "Explain Android Fragments",
    "Create a study plan",
    "Summarize key points"
  ];

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-black border-4 border-cyan-400 p-4">
        {messages.length === 0 && !contextText ? (
          <div className="text-center py-8">
            <div className="bg-gray-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 border-black">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <p className="font-black text-gray-400 mb-4">NO DOCUMENTS SELECTED</p>
            <p className="text-xs text-gray-500 font-bold">Upload and select documents to chat</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-3">
            <p className="font-black text-cyan-400 text-center mb-4">SUGGESTED QUESTIONS</p>
            {suggestedQuestions.map((question, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setInput(question)}
                className="block w-full text-left bg-gray-800 border-2 border-gray-600 hover:border-cyan-400 px-3 py-3 text-sm font-bold transition-all hover:shadow-[4px_4px_0px_#22d3ee] transform hover:translate-x-1"
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
                p-4 border-4 font-bold
                ${message.role === 'user' 
                  ? 'bg-cyan-400 text-black border-black ml-4 shadow-[6px_6px_0px_#22d3ee]' 
                  : 'bg-black text-white border-cyan-400 mr-4 shadow-[6px_6px_0px_#22d3ee]'
                }
              `}
            >
              <div className={`text-xs font-black mb-2 ${
                message.role === 'user' ? 'text-black/70' : 'text-cyan-400'
              }`}>
                {message.role === 'user' ? 'YOU' : 'AI TUTOR'}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            </motion.div>
          ))
        )}
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black text-white border-4 border-cyan-400 p-4 mr-4 shadow-[6px_6px_0px_#22d3ee]"
          >
            <div className="text-xs font-black text-cyan-400 mb-2">AI TUTOR</div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-cyan-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-3 h-3 bg-cyan-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-3 h-3 bg-cyan-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm font-bold">THINKING...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask AI assistant about your documents..."
          className="bg-black border-4 border-cyan-400 text-white font-mono font-bold focus:border-cyan-400 shadow-[4px_4px_0px_#22d3ee] resize-none"
          rows={3}
          disabled={loading || !contextText}
        />
        <Button
          onClick={ask}
          disabled={loading || !input.trim() || !contextText}
          className="bg-cyan-400 text-black border-4 border-black font-black hover:bg-cyan-500 shadow-[6px_6px_0px_#22d3ee] px-6 self-end"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight size={20} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MultiDocSession;
