// MultiDocSession.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Link as LinkIcon,
  FileText,
  Brain,
  CheckSquare,
  FileCheck,
  Zap,
  MessageCircle,
  Trash2,
  Eye,
  ArrowRight,
  Clock,
  Download,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

// Required hooks / helpers you asked to include
import { useTranslation } from "react-i18next";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { extractTextFromUrl } from "@/lib/jinaReader";
import { extractTextFromFile, type ExtractionResult } from "@/lib/fileExtractor";
import { generateNotesAI, generateFlashcardsAI } from "@/lib/aiNotesService";

type ActiveTab = "note" | "quiz" | "flashcards" | "edit";

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
  correct: number;
}

interface FlashCard {
  id: string;
  question: string;
  answer: string;
}

const LS_KEYS = {
  DOCS: "tutorly_docs_v1",
  NOTES: "tutorly_notes_v1",
  FLASHCARDS: "tutorly_flashcards_v1",
  QUIZ: "tutorly_quiz_v1",
  TIMER: "tutorly_timer_v1",
};

const MultiDocSession: React.FC = () => {
  const { t } = useTranslation(); // use t('key') for translatable strings
  useUserLanguage(); // set language per user
  const { user } = useAuth();
  useUserStats();

  // UI / Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>("note");

  // docs
  const [docs, setDocs] = useState<SessionDoc[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // import/paste/link
  const [pastedText, setPastedText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // results
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);

  // flashcard UI
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // view/edit
  const [selectedDocForView, setSelectedDocForView] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // loading/progress
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // timer (seconds)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const selectedDocs = useMemo(() => docs.filter((d) => d.selected), [docs]);
  const combinedText = useMemo(
    () => selectedDocs.map((d) => `# ${d.name}\n\n${d.text}`).join("\n\n---\n\n"),
    [selectedDocs]
  );

  // --- Persistence (localStorage) ---
  useEffect(() => {
    // hydrate
    try {
      const rawDocs = localStorage.getItem(LS_KEYS.DOCS);
      if (rawDocs) setDocs(JSON.parse(rawDocs));
      const rawNotes = localStorage.getItem(LS_KEYS.NOTES);
      if (rawNotes) setNotes(JSON.parse(rawNotes));
      const rawFlash = localStorage.getItem(LS_KEYS.FLASHCARDS);
      if (rawFlash) setFlashcards(JSON.parse(rawFlash));
      const rawQuiz = localStorage.getItem(LS_KEYS.QUIZ);
      if (rawQuiz) {
        const parsed = JSON.parse(rawQuiz);
        setQuiz(parsed.questions || parsed);
        setQuizAnswers(new Array((parsed.questions || parsed).length).fill(-1));
      }
      const rawTimer = localStorage.getItem(LS_KEYS.TIMER);
      if (rawTimer) {
        const parsed = JSON.parse(rawTimer);
        setTimerSeconds(parsed.seconds ?? 25 * 60);
        setTimerRunning(parsed.running ?? false);
      }
    } catch (e) {
      console.warn("failed loading saved session", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.DOCS, JSON.stringify(docs));
    } catch {}
  }, [docs]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.NOTES, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.FLASHCARDS, JSON.stringify(flashcards));
    } catch {}
  }, [flashcards]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.QUIZ, JSON.stringify({ questions: quiz }));
    } catch {}
  }, [quiz]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.TIMER, JSON.stringify({ seconds: timerSeconds, running: timerRunning }));
    } catch {}
  }, [timerSeconds, timerRunning]);

  // timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            // stop and notify
            setTimerRunning(false);
            window.clearInterval(timerRef.current ?? undefined);
            timerRef.current = null;
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning]);

  // --- helpers ---
  const addDocs = (newOnes: SessionDoc[]) => {
    setDocs((prev) => [...newOnes, ...prev]);
  };

  const toggleDoc = (id: string) => setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)));

  const selectAll = (checked: boolean) => setDocs((prev) => prev.map((d) => ({ ...d, selected: checked })));

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  const startNewSession = () => {
    setDocs([]);
    setNotes("");
    setSummary("");
    setFlashcards([]);
    setQuiz([]);
    setQuizAnswers([]);
    setTimerSeconds(25 * 60);
    setTimerRunning(false);
    localStorage.removeItem(LS_KEYS.DOCS);
    localStorage.removeItem(LS_KEYS.NOTES);
    localStorage.removeItem(LS_KEYS.FLASHCARDS);
    localStorage.removeItem(LS_KEYS.QUIZ);
    localStorage.removeItem(LS_KEYS.TIMER);
  };

  // file handlers
  const handleFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    setProgress(5);
    try {
      const arr = Array.from(files);
      const results: SessionDoc[] = [];
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        // try to extract using helper; fallback to minimal content
        let text = `File: ${f.name}`;
        let fileType = f.type || "file";
        try {
          // extractTextFromFile should return { fileType, text } when available
          const res: ExtractionResult = await extractTextFromFile(f as File);
          if (res?.text) {
            text = res.text;
            fileType = res.fileType ?? fileType;
          }
        } catch (e) {
          // fallback simple reader for small text files
          if (f.type.startsWith("text/")) {
            try {
              text = await f.text();
            } catch {}
          }
        }
        results.push({
          id: `${Date.now()}-${i}-${f.name}`,
          name: f.name,
          type: fileType,
          text,
          selected: true,
        });
        setProgress(5 + Math.round(((i + 1) / arr.length) * 80));
      }
      addDocs(results);
    } catch (e) {
      console.error("file handler", e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 400);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  };

  // paste text
  const addPastedText = () => {
    if (!pastedText.trim()) return;
    const id = `${Date.now()}-paste`;
    addDocs([{ id, name: `Pasted ${new Date().toLocaleTimeString()}`, type: "text", text: pastedText.trim(), selected: true }]);
    setPastedText("");
  };

  // add link
  const addLink = async () => {
    if (!/^https?:\/\//i.test(linkUrl)) {
      alert(t("enter_valid_url") || "Enter a valid URL");
      return;
    }
    setIsLoading(true);
    setProgress(15);
    try {
      const res = await extractTextFromUrl(linkUrl);
      if (res?.success && res.content) {
        const id = `${Date.now()}-url`;
        addDocs([{ id, name: res.title || linkUrl, type: "html", text: res.content, selected: true }]);
      } else {
        alert(t("failed_import") || "Failed to import from link");
      }
    } catch (e) {
      console.error("addLink error", e);
      alert(t("failed_import") || "Failed to import from link");
    } finally {
      setIsLoading(false);
      setProgress(0);
      setLinkUrl("");
    }
  };

  // --- AI actions (calls to your backend endpoints/helpers) ---
  const runGenerateNotes = async () => {
    if (!combinedText.trim()) {
      alert(t("select_doc") || "Select at least one document");
      return;
    }
    setIsLoading(true);
    setProgress(30);
    try {
      // prefer local helper if available
      const result = await generateNotesAI(combinedText, "Multi-Doc Session");
      setNotes(result?.content ?? (result?.summary || "Notes generated."));
      setActiveTab("note");
    } catch (e) {
      console.error("notes error", e);
      // fallback via API route if needed
      try {
        const resp = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Generate detailed notes:\n\n${combinedText}` }) });
        const data = await resp.json();
        setNotes(data?.response ?? "Notes generated.");
        setActiveTab("note");
      } catch (err) {
        console.error(err);
        alert(t("failed_generate") || "Failed to generate notes");
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const runGenerateFlashcards = async (count = 10) => {
    if (!combinedText.trim()) {
      alert(t("select_doc") || "Select at least one document");
      return;
    }
    setIsLoading(true);
    setProgress(30);
    try {
      const cards = await generateFlashcardsAI(combinedText);
      // normalize shape
      const norm = (cards || []).slice(0, count).map((c: any, idx: number) => {
        return {
          id: `flash-${Date.now()}-${idx}`,
          question: c.question || c.front || c.q || "Question",
          answer: c.answer || c.back || c.a || "Answer",
        } as FlashCard;
      });
      setFlashcards(norm);
      setFcIndex(0);
      setFcFlipped(false);
      setActiveTab("flashcards");
    } catch (e) {
      console.error("flashcards", e);
      alert(t("failed_generate") || "Failed to generate flashcards");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const runGenerateQuiz = async (count = 10) => {
    if (!combinedText.trim()) {
      alert(t("select_doc") || "Select at least one document");
      return;
    }
    setIsLoading(true);
    setProgress(30);
    try {
      // call API that returns JSON; be robust to extra text
      const prompt = `Create a ${count}-question multiple choice quiz. Return strict JSON like: {"questions":[{ "question": "...", "options":[ "...","...", "...","..." ], "correct": 1 }...]}\n\n${combinedText}`;
      const resp = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, model: "together" }) });
      const data = await resp.json();
      // extract JSON from response
      const raw = data?.response || data?.text || JSON.stringify(data);
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : JSON.parse(raw);
      const qarr: QuizQuestion[] = parsed.questions?.map((q: any) => ({ question: q.question, options: q.options, correct: Number(q.correct) })) ?? [];
      setQuiz(qarr);
      setQuizAnswers(new Array(qarr.length).fill(-1));
      setQuizIndex(0);
      setActiveTab("quiz");
    } catch (e) {
      console.error("quiz", e);
      alert(t("failed_generate") || "Failed to generate quiz");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // --- quiz interactions ---
  const selectQuizAnswer = (index: number) => {
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[quizIndex] = index;
      return next;
    });
  };

  const nextQuiz = () => setQuizIndex((i) => Math.min(quiz.length - 1, i + 1));
  const prevQuiz = () => setQuizIndex((i) => Math.max(0, i - 1));

  const quizScore = useMemo(() => {
    if (!quiz.length) return null;
    let score = 0;
    for (let i = 0; i < quiz.length; i++) {
      if (quizAnswers[i] !== undefined && quizAnswers[i] === quiz[i].correct) score++;
    }
    return { score, total: quiz.length };
  }, [quiz, quizAnswers]);

  const quizCompleted = quizAnswers.length > 0 && quizAnswers.every((a) => a !== -1);

  // --- flashcards interactions ---
  const nextFlash = () => {
    setFcIndex((i) => (flashcards.length ? (i + 1) % flashcards.length : 0));
    setFcFlipped(false);
  };
  const prevFlash = () => {
    setFcIndex((i) => (flashcards.length ? (i - 1 + flashcards.length) % flashcards.length : 0));
    setFcFlipped(false);
  };
  const flipFlash = () => setFcFlipped((s) => !s);
  const shuffleFlashcards = () => {
    setFlashcards((prev) => {
      const copy = [...prev].sort(() => Math.random() - 0.5);
      setFcIndex(0);
      setFcFlipped(false);
      return copy;
    });
  };

  // --- edit doc content ---
  useEffect(() => {
    if (selectedDocForView) {
      const doc = docs.find((d) => d.id === selectedDocForView);
      setEditContent(doc?.text ?? "");
    } else {
      setEditContent("");
    }
  }, [selectedDocForView, docs]);

  const saveEditedDoc = () => {
    if (!selectedDocForView) return;
    setDocs((prev) => prev.map((d) => (d.id === selectedDocForView ? { ...d, text: editContent } : d)));
    // keep editing view open; optionally close
    alert(t("saved") || "Saved");
  };

  // --- download helpers ---
  const downloadFile = (content: string, filename: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // small helpers for formatting time
  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // quick demo placeholder - if no docs, add a sample doc (non-destructive)
  useEffect(() => {
    if (!docs.length) {
      const sample: SessionDoc = {
        id: "sample-1",
        name: "Sample: Mobile Tech & Android",
        type: "text",
        text: `Android Fragment: a reusable UI component inside an Activity...`,
        selected: true,
      };
      addDocs([sample]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- render ---
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-yellow-400 text-black px-6 py-2 font-black text-2xl mb-4 transform -rotate-1 shadow-[8px_8px_0px_#fbbf24]">
            CORE TOOLS
          </div>
          <h1 className="text-4xl font-black">MULTI-DOCUMENT STUDY SESSION</h1>
          <p className="text-gray-400 font-bold">UPLOAD • ANALYZE • LEARN</p>
        </div>

        {/* tabs */}
        <div className="flex gap-2 justify-center mb-6">
          <button onClick={() => setActiveTab("note")} className={`px-6 py-3 border-4 font-black ${activeTab === "note" ? "bg-blue-400 text-black" : "bg-black text-white border-gray-600"}`}>
            <FileCheck className="inline mr-2" /> Note
          </button>
          <button onClick={() => setActiveTab("quiz")} className={`px-6 py-3 border-4 font-black ${activeTab === "quiz" ? "bg-purple-400 text-black" : "bg-black text-white border-gray-600"}`}>
            <CheckSquare className="inline mr-2" /> Quiz
          </button>
          <button onClick={() => setActiveTab("flashcards")} className={`px-6 py-3 border-4 font-black ${activeTab === "flashcards" ? "bg-pink-400 text-black" : "bg-black text-white border-gray-600"}`}>
            <Brain className="inline mr-2" /> Flashcards
          </button>
          <button onClick={() => setActiveTab("edit")} className={`px-6 py-3 border-4 font-black ${activeTab === "edit" ? "bg-green-400 text-black" : "bg-black text-white border-gray-600"}`}>
            <FileText className="inline mr-2" /> Edit
          </button>
        </div>

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* main area */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 p-6 border-4 border-white shadow-[8px_8px_0px_rgba(255,255,255,0.08)] min-h-[360px]">
              {/* content depends on tab */}
              {activeTab === "note" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">AI NOTES</h2>
                    <div className="flex gap-2">
                      <Button onClick={runGenerateNotes} className="bg-green-400 text-black border-4 border-black font-black">
                        <Zap className="mr-2" /> Generate Notes
                      </Button>
                      <Button onClick={() => downloadFile(notes || "No notes", "notes.md", "text/markdown")} className="bg-black text-white border-4">
                        <Download className="mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-black border-4 border-green-400 p-6">
                    <pre className="whitespace-pre-wrap text-gray-300">{notes || "No notes yet — generate from selected documents."}</pre>
                  </div>
                </div>
              )}

              {activeTab === "flashcards" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">FLASHCARDS</h2>
                    <div className="flex gap-2">
                      <Button onClick={() => runGenerateFlashcards(10)} className="bg-pink-400 text-black border-4">
                        <Brain className="mr-2" /> Generate
                      </Button>
                      <Button onClick={() => downloadFile(JSON.stringify(flashcards, null, 2), "flashcards.json")} className="bg-black border-4">
                        <Download className="mr-2" /> Export
                      </Button>
                    </div>
                  </div>

                  {flashcards.length ? (
                    <div className="bg-black p-8 border-4 border-pink-400 rounded">
                      <div className="text-center mb-4">
                        <div className="text-xl font-black mb-2">{flashcards[fcIndex].question}</div>
                        <div className="text-sm opacity-80">{fcFlipped ? flashcards[fcIndex].answer : "Click to flip"}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button onClick={prevFlash}><ChevronLeft /></Button>
                          <Button onClick={flipFlash}><Check /></Button>
                          <Button onClick={nextFlash}><ChevronRight /></Button>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={shuffleFlashcards}><Shuffle /></Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-400">No flashcards yet</div>
                  )}
                </div>
              )}

              {activeTab === "quiz" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">QUIZ</h2>
                    <div className="flex gap-2">
                      <Button onClick={() => runGenerateQuiz(10)} className="bg-purple-400 text-black border-4">
                        <CheckSquare className="mr-2" /> Generate Quiz
                      </Button>
                      <Button onClick={() => { setQuiz([]); setQuizAnswers([]); }} className="bg-black border-4">Clear</Button>
                    </div>
                  </div>

                  {!quiz.length ? (
                    <div className="text-center py-20 text-gray-400">No quiz yet</div>
                  ) : (
                    <>
                      <div className="bg-black p-6 border-4 border-purple-400">
                        <div className="mb-4 text-gray-300 font-bold">Question {quizIndex + 1} of {quiz.length}</div>
                        <div className="font-black text-xl mb-4">{quiz[quizIndex].question}</div>
                        <div className="space-y-2">
                          {quiz[quizIndex].options.map((opt, i) => {
                            const selected = quizAnswers[quizIndex] === i;
                            const isCorrect = quiz[quizIndex].correct === i;
                            const showResult = quizCompleted;
                            const className = `w-full text-left px-4 py-3 border-2 ${selected ? "bg-gray-700" : "bg-black"} rounded`;
                            return (
                              <button
                                key={i}
                                onClick={() => selectQuizAnswer(i)}
                                className={className}
                                style={showResult && isCorrect ? { outline: "3px solid #22c55e" } : {}}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          <Button onClick={prevQuiz} disabled={quizIndex === 0}>Prev</Button>
                          <Button onClick={nextQuiz} disabled={quizIndex >= quiz.length - 1}>Next</Button>
                        </div>
                        <div>
                          {quizCompleted && quizScore && (
                            <div className="text-right">
                              <div className="font-black text-lg">Score: {quizScore.score} / {quizScore.total}</div>
                              <div className="mt-2">
                                <Button onClick={() => { /* show celebration */ alert("🎉 Congrats!"); }} className="bg-yellow-400 text-black">Celebrate 🎉</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "edit" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">EDIT DOCUMENT</h2>
                    <div className="flex gap-2">
                      <Button onClick={() => selectedDocForView ? saveEditedDoc() : alert("Select doc to edit")} className="bg-green-400 text-black">Save</Button>
                      <Button onClick={() => { if (selectedDocForView) { navigator.clipboard?.writeText(editContent); alert("Copied"); } }} className="bg-black">Copy</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 bg-black p-4 border-4 border-white">
                      <div className="mb-4">
                        <div className="font-bold mb-2">Documents</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {docs.map((d) => (
                            <div key={d.id} className={`p-2 border ${d.id === selectedDocForView ? "border-cyan-400" : "border-gray-600"} cursor-pointer`} onClick={() => setSelectedDocForView(d.id)}>
                              <div className="font-bold truncate">{d.name}</div>
                              <div className="text-xs opacity-80">{d.type}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-purple-400">Upload</Button>
                          <Button onClick={() => { setDocs([]); localStorage.removeItem(LS_KEYS.DOCS); }} className="flex-1 bg-red-400">Clear</Button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="font-bold mb-2">Import</div>
                        <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={addLink} className="bg-cyan-400">Import</Button>
                          <Button onClick={addPastedText} className="bg-green-400">Paste</Button>
                        </div>
                        <Textarea placeholder="Paste text..." value={pastedText} onChange={(e) => setPastedText(e.target.value)} className="mt-2" />
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-black p-4 border-4 border-white">
                      <div className="mb-4">
                        <div className="font-bold">Editing: {docs.find(d => d.id === selectedDocForView)?.name || "Select a document"}</div>
                      </div>
                      <Textarea rows={12} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* sidebar */}
          <aside className="lg:col-span-1 space-y-4 sticky top-6">
            <div className="bg-gray-900 p-4 border-4 border-white">
              <div className="flex items-center justify-between mb-3">
                <div className="font-black">TOOLS</div>
                <div className="text-sm opacity-70">{docs.length} docs</div>
              </div>

              {/* upload area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`p-3 border-4 ${dragActive ? "border-yellow-400 bg-yellow-400/5" : "border-gray-600"} mb-3`}
              >
                <div className="flex items-center gap-2">
                  <Upload />
                  <div>Drag & drop or</div>
                  <Button onClick={() => fileInputRef.current?.click()} className="bg-purple-400 text-black">Browse</Button>
                </div>
                <input ref={fileInputRef} type="file" multiple className="hidden" accept=".pdf,.docx,.txt,.md,.html" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              </div>

              {/* generate quick actions */}
              <div className="space-y-2 mb-3">
                <Button onClick={runGenerateNotes} className="w-full bg-green-400">Generate Notes</Button>
                <Button onClick={() => runGenerateFlashcards(10)} className="w-full bg-pink-400">Create Flashcards</Button>
                <Button onClick={() => runGenerateQuiz(10)} className="w-full bg-purple-400">Generate Quiz</Button>
              </div>

              {/* timer */}
              <div className="bg-black p-3 border-2 border-orange-400">
                <div className="flex items-center gap-2 mb-2">
                  <Clock /> <div className="font-black">Timer</div>
                </div>
                <div className="text-center text-2xl font-black mb-2">{formatTime(timerSeconds)}</div>
                <div className="flex gap-2">
                  <Button onClick={() => setTimerRunning(true)} className="flex-1 bg-green-400">Start</Button>
                  <Button onClick={() => setTimerRunning(false)} className="flex-1 bg-yellow-400">Pause</Button>
                  <Button onClick={() => { setTimerSeconds(25 * 60); setTimerRunning(false); }} className="flex-1 bg-red-400">Reset</Button>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button onClick={() => downloadFile(JSON.stringify(docs, null, 2), "docs.json")} className="flex-1 bg-black">Export Docs</Button>
                <Button onClick={() => startNewSession()} className="flex-1 bg-red-500">New Session</Button>
              </div>
            </div>

            {/* AI chat quick toggle */}
            <div className="bg-gray-900 p-4 border-4 border-white">
              <div className="flex items-center justify-between mb-2">
                <div className="font-black">AI TUTOR</div>
                <Button onClick={() => setShowChat((s) => !s)} className="bg-cyan-400 text-black"><MessageCircle /></Button>
              </div>
              {showChat ? (
                <div className="text-sm text-gray-300">Chat is active. Ask questions about selected docs.</div>
              ) : (
                <div className="text-sm text-gray-500">Toggle chat to ask questions.</div>
              )}
            </div>

            {/* docs list */}
            <div className="bg-gray-900 p-4 border-4 border-white">
              <div className="font-black mb-2">Documents</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 border p-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-bold">{d.name}</div>
                      <div className="text-xs opacity-70">{d.type}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button onClick={() => toggleDoc(d.id)}>{d.selected ? "✓" : "▢"}</Button>
                      <Button onClick={() => { setSelectedDocForView(d.id); setActiveTab("edit"); }}><Eye /></Button>
                      <Button onClick={() => removeDoc(d.id)} className="bg-red-400"><Trash2 /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MultiDocSession;
