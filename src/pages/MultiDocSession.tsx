// src/pages/MultiDocSession.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  CheckSquare,
  Square,
  X,
  File,
  Brain,
  FileCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  ArrowRight,
} from "lucide-react";
import { extractTextFromFile, type ExtractionResult } from "@/lib/fileExtractor";
import { extractTextFromUrl } from "@/lib/jinaReader";
import { generateNotesAI, generateFlashcardsAI } from "@/lib/aiNotesService";
import { QuizCard } from "@/components/quiz/QuizCard";

// --- Local types & constants ---
interface SessionDoc {
  id: string;
  name: string;
  type: string;
  text: string;
  selected: boolean;
}
type QuizQuestion = { question: string; options: string[]; correct?: number; correctAnswer?: number };
type ActiveTab = "content" | "summary" | "notes" | "flashcards" | "quiz";

const GITHUB_RAW_AI = "https://raw.githubusercontent.com/shxhidtutorly/university-logos/main/ai.png";
const MAX_COMBINED_TEXT_LENGTH = 140_000; // safety cap for frontend prompt size
const BATCH_CHUNK = 100_000; // chunk size for batch processing

// --- Utility helpers ---
const readFileAsText = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result ?? ""));
    r.onerror = rej;
    r.readAsText(file);
  });

const tryParseJSON = (maybe: string) => {
  try {
    return JSON.parse(maybe);
  } catch {
    return null;
  }
};

