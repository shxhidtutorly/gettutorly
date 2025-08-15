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
import { Upload, FileText, Link as LinkIcon, Mic, Sparkles, CheckSquare, Square, X, File, PlayCircle } from "lucide-react";
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

interface QuizQuestion { question: string; options: string[]; correct: number }

const neon = {
  cyan: "border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]",
  pink: "border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]",
  yellow: "border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]",
  green: "border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]",
};

const MultiDocSession: React.FC = () => {
  const { toast } = useToast();

  // Documents state
  const [docs, setDocs] = useState<SessionDoc[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import options
  const [pastedText, setPastedText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Center output state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string>("");
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
    setIsLoading(true); setProgress(20);
    const res = await extractTextFromUrl(linkUrl);
    if (res.success && res.content) {
      const id = `${Date.now()}-url`;
      addDocs([{ id, name: res.title || linkUrl, type: 'html', text: res.content, selected: true }]);
      toast({ title: "Imported content from link" });
    } else {
      toast({ variant: "destructive", title: "Failed to import from link", description: res.error });
    }
    setIsLoading(false); setProgress(0); setLinkUrl("");
  };

  // AI Actions
  const runSummary = async () => {
    if (!combinedText.trim()) { toast({ variant: "destructive", title: "Select at least one document" }); return; }
    setIsLoading(true); setProgress(70);
    try {
      const resp = await fetch('/api/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: combinedText, filename: 'Multi-Doc Session' }) });
      const data = await resp.json();
      setSummary(data.summary || data.response || 'Summary generated.');
      toast({ title: "Summary ready!" });
    } catch (e) {
      // Fallback to Together model through /api/ai
      const resp = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Summarize clearly and concisely:\n\n${combinedText}`, model: 'together' }) });
      const data = await resp.json();
      setSummary(data.response || 'Summary generated.');
    } finally {
      setIsLoading(false); setProgress(0);
    }
  };

  const runNotes = async () => {
    if (!combinedText.trim()) { toast({ variant: "destructive", title: "Select at least one document" }); return; }
    setIsLoading(true); setProgress(60);
    try {
      const note = await generateNotesAI(combinedText, 'Multi-Doc Session');
      setSummary(note.content);
      toast({ title: "AI Notes generated!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to generate notes" });
    } finally { setIsLoading(false); setProgress(0); }
  };

  const runFlashcards = async (count: number) => {
    if (!combinedText.trim()) { toast({ variant: "destructive", title: "Select at least one document" }); return; }
    setIsLoading(true); setProgress(60);
    try {
      // Generate base notes first for better flashcards
      const note = await generateNotesAI(combinedText, 'Multi-Doc Session');
      const cards = await generateFlashcardsAI(note.content);
      setFlashcards(cards.slice(0, count));
      toast({ title: `Generated ${Math.min(count, cards.length)} flashcards` });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to generate flashcards" });
    } finally { setIsLoading(false); setProgress(0); }
  };

  const runQuiz = async () => {
    if (!combinedText.trim()) { toast({ variant: "destructive", title: "Select at least one document" }); return; }
    setIsLoading(true); setProgress(60);
    try {
      const prompt = `Create a multiple-choice quiz (10 questions) from this study material. Return strict JSON with an array named questions where each item has: question (string), options (array of 4 strings), correct (number index of correct option). No extra text.\n\n${combinedText}`;
      const resp = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, model: 'together' }) });
      const data = await resp.json();
      let parsed: { questions: QuizQuestion[] } | null = null;
      const match = (data.response || '').match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]); else parsed = JSON.parse(data.response);
      setQuiz(parsed.questions);
      setQuizIndex(0);
      setQuizAnswers(new Array(parsed.questions.length).fill(-1));
      toast({ title: "Quiz generated!" });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Failed to generate quiz" });
    } finally { setIsLoading(false); setProgress(0); }
  };

  const quizCurrent = quiz ? quiz[quizIndex] : null;
  const selectAnswer = (i: number) => setQuizAnswers(prev => { const next = [...prev]; next[quizIndex] = i; return next; });

  const docsEmpty = docs.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 py-6 px-4 md:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Import + Docs grid */}
          <section className="lg:col-span-3 space-y-4">
            <h2 className="text-xl font-black">Session Documents</h2>

            {/* Import options */}
            <div className={`bg-gray-900 border-2 rounded-none p-4 ${neon.cyan}`}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button onClick={() => fileInputRef.current?.click()} className="rounded-none bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 font-bold flex items-center gap-2"><Upload size={16}/> File</Button>
                <Button onClick={addPastedText} disabled={!pastedText.trim()} className="rounded-none bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 font-bold flex items-center gap-2"><FileText size={16}/> Text</Button>
                <Button onClick={addLink} className="rounded-none bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 font-bold flex items-center gap-2"><LinkIcon size={16}/> Link</Button>
                <Button onClick={() => window.location.href='/audio-notes'} className="rounded-none bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 font-bold flex items-center gap-2"><Mic size={16}/> Recording</Button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.html" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`mt-3 border-2 border-dashed p-6 text-center transition-colors ${dragActive ? 'border-cyan-400 bg-gray-800' : 'border-gray-700'} `}
              >
                <p className="text-sm text-gray-400">Drag & drop multiple files here</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <Textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder="Paste text to add as a document..." className="bg-black border-2 border-gray-700 rounded-none min-h-[90px]" />
                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com/article" className="bg-black border-2 border-gray-700 rounded-none" />
              </div>
            </div>

            {/* Docs grid */}
            <div className={`bg-gray-900 border-2 rounded-none p-3 ${neon.pink}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{docs.length} docs</span>
                <Button onClick={() => selectAll(true)} size="sm" className="rounded-none bg-transparent border-2 border-gray-700 text-white hover:bg-gray-800">Select all</Button>
              </div>
              <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
                {docs.map(doc => (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2 bg-gray-800 border-2 border-gray-700 p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleDoc(doc.id)} className="text-cyan-400">
                        {doc.selected ? <CheckSquare size={18}/> : <Square size={18}/>}
                      </button>
                      <File className="text-gray-400" size={16}/>
                      <div>
                        <div className="font-bold text-sm line-clamp-1">{doc.name}</div>
                        <div className="text-xs text-gray-400 uppercase">{doc.type}</div>
                      </div>
                    </div>
                    <button onClick={() => removeDoc(doc.id)} className="text-gray-500 hover:text-red-400"><X size={16}/></button>
                  </motion.div>
                ))}
                {docsEmpty && (
                  <div className="text-sm text-gray-400 text-center py-6">No documents yet. Import to get started.</div>
                )}
              </div>
            </div>
          </section>

          {/* Center: Actions + Output */}
          <section className="lg:col-span-6 space-y-4">
            <header className="flex items-center justify-between">
              <h1 className="text-3xl font-black flex items-center gap-2"><Sparkles className="text-yellow-400"/> Multi‑Document Study Session</h1>
            </header>

            {/* Actions */}
            <div className={`bg-gray-900 border-2 rounded-none p-4 ${neon.yellow}`}>
              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={() => runFlashcards(10)} disabled={isLoading || docsEmpty} className="rounded-none bg-transparent text-white border-2 border-gray-700 hover:bg-gray-800 font-bold">Generate Flashcards</Button>
                <Button onClick={runQuiz} disabled={isLoading || docsEmpty} className="rounded-none bg-transparent text-white border-2 border-gray-700 hover:bg-gray-800 font-bold">Generate Quiz</Button>
                <Button onClick={runNotes} disabled={isLoading || docsEmpty} className="rounded-none bg-transparent text-white border-2 border-gray-700 hover:bg-gray-800 font-bold">AI Notes</Button>
                <Button onClick={runSummary} disabled={isLoading || docsEmpty} className="rounded-none bg-transparent text-white border-2 border-gray-700 hover:bg-gray-800 font-bold">AI Summary</Button>
              </div>
              {progress > 0 && (
                <div className="mt-4">
                  <Progress value={progress} className="h-2 bg-gray-800 border-2 border-yellow-400 rounded-none" />
                </div>
              )}
            </div>

            {/* Output area */}
            <div className="space-y-4">
              {/* Summary / Notes */}
              {(summary && !quiz && flashcards.length === 0) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-gray-900 border-2 rounded-none p-4 ${neon.green}`}>
                  <h3 className="text-2xl font-bold mb-3">AI Output</h3>
                  <div className="max-h-[50vh] overflow-y-auto p-4 bg-black/60 border-2 border-gray-700">
                    <pre className="whitespace-pre-wrap text-gray-300">{summary}</pre>
                  </div>
                </motion.div>
              )}

              {/* Flashcards */}
              {flashcards.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-gray-900 border-2 rounded-none p-4 ${neon.cyan}`}>
                  <h3 className="text-2xl font-bold mb-3">Flashcards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flashcards.map(card => (
                      <div key={card.id} className="p-4 border-2 border-gray-700 bg-black/60">
                        <div className="font-bold mb-2">Q: {card.question}</div>
                        <div className="text-gray-300">A: {card.answer}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quiz */}
              {quiz && quizCurrent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-gray-900 border-2 rounded-none p-4 ${neon.pink}`}>
                  <h3 className="text-2xl font-bold mb-3">Quiz</h3>
                  <QuizCard
                    question={quizCurrent.question}
                    options={quizCurrent.options}
                    questionNumber={quizIndex + 1}
                    totalQuestions={quiz.length}
                    selectedAnswer={quizAnswers[quizIndex] ?? null}
                    onAnswerSelect={selectAnswer}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <Button disabled={quizIndex === 0} onClick={() => setQuizIndex(i => Math.max(0, i-1))} className="rounded-none bg-transparent border-2 border-gray-700 text-white hover:bg-gray-800">Prev</Button>
                    <div className="text-sm text-gray-400">{quizIndex + 1} / {quiz.length}</div>
                    <Button disabled={quizIndex >= quiz.length - 1} onClick={() => setQuizIndex(i => Math.min(quiz.length - 1, i+1))} className="rounded-none bg-transparent border-2 border-gray-700 text-white hover:bg-gray-800">Next</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Right: Chat */}
          <aside className="lg:col-span-3 space-y-4">
            <div className={`bg-gray-900 border-2 rounded-none p-4 ${neon.cyan}`}>
              <h3 className="text-xl font-bold mb-2">AI Chat</h3>
              <p className="text-sm text-gray-400 mb-3">Ask about selected documents in this session.</p>
              <ChatBox contextText={combinedText} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

// Simple chat box component that reuses /api/ai
const ChatBox: React.FC<{ contextText: string }> = ({ contextText }) => {
  const [messages, setMessages] = useState<{ role: 'user'|'assistant'; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages(m => [...m, { role: 'user', content: q }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Use the following study materials to answer concisely.\n\n<materials>\n${contextText}\n</materials>\n\nQuestion: ${q}`, model: 'groq' }) });
      const data = await resp.json();
      setMessages(m => [...m, { role: 'assistant', content: data.response || 'No response' }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error fetching answer.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[45vh] overflow-y-auto space-y-2 border-2 border-gray-800 p-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 text-sm ${m.role === 'user' ? 'bg-black/60' : 'bg-gray-800/60'}`}>{m.content}</div>
        ))}
        {messages.length === 0 && <div className="text-xs text-gray-500">Ask a question about your documents...</div>}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." className="bg-black border-2 border-gray-700 rounded-none" />
        <Button onClick={ask} disabled={loading} className="rounded-none bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 font-black">
          {loading ? <PlayCircle className="animate-pulse" size={18}/> : 'Ask'}
        </Button>
      </div>
    </div>
  );
};

export default MultiDocSession;
