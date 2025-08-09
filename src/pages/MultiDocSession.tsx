import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Mic, 
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
  Settings
} from "lucide-react";
import { extractTextFromFile, type ExtractionResult } from "@/lib/fileExtractor";
import { extractTextFromUrl } from "@/lib/jinaReader";
import { generateNotesAI, generateFlashcardsAI } from "@/lib/aiNotesService";
import { QuizCard } from "@/components/quiz/QuizCard";

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

type ActiveTab = 'content' | 'summary' | 'notes' | 'flashcards' | 'quiz';

const MultiDocSession: React.FC = () => {
  const { toast } = useToast();

  // Documents state
  const [docs, setDocs] = useState<SessionDoc[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import options
  const [pastedText, setPastedText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');

  // Center output state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [flashcards, setFlashcards] = useState<{ id: string; question: string; answer: string }[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const selectedDocs = useMemo(() => docs.filter(d => d.selected), [docs]);
  const combinedText = useMemo(() => selectedDocs.map(d => `# ${d.name}\n\n${d.text}`).join("\n\n---\n\n"), [selectedDocs]);

  // Helpers
  const addDocs = (newOnes: SessionDoc[]) => setDocs(prev => [...newOnes, ...prev]);
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
        const res: ExtractionResult = await extractTextFromFile(f);
        results.push({ id: `${Date.now()}-${i}-${f.name}`, name: f.name, type: res.fileType, text: res.text, selected: true });
        setProgress(10 + Math.round(((i + 1) / arr.length) * 50));
      }
      addDocs(results);
      toast({ title: `Added ${results.length} document${results.length > 1 ? 's' : ''}` });
      if (activeTab === 'content') {
        // Stay on content tab to show uploaded docs
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Failed to process files" });
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

  // Import: Paste Text
  const addPastedText = () => {
    if (!pastedText.trim()) return;
    const id = `${Date.now()}-paste`;
    addDocs([{ id, name: `Pasted Text ${new Date().toLocaleTimeString()}`, type: 'text', text: pastedText.trim(), selected: true }]);
    setPastedText("");
    toast({ title: "Text added as a document" });
  };

  // Import: Link (web page)
  const addLink = async () => {
    if (!/^https?:\/\//i.test(linkUrl)) {
      toast({ variant: "destructive", title: "Enter a valid URL" });
      return;
    }
    setIsLoading(true); 
    setProgress(20);
    const res = await extractTextFromUrl(linkUrl);
    if (res.success && res.content) {
      const id = `${Date.now()}-url`;
      addDocs([{ id, name: res.title || linkUrl, type: 'html', text: res.content, selected: true }]);
      toast({ title: "Imported content from link" });
    } else {
      toast({ variant: "destructive", title: "Failed to import from link", description: res.error });
    }
    setIsLoading(false); 
    setProgress(0); 
    setLinkUrl("");
  };

  // AI Actions
  const runSummary = async () => {
    if (!combinedText.trim()) { 
      toast({ variant: "destructive", title: "Select at least one document" }); 
      return; 
    }
    setIsLoading(true); 
    setProgress(70);
    try {
      const resp = await fetch('/api/summarize', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text: combinedText, filename: 'Multi-Doc Session' }) 
      });
      const data = await resp.json();
      setSummary(data.summary || data.response || 'Summary generated.');
      setActiveTab('summary');
      toast({ title: "Summary ready!" });
    } catch (e) {
      // Fallback to Together model through /api/ai
      const resp = await fetch('/api/ai', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          prompt: `Summarize clearly and concisely:\n\n${combinedText}`, 
          model: 'together' 
        }) 
      });
      const data = await resp.json();
      setSummary(data.response || 'Summary generated.');
      setActiveTab('summary');
    } finally {
      setIsLoading(false); 
      setProgress(0);
    }
  };

  const runNotes = async () => {
    if (!combinedText.trim()) { 
      toast({ variant: "destructive", title: "Select at least one document" }); 
      return; 
    }
    setIsLoading(true); 
    setProgress(60);
    try {
      const note = await generateNotesAI(combinedText, 'Multi-Doc Session');
      setNotes(note.content);
      setActiveTab('notes');
      toast({ title: "AI Notes generated!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to generate notes" });
    } finally { 
      setIsLoading(false); 
      setProgress(0); 
    }
  };

  const runFlashcards = async (count: number) => {
    if (!combinedText.trim()) { 
      toast({ variant: "destructive", title: "Select at least one document" }); 
      return; 
    }
    setIsLoading(true); 
    setProgress(60);
    try {
      // Generate base notes first for better flashcards
      const note = await generateNotesAI(combinedText, 'Multi-Doc Session');
      const cards = await generateFlashcardsAI(note.content);
      setFlashcards(cards.slice(0, count));
      setActiveTab('flashcards');
      toast({ title: `Generated ${Math.min(count, cards.length)} flashcards` });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to generate flashcards" });
    } finally { 
      setIsLoading(false); 
      setProgress(0); 
    }
  };

  const runQuiz = async () => {
    if (!combinedText.trim()) { 
      toast({ variant: "destructive", title: "Select at least one document" }); 
      return; 
    }
    setIsLoading(true); 
    setProgress(60);
    try {
      const prompt = `Create a multiple-choice quiz (10 questions) from this study material. Return strict JSON with an array named questions where each item has: question (string), options (array of 4 strings), correct (number index of correct option). No extra text.\n\n${combinedText}`;
      const resp = await fetch('/api/ai', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ prompt, model: 'together' }) 
      });
      const data = await resp.json();
      let parsed: { questions: QuizQuestion[] } | null = null;
      const match = (data.response || '').match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]); 
      else parsed = JSON.parse(data.response);
      setQuiz(parsed.questions);
      setQuizIndex(0);
      setQuizAnswers(new Array(parsed.questions.length).fill(-1));
      setActiveTab('quiz');
      toast({ title: "Quiz generated!" });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Failed to generate quiz" });
    } finally { 
      setIsLoading(false); 
      setProgress(0); 
    }
  };

  const quizCurrent = quiz ? quiz[quizIndex] : null;
  const selectAnswer = (i: number) => setQuizAnswers(prev => { 
    const next = [...prev]; 
    next[quizIndex] = i; 
    return next; 
  });

  const docsEmpty = docs.length === 0;

  const tabs = [
    { id: 'content' as ActiveTab, label: 'Original Content', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'summary' as ActiveTab, label: 'AI Summary', icon: Zap, gradient: 'from-purple-500 to-pink-500' },
    { id: 'notes' as ActiveTab, label: 'AI Notes', icon: FileCheck, gradient: 'from-green-500 to-emerald-500' },
    { id: 'flashcards' as ActiveTab, label: 'AI Flashcards', icon: Brain, gradient: 'from-orange-500 to-red-500' },
    { id: 'quiz' as ActiveTab, label: 'AI Quizzes', icon: CheckSquare, gradient: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Multi-Document Study Session
                </h1>
                <p className="text-gray-400">Upload documents and generate AI-powered study materials</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={18} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <AnimatePresence>
          {progress > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing...</span>
                  <span className="text-sm text-gray-400">{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2 bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-cyan-500" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              >
                {/* Original Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Upload Documents</h2>
                      <Button
                        onClick={() => selectAll(true)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        Select All
                      </Button>
                    </div>

                    {/* Upload Area */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={onDrop}
                      className={`
                        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                        ${dragActive 
                          ? 'border-cyan-400 bg-cyan-400/10' 
                          : 'border-gray-600 hover:border-gray-500'
                        }
                      `}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                      <p className="text-gray-400 mb-4">Supports PDF, DOCX, TXT, MD, HTML files</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-600"
                        >
                          <Upload size={16} className="mr-2" />
                          Files
                        </Button>
                        <Button
                          onClick={addPastedText}
                          disabled={!pastedText.trim()}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-600"
                        >
                          <FileText size={16} className="mr-2" />
                          Text
                        </Button>
                        <Button
                          onClick={addLink}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-600"
                        >
                          <LinkIcon size={16} className="mr-2" />
                          Link
                        </Button>
                        <Button
                          onClick={() => window.location.href='/audio-notes'}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-600"
                        >
                          <Mic size={16} className="mr-2" />
                          Audio
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

                    {/* Text Input Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Paste Text</label>
                        <Textarea
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                          placeholder="Paste your text content here..."
                          className="bg-gray-800 border-gray-600 focus:border-cyan-400 min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Import from URL</label>
                        <Input
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com/article"
                          className="bg-gray-800 border-gray-600 focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Documents List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Documents ({docs.length})</h3>
                      </div>
                      
                      {docsEmpty ? (
                        <div className="text-center py-12 text-gray-400">
                          <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No documents uploaded yet</p>
                          <p className="text-sm">Upload files to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {docs.map((doc) => (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                            >
                              <button
                                onClick={() => toggleDoc(doc.id)}
                                className="text-cyan-400 hover:text-cyan-300"
                              >
                                {doc.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                              </button>
                              <File className="text-gray-400" size={18} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{doc.name}</p>
                                <p className="text-sm text-gray-400 uppercase">{doc.type}</p>
                              </div>
                              <Button
                                onClick={() => removeDoc(doc.id)}
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!docsEmpty && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                        <Button
                          onClick={runSummary}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Zap className="mr-2" size={16} />
                          Generate Summary
                        </Button>
                        <Button
                          onClick={runNotes}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <FileCheck className="mr-2" size={16} />
                          Generate Notes
                        </Button>
                        <Button
                          onClick={() => runFlashcards(10)}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Brain className="mr-2" size={16} />
                          Generate Flashcards
                        </Button>
                        <Button
                          onClick={runQuiz}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        >
                          <CheckSquare className="mr-2" size={16} />
                          Generate Quiz
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Summary Tab */}
                {activeTab === 'summary' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AI Summary
                    </h2>
                    {summary ? (
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                          {summary}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No summary generated yet</p>
                        <p className="text-sm mb-6">Upload documents and generate a summary</p>
                        <Button
                          onClick={runSummary}
                          disabled={isLoading || docsEmpty}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          Generate Summary
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      AI Notes
                    </h2>
                    {notes ? (
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                          {notes}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No notes generated yet</p>
                        <p className="text-sm mb-6">Upload documents and generate AI notes</p>
                        <Button
                          onClick={runNotes}
                          disabled={isLoading || docsEmpty}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          Generate Notes
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        AI Flashcards
                      </h2>
                      {flashcards.length > 0 && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => runFlashcards(5)}
                            size="sm"
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            5 Cards
                          </Button>
                          <Button
                            onClick={() => runFlashcards(10)}
                            size="sm"
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            10 Cards
                          </Button>
                          <Button
                            onClick={() => runFlashcards(20)}
                            size="sm"
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            20 Cards
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {flashcards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {flashcards.map((card, index) => (
                          <FlashcardComponent key={card.id} card={card} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No flashcards generated yet</p>
                        <p className="text-sm mb-6">Upload documents and generate flashcards</p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => runFlashcards(5)}
                            disabled={isLoading || docsEmpty}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            5 Cards
                          </Button>
                          <Button
                            onClick={() => runFlashcards(10)}
                            disabled={isLoading || docsEmpty}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            10 Cards
                          </Button>
                          <Button
                            onClick={() => runFlashcards(20)}
                            disabled={isLoading || docsEmpty}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            20 Cards
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === 'quiz' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      AI Quiz
                    </h2>
                    
                    {quiz && quizCurrent ? (
                      <div className="space-y-6">
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                          <QuizCard
                            question={quizCurrent.question}
                            options={quizCurrent.options}
                            questionNumber={quizIndex + 1}
                            totalQuestions={quiz.length}
                            selectedAnswer={quizAnswers[quizIndex] ?? null}
                            onAnswerSelect={selectAnswer}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button
                            disabled={quizIndex === 0}
                            onClick={() => setQuizIndex(i => Math.max(0, i-1))}
                            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                          >
                            <ChevronLeft size={16} className="mr-2" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              Question {quizIndex + 1} of {quiz.length}
                            </span>
                            <div className="flex gap-1">
                              {quiz.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === quizIndex ? 'bg-indigo-400' : 
                                    quizAnswers[index] !== -1 ? 'bg-green-400' : 'bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <Button
                            disabled={quizIndex >= quiz.length - 1}
                            onClick={() => setQuizIndex(i => Math.min(quiz.length - 1, i+1))}
                            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                          >
                            Next
                            <ChevronRight size={16} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No quiz generated yet</p>
                        <p className="text-sm mb-6">Upload documents and generate a quiz</p>
                        <Button
                          onClick={runQuiz}
                          disabled={isLoading || docsEmpty}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        >
                          Generate Quiz
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 sticky top-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Tutor</h3>
                  <p className="text-sm text-gray-400">Ask questions about your documents</p>
                </div>
              </div>
              
              <ChatBox contextText={combinedText} />
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

// Enhanced Flashcard Component
const FlashcardComponent: React.FC<{ card: { id: string; question: string; answer: string }; index: number }> = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative h-48 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <div className="text-xs text-orange-400 mb-2 font-medium">QUESTION</div>
            <p className="text-white font-medium">{card.question}</p>
            <div className="text-xs text-gray-400 mt-4">Click to reveal answer</div>
          </div>
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <div className="text-xs text-green-400 mb-2 font-medium">ANSWER</div>
            <p className="text-white font-medium">{card.answer}</p>
            <div className="text-xs text-gray-400 mt-4">Click to see question</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
      const resp = await fetch('/api/ai', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          prompt: `Use the following study materials to answer concisely.\n\n<materials>\n${contextText}\n</materials>\n\nQuestion: ${q}`, 
          model: 'groq' 
        }) 
      });
      const data = await resp.json();
      setMessages(m => [...m, { role: 'assistant', content: data.response || 'No response' }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error fetching answer.' }]);
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

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Ask questions about your documents</p>
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => setInput("What are the main topics?")}
                className="block w-full text-left text-xs bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded transition-colors"
              >
                💡 What are the main topics?
              </button>
              <button 
                onClick={() => setInput("Summarize the key points")}
                className="block w-full text-left text-xs bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded transition-colors"
              >
                📝 Summarize the key points
              </button>
              <button 
                onClick={() => setInput("Create a study plan")}
                className="block w-full text-left text-xs bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded transition-colors"
              >
                📚 Create a study plan
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-3 rounded-lg text-sm
                ${message.role === 'user' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 ml-4' 
                  : 'bg-gray-800/50 border border-gray-700 mr-4'
                }
              `}
            >
              <div className={`text-xs font-medium mb-1 ${
                message.role === 'user' ? 'text-cyan-400' : 'text-green-400'
              }`}>
                {message.role === 'user' ? 'You' : 'AI Tutor'}
              </div>
              <div className="text-gray-200 whitespace-pre-wrap">
                {message.content}
              </div>
            </motion.div>
          ))
        )}
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 border border-gray-700 p-3 rounded-lg mr-4"
          >
            <div className="text-xs font-medium text-green-400 mb-1">AI Tutor</div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-xs">Thinking...</span>
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
          placeholder="Ask about your documents..."
          className="bg-gray-800 border-gray-600 focus:border-cyan-400 text-sm"
          disabled={loading}
        />
        <Button
          onClick={ask}
          disabled={loading || !input.trim()}
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-3"
        >
          {loading ? (
            <PlayCircle className="animate-pulse" size={16} />
          ) : (
            <PlayCircle size={16} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MultiDocSession;