const stripMarkdownTOCAndMetadata = (s: string) => {
  // Heuristic clean: remove "Title & Metadata" section and long TOC blocks,
  // remove bracketed TOC links and multiple repeated headings.
  let out = s;

  // Remove "Title & Metadata" block if present
  out = out.replace(/Title\s*&\s*Metadata[\s\S]*?(?=\n\n|$)/gi, "");

  // Remove typical "Table of Contents" lists of bracketed links
  out = out.replace(/\[(?:[^\]]+)\]\([^)]+\)/g, ""); // remove [label](link)
  out = out.replace(/Table of Contents[:\s\S]*?(?=\n\n|$)/gi, "");

  // Remove multiple repeated header/directives often from AI scaffolding
  out = out.replace(/\[.*?#.*?\]\(.*?\)/g, ""); // remove [..](..#..)
  out = out.replace(/-{3,}/g, "\n"); // replace horizontal rules

  // Trim long repeated whitespace/lines
  out = out
    .split("\n")
    .map((ln) => ln.trimRight())
    .filter((ln, idx, arr) => {
      // drop lines that are extremely short repeated noise
      if (/^[-_*]{2,}$/.test(ln)) return false;
      if (ln.length === 0 && arr[idx + 1] && arr[idx + 1].length === 0) return false;
      return true;
    })
    .join("\n");

  // If still too long or obviously scaffold, try to extract "Executive Summary" or "Key Takeaways" sections
  const execIdx = out.search(/Executive Summary|Key Takeaways|Executive summary|Summary:/i);
  if (execIdx > 0) {
    out = out.slice(execIdx);
  }

  // Final trim
  return out.trim();
};

// Dynamic confetti: try to use canvas-confetti if available
const runConfetti = async (good = true) => {
  try {
    // try dynamic import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: good ? 120 : 60,
      spread: good ? 90 : 50,
      origin: { y: 0.35 },
    });
  } catch {
    // fallback small DOM confetti
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#06b6d4", "#a78bfa", "#ec4899"];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.pointerEvents = "none";
      el.style.width = `${Math.random() * 8 + 6}px`;
      el.style.height = `${Math.random() * 8 + 6}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * -20 - 10}px`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? "2px" : "50%";
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.opacity = "0.95";
      el.style.transition = "transform 1.6s linear, top 1.6s linear, opacity 0.5s linear";
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.top = `${window.innerHeight + 20}px`;
        el.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`;
      });
      setTimeout(() => (el.style.opacity = "0"), 1400);
      setTimeout(() => el.remove(), 2000);
    }
  }
};

// Chunking helper for batch calls (simple heuristic)
const chunkText = (text: string, size = BATCH_CHUNK) => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const part = text.slice(i, i + size);
    chunks.push(part);
    i += size;
  }
  return chunks;
};

// --- Component ---
const MultiDocSession: React.FC = () => {
  const { toast } = useToast();

  // Docs
  const [docs, setDocs] = useState<SessionDoc[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import states
  const [pastedText, setPastedText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Tabs & UI
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // AI outputs
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [flashcards, setFlashcards] = useState<{ id: string; question: string; answer: string }[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Tutorly / chat
  const [isTutorVisible, setIsTutorVisible] = useState(true);
  const [chatUseAllDocs, setChatUseAllDocs] = useState(true);
  const [chatDocId, setChatDocId] = useState<string | null>(null);

  // Timer (fixed top bar)
  const [durationMin, setDurationMin] = useState(25);
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => setTimeLeft(durationMin * 60), [durationMin]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          toast({ title: "⏰ Time's up!", description: "Study timer finished." });
          runConfetti(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning]);

  // Combined text
  const selectedDocs = useMemo(() => docs.filter((d) => d.selected), [docs]);
  const combinedTextRaw = useMemo(() => selectedDocs.map((d) => `# ${d.name}\n\n${d.text}`).join("\n\n---\n\n"), [selectedDocs]);

  const combinedText = useMemo(() => {
    if (!combinedTextRaw) return "";
    if (combinedTextRaw.length > MAX_COMBINED_TEXT_LENGTH) {
      toast({
        title: "⚠️ Content truncated",
        description: "Combined content is very large — using a chunk for generation. Use Batch mode for full processing.",
      });
      return combinedTextRaw.slice(0, MAX_COMBINED_TEXT_LENGTH);
    }
    return combinedTextRaw;
  }, [combinedTextRaw, toast]);

  const hasSelectedDocs = selectedDocs.length > 0;
  const docsEmpty = docs.length === 0;

  // Basic doc helpers
  const addDocs = (newOnes: SessionDoc[]) => {
    setDocs((prev) => [...newOnes, ...prev]);
    if (newOnes.length) setActiveTab("content");
  };
  const toggleDoc = (id: string) => setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)));
  const selectAll = (checked: boolean) => setDocs((prev) => prev.map((d) => ({ ...d, selected: checked })));
  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  // ---- File handling (fix: always present hidden input) ----
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files as FileList);
    if (!arr.length) return;
    setIsLoading(true);
    setProgress(10);
    try {
      const added: SessionDoc[] = [];
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        // Use your existing extractor (PDF -> text)
        let text = "";
        try {
          const res: ExtractionResult = await extractTextFromFile(f);
          text = res.text;
        } catch {
          // fallback: text read
          try {
            text = await readFileAsText(f as File);
          } catch {
            text = "";
          }
        }
        added.push({
          id: `${Date.now()}-${i}-${f.name}`,
          name: f.name,
          type: f.type || "unknown",
          text,
          selected: true,
        });
        setProgress(10 + Math.round(((i + 1) / arr.length) * 60));
      }
      addDocs(added);
      toast({ title: `✅ Added ${added.length} document(s)` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to add files" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onHiddenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      handleFiles(e.target.files);
      e.currentTarget.value = "";
    }
  };

  // Add pasted text
  const addPastedText = () => {
    if (!pastedText.trim()) return;
    const id = `${Date.now()}-paste`;
    addDocs([{ id, name: `Pasted ${new Date().toLocaleTimeString()}`, type: "text", text: pastedText.trim(), selected: true }]);
    setPastedText("");
    toast({ title: "✅ Text added" });
  };

  // Add url
  const addLink = async () => {
    if (!/^https?:\/\//i.test(linkUrl)) {
      toast({ variant: "destructive", title: "❌ Enter a valid URL" });
      return;
    }
    setIsLoading(true);
    setProgress(20);
    try {
      const res = await extractTextFromUrl(linkUrl);
      if (res.success) {
        const id = `${Date.now()}-url`;
        addDocs([{ id, name: res.title || linkUrl, type: "html", text: res.content || "", selected: true }]);
        toast({ title: "✅ Imported from URL" });
      } else {
        toast({ variant: "destructive", title: "❌ Failed to import", description: res.error });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to import URL" });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setLinkUrl("");
    }
  };

  // ---- Batch processing helper for AI calls ----
  const callAIWithChunks = async (promptGenerator: (chunk: string, idx: number) => any, text: string) => {
    // Splits `text` into chunks and calls promptGenerator for each, concatenates responses
    const chunks = chunkText(text, BATCH_CHUNK);
    const responses: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      setProgress(Math.round(((i + 1) / chunks.length) * 80));
      try {
        const res = await promptGenerator(chunks[i], i);
        if (res?.response) responses.push(res.response);
        else if (typeof res === "string") responses.push(res);
      } catch (e) {
        console.error("Chunk call failed", e);
      }
      // small gap to avoid rate bursts
      await new Promise((r) => setTimeout(r, 300));
    }
    setProgress(100);
    return responses.join("\n\n");
  };

  // ---- Summary (uses batch if necessary) ----
  const runSummary = async () => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(10);
    try {
      let output = "";
      if (combinedTextRaw.length > BATCH_CHUNK) {
        // chunked summarization
        output = await callAIWithChunks(
          async (chunk) =>
            fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: `Summarize concisely:\n\n${chunk}`, model: "together" }),
            }).then((r) => r.json()),
          combinedTextRaw
        );
      } else {
        const resp = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: combinedText, filename: "Tutorly Session" }) });
        const data = await resp.json();
        output = data.summary || data.response || "";
        if (!output) {
          // fallback
          const fallback = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Summarize:\n\n${combinedText}`, model: "together" }) });
          const fdata = await fallback.json();
          output = fdata.response || "";
        }
      }
      setSummary(output.trim());
      setActiveTab("summary");
      toast({ title: "✅ Summary ready" });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to generate summary" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // ---- Notes (cleaned) ----
  const runNotes = async () => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(10);
    try {
      let raw = "";
      if (combinedTextRaw.length > BATCH_CHUNK) {
        raw = await callAIWithChunks(
          async (chunk) =>
            fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Create study notes (concise, bullet points):\n\n${chunk}`, model: "together" }) })
              .then((r) => r.json()),
          combinedTextRaw
        );
      } else {
        const note = await generateNotesAI(combinedText, "Tutorly Session");
        raw = note?.content || "";
        if (!raw) {
          const resp = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Create study notes (concise bullet points):\n\n${combinedText}`, model: "together" }) });
          const data = await resp.json();
          raw = data.response || "";
        }
      }
      const cleaned = stripMarkdownTOCAndMetadata(raw || "");
      setNotes(cleaned || raw || "No notes generated.");
      setActiveTab("notes");
      toast({ title: "✅ Notes ready" });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to generate notes" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // ---- Flashcards ----
  const runFlashcards = async (count: number) => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(10);
    try {
      // chunking/flavor simplified - we just send combinedText or first chunk
      const input = combinedTextRaw.length > BATCH_CHUNK ? combinedTextRaw.slice(0, BATCH_CHUNK) : combinedText;
      const prompt = `Generate ${count} flashcards from the material. Return only JSON array like: [{ "question": "...", "answer": "..." }, ...] \n\nMaterial:\n\n${input}`;
      const resp = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, model: "together" }) });
      const data = await resp.json();
      const raw = String(data.response || "");
      let parsed: any[] = [];
      try {
        const m = raw.match(/\[[\s\S]*\]/);
        parsed = m ? JSON.parse(m[0]) : JSON.parse(raw);
      } catch (err) {
        console.error("Flashcards parse failed:", err, raw);
        // fallback: try to eval-safe by extracting lines like Q: A:
        toast({ variant: "destructive", title: "❌ Could not parse flashcards JSON" });
        return;
      }
      const cards = parsed.slice(0, count).map((c: any, i: number) => ({ id: `fc-${Date.now()}-${i}`, question: c.question || c.front || "Question", answer: c.answer || c.back || "Answer" }));
      setFlashcards(cards);
      setActiveTab("flashcards");
      toast({ title: `✅ ${cards.length} flashcards generated` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to generate flashcards" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // ---- Quiz ----
  const runQuiz = async () => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(10);
    try {
      const input = combinedTextRaw.length > BATCH_CHUNK ? combinedTextRaw.slice(0, BATCH_CHUNK) : combinedText;
      const prompt = `Create a multiple-choice quiz (10 questions) from the study material. Return strict JSON: { "questions": [ { "question": "...", "options": ["...","...","...","..."], "correct": <index 0-3> } ] } No extra text.\n\nMaterial:\n\n${input}`;
      const resp = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, model: "together" }) });
      const data = await resp.json();
      const raw = String(data.response || "");
      let parsed = tryParseJSON(raw.match(/\{[\s\S]*\}/)?.[0] || raw) as { questions?: QuizQuestion[] } | null;
      if (!parsed) {
        // last resort cleanup
        const cleaned = raw.replace(/^[^{]+/, "").replace(/```json|```/g, "").trim();
        parsed = tryParseJSON(cleaned);
      }
      if (!parsed?.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        console.error("Invalid quiz payload:", parsed, raw);
        toast({ variant: "destructive", title: "❌ Invalid quiz format from AI" });
        return;
      }
      // normalize correct field name
      const normalized: QuizQuestion[] = parsed.questions.map((q: any) => {
        const correct = typeof q.correct === "number" ? q.correct : typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
        return { question: q.question || "Question", options: q.options || ["", "", "", ""], correct };
      });
      setQuiz(normalized);
      setQuizIndex(0);
      setQuizAnswers(new Array(normalized.length).fill(-1));
      setIsCompleted(false);
      setActiveTab("quiz");
      toast({ title: "✅ Quiz generated!" });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to generate quiz" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Quiz helpers
  const quizCurrent = useMemo(() => (quiz && quiz.length > 0 ? quiz[quizIndex] : null), [quiz, quizIndex]);

  const selectAnswer = (optIndex: number) => {
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[quizIndex] = optIndex;
      return next;
    });
  };

  const handlePrev = () => {
    setIsCompleted(false);
    setQuizIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = async () => {
    if (!quiz) return;
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      // finish
      setIsCompleted(true);
      const score = quiz.reduce((acc, q, idx) => acc + ((quizAnswers[idx] === (q.correct ?? q.correctAnswer ?? 0)) ? 1 : 0), 0);
      // nice confetti if good
      try {
        await runConfetti(score >= Math.max(1, Math.floor(quiz.length * 0.6)));
      } catch { /* ignore */ }
    }
  };

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.reduce((acc, q, idx) => acc + ((quizAnswers[idx] === (q.correct ?? q.correctAnswer ?? 0)) ? 1 : 0), 0);
  }, [quiz, quizAnswers]);

  // Chat context text
  const chatContextText = useMemo(() => {
    if (!chatUseAllDocs && chatDocId) {
      const d = docs.find((x) => x.id === chatDocId);
      return d ? `# ${d.name}\n\n${d.text}` : "";
    }
    return combinedTextRaw;
  }, [chatUseAllDocs, chatDocId, docs, combinedTextRaw]);

  // UI helpers
  const tabs = [
    { id: "content" as ActiveTab, label: "Materials", color: "yellow" },
    { id: "summary" as ActiveTab, label: "Summary", color: "blue" },
    { id: "notes" as ActiveTab, label: "Notes", color: "green" },
    { id: "flashcards" as ActiveTab, label: "Flashcards", color: "pink" },
    { id: "quiz" as ActiveTab, label: "Quizzes", color: "purple" },
  ];

  const getColorClasses = (color: string, active = false) => {
    const map: Record<string, string> = {
      yellow: active ? "bg-yellow-400 text-black border-yellow-400" : "bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black",
      blue: active ? "bg-blue-400 text-black border-blue-400" : "bg-black text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black",
      green: active ? "bg-green-400 text-black border-green-400" : "bg-black text-green-400 border-green-400 hover:bg-green-400 hover:text-black",
      pink: active ? "bg-pink-400 text-black border-pink-400" : "bg-black text-pink-400 border-pink-400 hover:bg-pink-400 hover:text-black",
      purple: active ? "bg-purple-400 text-black border-purple-400" : "bg-black text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-black",
    };
    return map[color] || map.yellow;
  };

  // format time helper
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  // --- Render ---
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navbar />

      {/* Fixed top timer bar */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-gray-900 border-b-4 border-yellow-400 p-3">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4">
          <div>
            <div className="text-xs text-gray-300 font-bold">STUDY TIMER</div>
            <div className="flex items-center gap-3">
              <div className="font-black text-2xl">{fmt(timeLeft)}</div>
              <div className="flex gap-2">
                <Button onClick={() => setTimerRunning((v) => !v)} className="bg-gray-300 text-black border-black px-3 py-1 font-black">
                  {timerRunning ? "PAUSE" : "START"}
                </Button>
                <Button onClick={() => { setTimerRunning(false); setTimeLeft(durationMin * 60); }} className="bg-gray-300 text-black border-black px-3 py-1 font-black">
                  RESET
                </Button>
              </div>
              <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="bg-black text-white border-2 border-gray-700 px-2 py-1">
                <option value={5}>5 min</option>
                <option value={15}>15 min</option>
                <option value={25}>25 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>

          <div className="flex-1 px-6">
            <div className="bg-black h-3 rounded overflow-hidden border-2 border-white">
              <div className="h-full bg-yellow-400" style={{ width: `${Math.min(100, Math.max(0, Math.round(((durationMin * 60 - timeLeft) / (durationMin * 60)) * 100)))}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-300 font-bold">TUTORLY</div>
              <div className="font-black">AI Study Session</div>
            </div>
            {/* Avatar */}
            <img src={GITHUB_RAW_AI} alt="Tutorly" className="w-12 h-12 rounded-full border-4 border-black object-cover shadow-[6px_6px_0px_#22d3ee]" onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; }} />
          </div>
        </div>
      </div>

      {/* keep space for fixed bar */}
      <div style={{ height: 92 }} />

      <main className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-block bg-yellow-400 text-black px-6 py-2 font-black text-2xl mb-2 transform -rotate-1 shadow-[8px_8px_0px_#fbbf24]">TUTORLY TOOLS</div>
              <h1 className="text-4xl font-black text-white mb-1">TUTORLY STUDY SESSION</h1>
              <p className="text-gray-400 font-bold">UPLOAD • ANALYZE • LEARN</p>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* small helper: batch mode hint */}
              <div className="text-sm text-gray-400">
                {combinedTextRaw.length > BATCH_CHUNK ? <span>Batch mode available for large content</span> : <span>Ready</span>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {tabs.map((t) => (
              <motion.button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-3 border-4 font-black text-sm ${getColorClasses(t.color, activeTab === t.id)} shadow-[4px_4px_0px_rgba(0,0,0,0.3)]`} whileTap={{ scale: 0.98 }}>
                <span>{t.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25 }} className="bg-gray-900 border-4 border-white p-6 shadow-[12px_12px_0px_rgba(255,255,255,0.04)]">
                {/* Hidden file input (always present) */}
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.html" className="hidden" onChange={onHiddenFileChange} />

                {/* Content tab */}
                {activeTab === "content" && (
                  <>
                    {docs.length === 0 ? (
                      <>
                        <div className="text-center py-12">
                          <h2 className="text-3xl font-black mb-3">IMPORT CONTENT</h2>
                          <p className="text-gray-400 mb-8">Upload files, paste text, or import a URL.</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-purple-400 text-black p-6 border-4 border-black shadow-[8px_8px_0px_#a855f7]">
                              <div className="font-black">ADD FILES</div>
                            </div>
                            <div className="bg-cyan-400 text-black p-6 border-4 border-black shadow-[8px_8px_0px_#22d3ee]" onClick={() => (document.getElementById("link-input") as HTMLInputElement)?.focus()}>
                              <div className="font-black">IMPORT URL</div>
                            </div>
                            <div className="bg-green-400 text-black p-6 border-4 border-black shadow-[8px_8px_0px_#22c55e]" onClick={() => (document.getElementById("text-input") as HTMLTextAreaElement)?.focus()}>
                              <div className="font-black">PASTE TEXT</div>
                            </div>
                          </div>

                          <div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={onDrop} className={`border-4 border-dashed p-12 mb-8 ${dragActive ? "border-yellow-400 bg-yellow-400/10" : "border-gray-600"}`}>
                            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <div className="font-black text-xl">DRAG & DROP FILES</div>
                            <div className="text-gray-400 mt-2">PDF, DOCX, PPT, TXT, MD</div>
                          </div>

                          <div className="space-y-4">
                            <Textarea id="text-input" value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder="Paste text..." className="min-h-[120px]" />
                            <div className="flex gap-2">
                              <Button onClick={addPastedText} disabled={!pastedText.trim()} className="bg-green-400 text-black">ADD TEXT</Button>
                              <Input id="link-input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
                              <Button onClick={addLink} disabled={!linkUrl.trim()} className="bg-cyan-400 text-black">IMPORT</Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-black">DOCUMENTS ({docs.length})</h2>
                          <div className="flex gap-2">
                            <Button onClick={() => selectAll(true)} className="bg-yellow-400 text-black">SELECT ALL</Button>
                            <Button onClick={() => selectAll(false)} className="bg-gray-400 text-black">DESELECT ALL</Button>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                          {docs.map((doc, idx) => (
                            <motion.div key={doc.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className={`flex items-center gap-4 p-4 border-4 ${doc.selected ? "bg-yellow-400 text-black border-black" : "bg-black text-white border-gray-600"}`} onClick={() => toggleDoc(doc.id)}>
                              <div>{doc.selected ? <CheckSquare /> : <Square />}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-black truncate">{doc.name}</div>
                                <div className="text-xs">{doc.type}</div>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={(e) => { e.stopPropagation(); setSelectedDocForView(selectedDocForView === doc.id ? null : doc.id); }} className="bg-blue-400 text-black p-2"><Eye /></Button>
                                <Button onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }} className="bg-red-400 text-black p-2"><Trash2 /></Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {selectedDocForView && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 bg-black border-4 border-blue-400 p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div className="font-black text-blue-400">VIEW: {docs.find((d) => d.id === selectedDocForView)?.name}</div>
                              <Button onClick={() => setSelectedDocForView(null)} className="bg-red-400 text-black"><X /></Button>
                            </div>
                            <div className="max-h-64 overflow-y-auto bg-gray-900 p-3">
                              <pre className="whitespace-pre-wrap text-gray-300">{docs.find((d) => d.id === selectedDocForView)?.text}</pre>
                            </div>
                          </motion.div>
                        )}

                        <div className="bg-gray-900 border-4 border-white p-6 mb-4">
                          <div className="mb-3 font-black">GENERATE AI CONTENT ({hasSelectedDocs ? selectedDocs.length : 0} DOCS SELECTED)</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button onClick={runSummary} disabled={isLoading || !hasSelectedDocs} className="bg-blue-400 text-black">SUMMARY</Button>
                            <Button onClick={runNotes} disabled={isLoading || !hasSelectedDocs} className="bg-green-400 text-black">NOTES</Button>
                            <Button onClick={() => runFlashcards(10)} disabled={isLoading || !hasSelectedDocs} className="bg-pink-400 text-black">FLASHCARDS</Button>
                            <Button onClick={runQuiz} disabled={isLoading || !hasSelectedDocs} className="bg-purple-400 text-black">QUIZ</Button>
                          </div>
                        </div>

                        <div className="bg-black border-4 border-yellow-400 p-4">
                          <div className="font-black text-yellow-400 mb-2">ADD MORE CONTENT</div>
                          <div className="flex gap-2">
                            <Button onClick={() => fileInputRef.current?.click()} className="bg-purple-400 text-black"><Plus /> ADD FILES</Button>
                            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Add URL..." />
                            <Button onClick={addLink} disabled={!linkUrl.trim()} className="bg-cyan-400 text-black">ADD</Button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Summary tab */}
                {activeTab === "summary" && (
                  <div>
                    <h2 className="text-3xl font-black text-blue-400 mb-4">SUMMARY</h2>
                    {summary ? <div className="bg-black border-4 border-blue-400 p-6"><pre className="whitespace-pre-wrap">{summary}</pre></div> : <div className="text-center py-12"><p className="font-black">NO SUMMARY YET</p><Button onClick={runSummary} disabled={isLoading || !hasSelectedDocs} className="bg-blue-400 text-black mt-4">GENERATE</Button></div>}
                  </div>
                )}

                {/* Notes tab */}
                {activeTab === "notes" && (
                  <div>
                    <h2 className="text-3xl font-black text-green-400 mb-4">NOTES</h2>
                    {notes ? <div className="bg-black border-4 border-green-400 p-6"><pre className="whitespace-pre-wrap">{notes}</pre></div> : <div className="text-center py-12"><p className="font-black">NO NOTES YET</p><Button onClick={runNotes} disabled={isLoading || !hasSelectedDocs} className="bg-green-400 text-black mt-4">GENERATE</Button></div>}
                  </div>
                )}

                {/* Flashcards tab */}
                {activeTab === "flashcards" && (
                  <div>
                    <h2 className="text-3xl font-black text-pink-400 mb-4">FLASHCARDS</h2>
                    {flashcards.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{flashcards.map((c, i) => <FlashcardComponent key={c.id} card={c} index={i} />)}</div> : <div className="text-center py-12"><p className="font-black">NO FLASHCARDS YET</p><Button onClick={() => runFlashcards(10)} disabled={isLoading || !hasSelectedDocs} className="bg-pink-400 text-black mt-4">GENERATE</Button></div>}
                  </div>
                )}

                {/* Quiz tab */}
                {activeTab === "quiz" && (
                  <div>
                    <h2 className="text-3xl font-black text-purple-400 mb-4">AI QUIZ</h2>

                    {quiz && isCompleted ? (
                      <div className="text-center py-8">
                        <div className="bg-green-400 w-24 h-24 mx-auto flex items-center justify-center border-4 border-black mb-4"><CheckSquare className="w-12 h-12 text-black" /></div>
                        <h3 className="font-black text-2xl mb-2">🎉 QUIZ COMPLETE</h3>
                        <p className="mb-4">Score: <span className="text-purple-400 font-black">{score}</span> / {quiz.length}</p>
                        <div className="space-y-3 text-left max-w-3xl mx-auto">
                          {quiz.map((q, i) => (
                            <div key={i} className="p-3 border-2 border-black bg-gray-900">
                              <div className="font-bold mb-1">{i + 1}. {q.question}</div>
                              <div className={quizAnswers[i] === (q.correct ?? q.correctAnswer ?? 0) ? "text-green-400 font-bold" : "text-red-400 font-bold"}>Your: {quizAnswers[i] >= 0 ? q.options[quizAnswers[i]] : "No answer"}</div>
                              <div className="text-purple-400">Correct: {q.options[(q.correct ?? q.correctAnswer ?? 0)]}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex gap-3 justify-center">
                          <Button onClick={() => { setQuizAnswers(new Array(quiz.length).fill(-1)); setQuizIndex(0); setIsCompleted(false); }} className="bg-gray-400 text-black">Retake</Button>
                          <Button onClick={() => { setQuiz(null); setQuizAnswers([]); setQuizIndex(0); setIsCompleted(false); setActiveTab("content"); }} className="bg-purple-400 text-black">Close</Button>
                        </div>
                      </div>
                    ) : quiz && quizCurrent ? (
                      <div>
                        <div className="bg-black border-4 border-purple-400 p-6 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-black text-purple-400">QUESTION {quizIndex + 1} OF {quiz.length}</div>
                            <div className="flex gap-1">
                              {quiz.map((_, idx) => <div key={idx} className={`w-4 h-4 border-2 ${idx === quizIndex ? "bg-purple-400" : quizAnswers[idx] !== -1 ? "bg-green-400" : "bg-gray-600"}`} />)}
                            </div>
                          </div>

                          <QuizCard question={quizCurrent.question} options={quizCurrent.options} questionNumber={quizIndex + 1} totalQuestions={quiz.length} selectedAnswer={quizAnswers[quizIndex] ?? null} onAnswerSelect={selectAnswer} />
                        </div>

                        <div className="flex justify-between">
                          <Button disabled={quizIndex === 0} onClick={handlePrev} className="bg-gray-400 text-black"><ChevronLeft /> PREV</Button>
                          <Button onClick={handleNext} className="bg-gray-400 text-black">{quizIndex >= quiz.length - 1 ? "FINISH" : "NEXT"} <ChevronRight /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="font-black mb-3">NO QUIZ YET</p>
                        <Button onClick={runQuiz} disabled={isLoading || !hasSelectedDocs} className="bg-purple-400 text-black">GENERATE QUIZ</Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar / Tutorly */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-900 border-4 border-cyan-400 p-4 shadow-[8px_8px_0px_#22d3ee]">
                <div className="flex items-center gap-3 mb-3">
                  <img src={GITHUB_RAW_AI} alt="Tutorly" className="w-14 h-14 rounded-full border-4 border-black object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; }} />
                  <div>
                    <div className="font-black text-cyan-400">TUTORLY</div>
                    <div className="text-xs text-gray-400">Your AI study helper</div>
                  </div>
                  <div className="ml-auto">
                    <Button onClick={() => setIsTutorVisible((v) => !v)} className="bg-gray-400 text-black px-3 py-1">{isTutorVisible ? "HIDE" : "SHOW"}</Button>
                  </div>
                </div>

                {isTutorVisible ? (
                  <ChatBox contextText={chatContextText} docs={docs} selectedDocId={chatDocId} setSelectedDocId={setChatDocId} />
                ) : (
                  <div className="text-center py-6">
                    <div className="font-black text-gray-400">TUTORLY is hidden</div>
                    <div className="text-xs text-gray-500 mt-2">Click SHOW to open the assistant</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating restore button when hidden */}
      {!isTutorVisible && (
        <button onClick={() => setIsTutorVisible(true)} title="Show Tutorly" style={{ position: "fixed", right: 24, bottom: 24, zIndex: 9999 }} className="w-14 h-14 rounded-full bg-cyan-400 border-4 border-black shadow-[6px_6px_0px_#22d3ee]">
          <img src={GITHUB_RAW_AI} alt="Tutorly" className="w-full h-full object-cover rounded-full" />
        </button>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MultiDocSession;

/* ---------- Flashcard component ---------- */
const FlashcardComponent: React.FC<{ card: { id: string; question: string; answer: string }; index: number }> = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} onClick={() => setIsFlipped((s) => !s)} className="cursor-pointer">
      <div className="relative w-full h-44 perspective">
        <div className={`absolute inset-0 transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`} style={{ transformStyle: "preserve-3d" }}>
          <div style={{ backfaceVisibility: "hidden" }} className="absolute inset-0 bg-pink-400 text-black border-4 border-black p-4 flex flex-col justify-center">
            <div className="font-black text-sm mb-2">QUESTION</div>
            <div className="font-bold text-lg">{card.question}</div>
          </div>
          <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 bg-green-400 text-black border-4 border-black p-4 flex flex-col justify-center">
            <div className="font-black text-sm mb-2">ANSWER</div>
            <div className="font-bold text-lg">{card.answer}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- ChatBox (TUTORLY) ---------- */
const ChatBox: React.FC<{ contextText: string; docs: SessionDoc[]; selectedDocId: string | null; setSelectedDocId: (id: string | null) => void }> = ({ contextText, docs, selectedDocId, setSelectedDocId }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const ask = async () => {
    if (!input.trim()) return;
    if (!contextText.trim()) {
      toast({ title: "Select documents first" });
      return;
    }
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Use the study materials to answer concisely:\n\n<materials>\n${contextText}\n</materials>\n\nQuestion: ${q}`, model: "groq" }) });
      const data = await resp.json();
      setMessages((m) => [...m, { role: "assistant", content: data.response || "No answer" }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { role: "assistant", content: "Error fetching answer." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  const suggestions = ["What are the main topics?", "Summarize key points", "Create a study plan", "Explain difficult concepts"];

  return (
    <div className="flex flex-col h-96">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-gray-400">Chat scope</div>
        <div className="flex gap-2">
          <button onClick={() => { setSelectedDocId(null); }} className={`px-2 py-1 text-xs font-black border-2 ${!selectedDocId ? "bg-cyan-400 text-black" : "bg-black text-cyan-400"}`}>ALL</button>
          <button onClick={() => { if (docs[0]) setSelectedDocId(docs[0].id); }} className={`px-2 py-1 text-xs font-black border-2 ${selectedDocId ? "bg-cyan-400 text-black" : "bg-black text-cyan-400"}`}>SINGLE</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <div className="bg-black border-4 border-cyan-400 p-4 mb-3">
              <div className="font-black text-cyan-400">ASK TUTORLY</div>
            </div>
            {suggestions.map((s, i) => <button key={i} onClick={() => setInput(s)} className="block w-full text-left bg-black border-2 border-gray-700 px-3 py-2 mb-2">{s}</button>)}
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`p-3 ${m.role === "user" ? "bg-cyan-400 text-black self-end text-right" : "bg-black text-white border-2 border-cyan-400"}`}>
              <div className="text-xs font-black mb-1">{m.role === "user" ? "YOU" : "TUTORLY"}</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))
        )}
        {loading && <div className="text-sm text-gray-400">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} placeholder="Ask Tutorly..." />
        <Button onClick={ask} disabled={!input.trim() || loading || !contextText.trim()} className="bg-cyan-400 text-black">{loading ? "..." : <ArrowRight />}</Button>
      </div>
    </div>
  );
};
