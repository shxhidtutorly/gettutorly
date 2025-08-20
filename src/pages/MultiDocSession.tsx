/*
 * CHANGES: Rebranded to TUTORLY, fixed Add Files availability, added full-width timer bar, hideable tutor with floating restore, robust quiz parsing with confetti, batch mode for large docs
 * WHY: Improve UX with better branding, always-available file upload, prominent timer, and robust AI content generation
 * TESTING: 1) Add 1 PDF -> appears under Documents, 2) Generate Quiz -> loads/navigate/finish/see score+confetti, 3) Hide Tutorly -> chat hidden with floating avatar restore
 */

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
  Play,
  Pause,
  RotateCcw,
  Minimize2,
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
  correct: number;
}

type ActiveTab = "content" | "summary" | "notes" | "flashcards" | "quiz";

const GITHUB_RAW_AI =
  "https://raw.githubusercontent.com/shxhidtutorly/university-logos/main/ai.png";

const MAX_COMBINED_TEXT_LENGTH = 120_000; // safety cap for frontend prompt size
const BATCH_CHUNK_SIZE = 80_000; // chunk size for batch processing

// Dynamic confetti import with fallback
const playConfetti = async () => {
  try {
    const confetti = await import('canvas-confetti');
    confetti.default({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    // Fallback DOM confetti
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#06b6d4", "#a78bfa", "#ec4899"];
    const count = 50;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.pointerEvents = "none";
      el.style.width = `${Math.random() * 8 + 4}px`;
      el.style.height = `${Math.random() * 8 + 4}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * -20 - 10}px`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = "50%";
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.opacity = "0.9";
      el.style.transition = "transform 2s linear, top 2s linear, opacity 0.5s linear";
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.top = `${window.innerHeight + 40}px`;
        el.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`;
      });

      setTimeout(() => el.style.opacity = "0", 1800);
      setTimeout(() => el.remove(), 2500);
    }
  }
};

/*
 * ACCEPTANCE CHECKLIST:
 * ✅ Timer bar: Full-width sticky top bar with mm:ss display, Start/Pause/Reset, duration dropdown, progress bar
 * ✅ Hideable tutor: Chat sidebar can be hidden, floating avatar button restores it without covering page
 * ✅ Confetti: Dynamic import canvas-confetti with DOM fallback, triggers on quiz completion (60%+ score) and timer end
 * ✅ Quiz parsing: Multiple robust heuristics handle JSON extraction, normalize correct/correctAnswer fields
 * ✅ Batch mode: Large docs (>400k chars) processed in chunks with progress indication and final consolidation
 * ✅ Fixed add files: Hidden input always rendered, Add Files button always functional regardless of doc state
 * ✅ Rebranding: "TUTORLY STUDY SESSION" and "TUTORLY TOOLS" headers, robot avatar from GitHub URL with fallback
 * ✅ Notes cleaning: Removes auto-generated scaffolding like "Title & Metadata" and table of contents
 * ✅ Error handling: Toast notifications for important errors, console.error for debugging traces
 * ✅ Performance: setTimeout delays in batch processing prevent UI freeze, smooth animations with Framer Motion
 */

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");

  // Center output state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [flashcards, setFlashcards] = useState<
    { id: string; question: string; answer: string }[]
  >([]);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Chat / tutor state
  const [isTutorVisible, setIsTutorVisible] = useState(true);
  const [chatUseAllDocs, setChatUseAllDocs] = useState(true);
  const [chatDocId, setChatDocId] = useState<string | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // default 25 minutes
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [timerRunning, setTimerRunning] = useState(false);

  // View state
  const [selectedDocForView, setSelectedDocForView] = useState<string | null>(null);

  const selectedDocs = useMemo(() => docs.filter((d) => d.selected), [docs]);
  const combinedTextRaw = useMemo(
    () =>
      selectedDocs
        .map((d) => `# ${d.name}\n\n${d.text}`)
        .join("\n\n---\n\n"),
    [selectedDocs]
  );

  // Batch processing for large documents
  const shouldUseBatch = useMemo(() => combinedTextRaw.length > 400_000, [combinedTextRaw]);

  const combinedText = useMemo(() => {
    if (!combinedTextRaw) return "";
    if (combinedTextRaw.length > MAX_COMBINED_TEXT_LENGTH && !shouldUseBatch) {
      toast({
        title: "⚠️ Content truncated",
        description:
          "Combined content is very large — using first ~120k chars to generate AI outputs. For full-document results, try smaller batches.",
      });
      return combinedTextRaw.slice(0, MAX_COMBINED_TEXT_LENGTH);
    }
    return combinedTextRaw;
  }, [combinedTextRaw, shouldUseBatch]);

  // Helper states
  const docsEmpty = docs.length === 0;
  const hasSelectedDocs = selectedDocs.length > 0;

  // ----- Basic helpers -----
  const addDocs = (newOnes: SessionDoc[]) => {
    setDocs((prev) => [...newOnes, ...prev]);
    if (newOnes.length > 0) {
      setActiveTab("content");
    }
  };

  const toggleDoc = (id: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)));
  const selectAll = (checked: boolean) => setDocs((prev) => prev.map((d) => ({ ...d, selected: checked })));
  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  // ----- File handlers -----
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setProgress(10);
    setIsLoading(true);
    try {
      const results: SessionDoc[] = [];
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        const res: ExtractionResult = await extractTextFromFile(f);
        results.push({
          id: `${Date.now()}-${i}-${f.name}`,
          name: f.name,
          type: res.fileType,
          text: res.text,
          selected: true,
        });
        setProgress(10 + Math.round(((i + 1) / arr.length) * 50));
      }
      addDocs(results);
      toast({ title: `✅ Added ${results.length} document${results.length > 1 ? "s" : ""}` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "❌ Failed to process files" });
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

  const onHiddenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.currentTarget.value = "";
    }
  };

  // Import: Paste Text
  const addPastedText = () => {
    if (!pastedText.trim()) return;
    const id = `${Date.now()}-paste`;
    addDocs([
      {
        id,
        name: `Pasted Text ${new Date().toLocaleTimeString()}`,
        type: "text",
        text: pastedText.trim(),
        selected: true,
      },
    ]);
    setPastedText("");
    toast({ title: "✅ Text added as document" });
  };

  // Import: Link (web page)
  const addLink = async () => {
    if (!/^https?:\/\//i.test(linkUrl)) {
      toast({ variant: "destructive", title: "❌ Enter a valid URL" });
      return;
    }
    setIsLoading(true);
    setProgress(20);
    try {
      const res = await extractTextFromUrl(linkUrl);
      if (res.success && res.content) {
        const id = `${Date.now()}-url`;
        addDocs([
          {
            id,
            name: res.title || linkUrl,
            type: "html",
            text: res.content,
            selected: true,
          },
        ]);
        toast({ title: "✅ Imported content from link" });
      } else {
        toast({ variant: "destructive", title: "❌ Failed to import from link", description: res.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "❌ Failed to import from link" });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setLinkUrl("");
    }
  };

  // Batch processing helper
  const processBatch = async (text: string, operation: string): Promise<string> => {
    const chunks = [];
    for (let i = 0; i < text.length; i += BATCH_CHUNK_SIZE) {
      chunks.push(text.slice(i, i + BATCH_CHUNK_SIZE));
    }

    toast({
      title: "🔄 Batch Processing",
      description: `Processing ${chunks.length} chunks for better results with large content`,
    });

    const results: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      setProgress(Math.round(((i + 1) / chunks.length) * 90));
      
      let prompt = "";
      switch (operation) {
        case "summary":
          prompt = `Summarize this chunk concisely:\n\n${chunks[i]}`;
          break;
        case "notes":
          prompt = `Create bullet point notes from this content:\n\n${chunks[i]}`;
          break;
        default:
          prompt = chunks[i];
      }

      try {
        const resp = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model: "together" }),
        });
        const data = await resp.json();
        results.push(data.response || "");
        
        // Small delay to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.error(`Batch chunk ${i} failed:`, e);
        results.push(`[Chunk ${i + 1} processing failed]`);
      }
    }

    // Combine results
    const combined = results.join("\n\n");
    if (operation === "summary" || operation === "notes") {
      // Final consolidation pass
      const finalPrompt = `Consolidate these ${operation} chunks into a coherent ${operation}:\n\n${combined}`;
      try {
        const resp = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: finalPrompt, model: "together" }),
        });
        const data = await resp.json();
        return data.response || combined;
      } catch (e) {
        return combined;
      }
    }
    return combined;
  };

  // ----- AI Actions -----
  const runSummary = async () => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(10);
    
    try {
      let result = "";
      
      if (shouldUseBatch) {
        result = await processBatch(combinedTextRaw, "summary");
      } else {
        try {
          setProgress(70);
          const resp = await fetch("/api/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: combinedText, filename: "Tutorly Session" }),
          });
          const data = await resp.json();
          result = data.summary || data.response || "Summary generated.";
        } catch (e) {
          // fallback to /api/ai
          const resp = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: `Summarize clearly and concisely:\n\n${combinedText}`, model: "together" }),
          });
          const data = await resp.json();
          result = data.response || "Summary generated.";
        }
      }
      
      setSummary(result);
      setActiveTab("summary");
      toast({ title: "✅ Summary ready!" });
    } catch (e) {
      console.error("Summary generation failed:", e);
      toast({ variant: "destructive", title: "❌ Failed to generate summary" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Clean notes output by removing auto-generated scaffolding
  const cleanNotesOutput = (rawNotes: string): string => {
    return rawNotes
      .replace(/^.*?(Title & Metadata|Table of Contents).*?\n/gmi, '')
      .replace(/^# Table of Contents.*?\n(?:\s*[-*]\s+.*\n)*/gmi, '')
      .replace(/^#{1,3}\s*(Title|Metadata|Introduction).*?\n/gmi, '')
      .replace(/^---+\s*\n/gm, '')
      .trim();
  };

  const runNotes = async () => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(10);
    
    try {
      let result = "";
      
      if (shouldUseBatch) {
        result = await processBatch(combinedTextRaw, "notes");
      } else {
        setProgress(60);
        const note = await generateNotesAI(combinedText, "Tutorly Session");
        result = note.content;
      }
      
      const cleanedNotes = cleanNotesOutput(result);
      setNotes(cleanedNotes);
      setActiveTab("notes");
      toast({ title: "✅ AI Notes generated!" });
    } catch (e) {
      console.error("Notes generation failed:", e);
      toast({ variant: "destructive", title: "❌ Failed to generate notes" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Robust flashcards generation
  const runFlashcards = async (count: number) => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }
    setIsLoading(true);
    setProgress(60);
    
    try {
      const prompt = `Generate ${count} flashcards from the following study material.
Return a strict JSON array only, where each item has:
- question (string)
- answer (string).
No extra text, no markdown fences.

Material:

${combinedText}`;

      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: "together" }),
      });

      const data = await resp.json();
      const rawResponse = data.response || "";

      // Robust JSON extraction with multiple fallbacks
      let parsed: any[] = [];
      try {
        // Try direct parse first
        parsed = JSON.parse(rawResponse);
      } catch (err1) {
        try {
          // Extract array from text
          const arrayMatch = rawResponse.match(/\[[\s\S]*?\]/);
          if (arrayMatch) {
            parsed = JSON.parse(arrayMatch[0]);
          } else {
            throw new Error("No array found");
          }
        } catch (err2) {
          try {
            // Clean and try again
            const cleaned = rawResponse
              .replace(/```json|```/g, "")
              .replace(/^[^[]*/, "")
              .replace(/[^\]]*$/, "]")
              .trim();
            parsed = JSON.parse(cleaned);
          } catch (err3) {
            console.error("❌ All flashcard parsing attempts failed:", { rawResponse, err1, err2, err3 });
            toast({ variant: "destructive", title: "❌ Could not parse flashcards from AI response" });
            return;
          }
        }
      }

      if (!Array.isArray(parsed)) {
        toast({ variant: "destructive", title: "❌ AI returned invalid flashcard format" });
        return;
      }

      const formattedCards = parsed.slice(0, count).map((card: any, i: number) => ({
        id: `flashcard-${Date.now()}-${i}`,
        question: card.question || card.front || "Question",
        answer: card.answer || card.back || "Answer",
      }));

      setFlashcards(formattedCards);
      setActiveTab("flashcards");
      toast({ title: `✅ Generated ${formattedCards.length} flashcards` });
    } catch (e) {
      console.error("❌ Flashcards generation failed:", e);
      toast({ variant: "destructive", title: "❌ Failed to generate flashcards" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Robust quiz generation with multiple parsing heuristics
  const runQuiz = async () => {
    if (!combinedText.trim()) {
      toast({ variant: "destructive", title: "❌ Select at least one document" });
      return;
    }

    setIsLoading(true);
    setProgress(60);

    try {
      const prompt = `Create a multiple-choice quiz (10 questions) from this study material.
Return strict JSON ONLY with this structure:
{
  "questions": [
    { "question": string, "options": [string, string, string, string], "correct": number }
  ]
}
No explanation, no extra text, no markdown fences.

Material:

${combinedText}`;

      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: "together" }),
      });

      const data = await resp.json();
      const raw = String(data?.response ?? "");

      // Multiple parsing heuristics for robust JSON extraction
      let parsed: { questions: QuizQuestion[] } | null = null;
      
      // Method 1: Direct parse
      try {
        parsed = JSON.parse(raw);
      } catch (err1) {
        // Method 2: Extract first {...} block
        try {
          const objMatch = raw.match(/\{[\s\S]*\}/);
          if (objMatch) {
            const candidate = objMatch[0].replace(/```json|```/g, "").trim();
            parsed = JSON.parse(candidate);
          }
        } catch (err2) {
          // Method 3: Remove leading junk and code fences
          try {
            const cleaned = raw
              .replace(/^[^{]+/, "")
              .replace(/```json|```/g, "")
              .replace(/}[^}]*$/, "}")
              .trim();
            parsed = JSON.parse(cleaned);
          } catch (err3) {
            // Method 4: Try to find questions array directly
            try {
              const questionsMatch = raw.match(/"questions"\s*:\s*\[[\s\S]*?\]/);
              if (questionsMatch) {
                const questionsStr = questionsMatch[0];
                const fullObj = `{${questionsStr}}`;
                parsed = JSON.parse(fullObj);
              }
            } catch (err4) {
              console.error("❌ All quiz parsing methods failed:", { raw, err1, err2, err3, err4 });
              toast({ variant: "destructive", title: "❌ Could not parse quiz JSON from AI response" });
              return;
            }
          }
        }
      }

      if (!parsed?.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        console.error("❌ Invalid quiz payload:", parsed);
        toast({ variant: "destructive", title: "❌ AI returned invalid quiz format" });
        return;
      }

      // Normalize correct field (handle both 'correct' and 'correctAnswer')
      const normalizedQuestions = parsed.questions.map((q: any) => ({
        question: q.question || "Question",
        options: Array.isArray(q.options) ? q.options : ["Option 1", "Option 2", "Option 3", "Option 4"],
        correct: typeof q.correct === "number" ? q.correct : (typeof q.correctAnswer === "number" ? q.correctAnswer : 0)
      }));

      setQuiz(normalizedQuestions);
      setQuizIndex(0);
      setQuizAnswers(Array(normalizedQuestions.length).fill(-1));
      setIsCompleted(false);
      setActiveTab("quiz");
      toast({ title: "✅ Quiz generated!" });
    } catch (e) {
      console.error("❌ Quiz generation failed:", e);
      toast({ variant: "destructive", title: "❌ Failed to generate quiz" });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // ----- Quiz helpers & UI logic -----
  const quizCurrent = useMemo(() => (quiz && quiz.length > 0 ? quiz[quizIndex] : null), [quiz, quizIndex]);

  const selectAnswer = (i: number) =>
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[quizIndex] = i;
      return next;
    });

  const handlePrev = () => {
    setIsCompleted(false);
    setQuizIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setIsCompleted(true);
      const finalScore = quiz.reduce((acc, q, idx) => {
        return acc + (quizAnswers[idx] === q.correct ? 1 : 0);
      }, 0);
      if (finalScore >= Math.ceil(quiz.length * 0.6)) {
        playConfetti();
      }
    }
  };

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.reduce((acc, q, idx) => {
      return acc + (quizAnswers[idx] === q.correct ? 1 : 0);
    }, 0);
  }, [quiz, quizAnswers]);

  // ----- Timer logic -----
  useEffect(() => {
    let t: number | undefined;
    if (timerRunning) {
      t = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            toast({ title: "⏰ Time's up!", description: "Study timer finished." });
            playConfetti();
            // Play beep if possible
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiRru+z9uyAEIXvL6deUOAkZZLjq66xyICEVJHbM7OCY');
              audio.play().catch(() => {});
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [timerRunning, toast]);

  useEffect(() => {
    setTimeLeft(timerSeconds);
  }, [timerSeconds]);

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const timerProgress = ((timerSeconds - timeLeft) / timerSeconds) * 100;

  // ---- Tabs + color helper ----
  const tabs = [
    { id: "content" as ActiveTab, label: "Materials", icon: FileText, color: "yellow" },
    { id: "summary" as ActiveTab, label: "Summary", icon: Zap, color: "blue" },
    { id: "notes" as ActiveTab, label: "Notes", icon: FileCheck, color: "green" },
    { id: "flashcards" as ActiveTab, label: "Flashcards", icon: Brain, color: "pink" },
    { id: "quiz" as ActiveTab, label: "Quizzes", icon: CheckSquare, color: "purple" },
  ];

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors: Record<string, string> = {
      yellow: isActive ? "bg-yellow-400 text-black border-yellow-400" : "bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black",
      blue: isActive ? "bg-blue-400 text-black border-blue-400" : "bg-black text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black",
      green: isActive ? "bg-green-400 text-black border-green-400" : "bg-black text-green-400 border-green-400 hover:bg-green-400 hover:text-black",
      pink: isActive ? "bg-pink-400 text-black border-pink-400" : "bg-black text-pink-400 border-pink-400 hover:bg-pink-400 hover:text-black",
      purple: isActive ? "bg-purple-400 text-black border-purple-400" : "bg-black text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-black",
      cyan: isActive ? "bg-cyan-400 text-black border-cyan-400" : "bg-black text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black",
    };
    return colors[color] || colors.yellow;
  };

  // ----- Chat selection helpers -----
  const chatContextText = useMemo(() => {
    if (!chatUseAllDocs && chatDocId) {
      const d = docs.find((x) => x.id === chatDocId);
      return d ? `# ${d.name}\n\n${d.text}` : "";
    }
    return combinedText;
  }, [chatUseAllDocs, chatDocId, docs, combinedText]);

  // ----- Render -----
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Navbar />

      {/* Fixed Timer Bar */}
      <div className="w-full bg-gray-900 border-b-4 border-white shadow-lg sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="bg-yellow-400 text-black px-4 py-2 font-black border-2 border-black shadow-[4px_4px_0px_#fbbf24] transform -rotate-1">
                STUDY TIMER
              </div>
              <div className="text-3xl font-black text-white">
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="bg-green-400 text-black border-2 border-black font-black hover:bg-green-500 px-4 py-2"
                >
                  {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                  {timerRunning ? "PAUSE" : "START"}
                </Button>
                <Button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimeLeft(timerSeconds);
                  }}
                  className="bg-gray-400 text-black border-2 border-black font-black hover:bg-gray-500 px-4 py-2"
                >
                  <RotateCcw size={16} />
                  RESET
                </Button>
                <select
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="bg-black text-white border-2 border-gray-400 px-3 py-2 font-black"
                >
                  <option value={5 * 60}>5 MIN</option>
                  <option value={15 * 60}>15 MIN</option>
                  <option value={25 * 60}>25 MIN</option>
                  <option value={45 * 60}>45 MIN</option>
                  <option value={60 * 60}>60 MIN</option>
                </select>
              </div>
            </div>

            {/* Tutorly Avatar */}
<div className="flex items-center gap-3">
  <img
    src={GITHUB_RAW_AI}
    alt="Tutorly AI"
    className="w-12 h-12 rounded-full object-cover"
    onError={(e) => {
      const target = e.currentTarget as HTMLImageElement;
      target.src =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><circle cx='24' cy='24' r='24' fill='%2322d3ee'/><text x='50%' y='55%' font-size='16' text-anchor='middle' fill='black' font-family='Arial'>AI</text></svg>";
    }}
  />

  <div>
    <div className="text-lg font-black text-cyan-400">TUTORLY</div>
    <div className="text-xs text-gray-400 font-bold">AI STUDY ASSISTANT</div>
  </div>
</div>

          
          {/* Timer Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-black border-2 border-gray-600 h-2">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${timerProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input always available */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,.html"
        className="hidden"
        onChange={onHiddenFileChange}
      />

      {/* Floating Tutorly Restore Button */}
      {!isTutorVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsTutorVisible(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-cyan-400 text-black border-4 border-black shadow-[8px_8px_0px_#22d3ee] hover:shadow-[12px_12px_0px_#22d3ee] transition-all hover:scale-110 rounded-full"
        >
          <img
            src={GITHUB_RAW_AI}
            alt="Tutorly"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="w-full h-full bg-cyan-400 text-black flex items-center justify-center rounded-full hidden">
            <MessageCircle size={24} />
          </div>
        </motion.button>
      )}

      <main className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-center">
            <div className="inline-block bg-yellow-400 text-black px-6 py-2 font-black text-2xl mb-2 transform -rotate-1 shadow-[8px_8px_0px_#fbbf24]">
              TUTORLY TOOLS
            </div>
            <h1 className="text-4xl font-black text-white mb-2">TUTORLY STUDY SESSION</h1>
            <p className="text-gray-400 font-bold">UPLOAD • ANALYZE • LEARN</p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <AnimatePresence>
          {progress > 0 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              className="mb-6"
            >
              <div className="bg-gray-900 border-4 border-yellow-400 p-4 shadow-[8px_8px_0px_#fbbf24]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 font-black">
                    {shouldUseBatch ? "BATCH PROCESSING..." : "PROCESSING..."}
                  </span>
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

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-4 font-black text-sm transition-all duration-200 transform hover:scale-105 hover:-rotate-1 ${getColorClasses(
                  tab.color,
                  isActive
                )} ${isActive ? "shadow-[6px_6px_0px_rgba(255,255,255,0.2)]" : "shadow-[4px_4px_0px_rgba(255,255,255,0.1)]"}`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className={`grid gap-6 ${isTutorVisible ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
          {/* Main Area */}
          <div className={isTutorVisible ? "lg:col-span-2" : "col-span-1"}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                transition={{ duration: 0.3 }} 
                className="bg-gray-900 border-4 border-white p-6 shadow-[12px_12px_0px_rgba(255,255,255,0.1)]"
              >
                {/* Content Tab */}
                {activeTab === "content" && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <h2 className="text-2xl font-black">
                        {docsEmpty ? "IMPORT CONTENT" : `DOCUMENTS (${docs.length})`}
                      </h2>
                      {!docsEmpty && (
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => selectAll(true)} className="bg-yellow-400 text-black border-4 border-black font-black hover:bg-yellow-500 shadow-[4px_4px_0px_#fbbf24]">
                            SELECT ALL
                          </Button>
                          <Button onClick={() => selectAll(false)} className="bg-gray-400 text-black border-4 border-black font-black hover:bg-gray-500 shadow-[4px_4px_0px_#9ca3af]">
                            DESELECT ALL
                          </Button>
                        </div>
                      )}
                    </div>

                    {docsEmpty && (
                      <div>
                        <p className="text-center text-gray-400 font-bold mb-8">Select the type of content you'd like to import to a new session.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          <motion.div 
                            whileHover={{ scale: 1.02, rotate: -1 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => fileInputRef.current?.click()} 
                            className="bg-purple-400 text-black p-6 border-4 border-black cursor-pointer shadow-[8px_8px_0px_#a855f7] hover:shadow-[12px_12px_0px_#a855f7] transition-all"
                          >
                            <div className="w-12 h-12 bg-black text-purple-400 flex items-center justify-center mb-4 border-2 border-black">
                              <File size={24} />
                            </div>
                            <h3 className="font-black text-xl mb-2">FILE</h3>
                            <p className="font-bold text-sm">Import Files</p>
                          </motion.div>

                          <motion.div 
                            whileHover={{ scale: 1.02, rotate: 1 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => document.getElementById("link-input")?.focus()} 
                            className="bg-cyan-400 text-black p-6 border-4 border-black cursor-pointer shadow-[8px_8px_0px_#22d3ee] hover:shadow-[12px_12px_0px_#22d3ee] transition-all"
                          >
                            <div className="w-12 h-12 bg-black text-cyan-400 flex items-center justify-center mb-4 border-2 border-black">
                              <LinkIcon size={24} />
                            </div>
                            <h3 className="font-black text-xl mb-2">LINK</h3>
                            <p className="font-bold text-sm">Import URL</p>
                          </motion.div>

                          <motion.div 
                            whileHover={{ scale: 1.02, rotate: -1 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => document.getElementById("text-input")?.focus()} 
                            className="bg-green-400 text-black p-6 border-4 border-black cursor-pointer shadow-[8px_8px_0px_#22c55e] hover:shadow-[12px_12px_0px_#22c55e] transition-all"
                          >
                            <div className="w-12 h-12 bg-black text-green-400 flex items-center justify-center mb-4 border-2 border-black">
                              <FileText size={24} />
                            </div>
                            <h3 className="font-black text-xl mb-2">TEXT</h3>
                            <p className="font-bold text-sm">Copy & Paste</p>
                          </motion.div>
                        </div>

                        <div 
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} 
                          onDragLeave={() => setDragActive(false)} 
                          onDrop={onDrop} 
                          className={`border-4 border-dashed p-12 text-center transition-all duration-300 mb-6 ${
                            dragActive ? "border-yellow-400 bg-yellow-400/10 shadow-[8px_8px_0px_#fbbf24]" : "border-gray-600 hover:border-white"
                          }`}
                        >
                          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-xl font-black mb-2">DRAG & DROP FILES HERE</p>
                          <p className="text-gray-400 font-bold">PDF, DOCX, PPT, Images, Videos</p>
                        </div>
                      </div>
                    )}

                    {/* Document List */}
                    {!docsEmpty && (
                      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                        {docs.map((doc, index) => (
                          <motion.div 
                            key={doc.id} 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: index * 0.03 }} 
                            className={`flex items-center gap-4 p-4 border-4 transition-all duration-200 cursor-pointer ${
                              doc.selected 
                                ? "bg-yellow-400 text-black border-black shadow-[6px_6px_0px_#fbbf24]" 
                                : "bg-black text-white border-gray-600 hover:border-white"
                            }`} 
                            onClick={() => toggleDoc(doc.id)}
                          >
                            <div className={`${doc.selected ? "text-black" : "text-yellow-400"}`}>
                              {doc.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <File className={doc.selected ? "text-black" : "text-gray-400"} size={18} />
                            <div className="flex-1 min-w-0">
                              <p className="font-black truncate">{doc.name}</p>
                              <p className={`text-xs font-bold uppercase ${doc.selected ? "text-black/70" : "text-gray-500"}`}>
                                {doc.type}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSelectedDocForView(selectedDocForView === doc.id ? null : doc.id); 
                                }} 
                                size="sm" 
                                className={`${getColorClasses("blue")} p-2`}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  removeDoc(doc.id); 
                                }} 
                                size="sm" 
                                className="bg-red-400 text-black border-2 border-black hover:bg-red-500 p-2"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Document Viewer */}
                    {selectedDocForView && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }} 
                        className="mb-6 bg-black border-4 border-blue-400 p-4 shadow-[6px_6px_0px_#60a5fa]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-black text-blue-400">
                            VIEWING: {docs.find((d) => d.id === selectedDocForView)?.name}
                          </h3>
                          <Button 
                            onClick={() => setSelectedDocForView(null)} 
                            size="sm" 
                            className="bg-red-400 text-black border-2 border-black hover:bg-red-500"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                        <div className="max-h-64 overflow-y-auto bg-gray-900 p-4 border-2 border-blue-400">
                          <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                            {docs.find((d) => d.id === selectedDocForView)?.text}
                          </pre>
                        </div>
                      </motion.div>
                    )}

                    {/* Import Controls - Always Available */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black text-green-400 mb-2">PASTE TEXT</label>
                        <Textarea 
                          id="text-input" 
                          value={pastedText} 
                          onChange={(e) => setPastedText(e.target.value)} 
                          placeholder="Paste your text content here..." 
                          className="bg-black border-4 border-green-400 focus:border-green-400 text-white p-4 font-mono min-h-[120px] shadow-[4px_4px_0px_#22c55e]" 
                        />
                        <Button 
                          onClick={addPastedText} 
                          disabled={!pastedText.trim()} 
                          className="mt-2 bg-green-400 text-black border-4 border-black font-black hover:bg-green-500 shadow-[4px_4px_0px_#22c55e]"
                        >
                          ADD TEXT
                        </Button>
                      </div>

                      <div>
                        <label className="block text-sm font-black text-cyan-400 mb-2">IMPORT URL</label>
                        <div className="flex gap-2">
                          <Input 
                            id="link-input" 
                            value={linkUrl} 
                            onChange={(e) => setLinkUrl(e.target.value)} 
                            placeholder="https://example.com/article" 
                            className="bg-black border-4 border-cyan-400 focus:border-cyan-400 text-white font-mono shadow-[4px_4px_0px_#22d3ee]" 
                          />
                          <Button 
                            onClick={addLink} 
                            disabled={!linkUrl.trim()} 
                            className="bg-cyan-400 text-black border-4 border-black font-black hover:bg-cyan-500 shadow-[4px_4px_0px_#22d3ee]"
                          >
                            IMPORT
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-black text-purple-400 mb-2">UPLOAD FILES</label>
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          className="bg-purple-400 text-black border-4 border-black font-black hover:bg-purple-500 shadow-[4px_4px_0px_#a855f7] w-full"
                        >
                          <Plus className="mr-2" size={16} />
                          ADD FILES
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!docsEmpty && (
                      <div className="bg-gray-900 border-4 border-white p-6 shadow-[8px_8px_0px_rgba(255,255,255,0.1)] mt-6">
                        <h3 className="font-black text-white mb-4">
                          GENERATE AI CONTENT ({hasSelectedDocs ? selectedDocs.length : 0} DOCS SELECTED)
                        </h3>
                        {shouldUseBatch && (
                          <div className="bg-yellow-400 text-black p-3 border-2 border-black mb-4 font-bold text-sm">
                            📊 BATCH MODE: Large content detected - will process in chunks for optimal results
                          </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <Button 
                            onClick={runSummary} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("blue")} font-black shadow-[4px_4px_0px_#60a5fa] hover:shadow-[6px_6px_0px_#60a5fa] transition-all`}
                          >
                            <Zap className="mr-2" size={16} />
                            SUMMARY
                          </Button>
                          <Button 
                            onClick={runNotes} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("green")} font-black shadow-[4px_4px_0px_#22c55e] hover:shadow-[6px_6px_0px_#22c55e] transition-all`}
                          >
                            <FileCheck className="mr-2" size={16} />
                            NOTES
                          </Button>
                          <Button 
                            onClick={() => runFlashcards(10)} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("pink")} font-black shadow-[4px_4px_0px_#ec4899] hover:shadow-[6px_6px_0px_#ec4899] transition-all`}
                          >
                            <Brain className="mr-2" size={16} />
                            FLASHCARDS
                          </Button>
                          <Button 
                            onClick={runQuiz} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("purple")} font-black shadow-[4px_4px_0px_#a855f7] hover:shadow-[6px_6px_0px_#a855f7] transition-all`}
                          >
                            <CheckSquare className="mr-2" size={16} />
                            QUIZ
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {activeTab === "summary" && (
                  <div>
                    <h2 className="text-3xl font-black text-blue-400 mb-6">SUMMARY</h2>
                    {summary ? (
                      <div className="bg-black border-4 border-blue-400 p-6 shadow-[8px_8px_0px_#60a5fa]">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono">{summary}</pre>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-blue-400 w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_#60a5fa]">
                          <Zap className="w-12 h-12 text-black" />
                        </div>
                        <p className="text-xl font-black mb-4">NO SUMMARY YET</p>
                        <p className="text-gray-400 font-bold mb-8">Select documents and generate summary</p>
                        <Button 
                          onClick={runSummary} 
                          disabled={isLoading || !hasSelectedDocs} 
                          className={`${getColorClasses("blue")} font-black text-lg px-8 py-4 shadow-[6px_6px_0px_#60a5fa]`}
                        >
                          GENERATE SUMMARY
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {activeTab === "notes" && (
                  <div>
                    <h2 className="text-3xl font-black text-green-400 mb-6">NOTES</h2>
                    {notes ? (
                      <div className="bg-black border-4 border-green-400 p-6 shadow-[8px_8px_0px_#22c55e]">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono">{notes}</pre>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-green-400 w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_#22c55e]">
                          <FileCheck className="w-12 h-12 text-black" />
                        </div>
                        <p className="text-xl font-black mb-4">NO NOTES YET</p>
                        <p className="text-gray-400 font-bold mb-8">Select documents and generate AI notes</p>
                        <Button 
                          onClick={runNotes} 
                          disabled={isLoading || !hasSelectedDocs} 
                          className={`${getColorClasses("green")} font-black text-lg px-8 py-4 shadow-[6px_6px_0px_#22c55e]`}
                        >
                          GENERATE NOTES
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcards */}
                {activeTab === "flashcards" && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <h2 className="text-3xl font-black text-pink-400">FLASHCARDS</h2>
                      {flashcards.length > 0 && (
                        <div className="flex gap-2">
                          <Button onClick={() => runFlashcards(5)} className="bg-pink-400 text-black border-2 border-black font-black hover:bg-pink-500">
                            5 CARDS
                          </Button>
                          <Button onClick={() => runFlashcards(10)} className="bg-pink-400 text-black border-2 border-black font-black hover:bg-pink-500">
                            10 CARDS
                          </Button>
                          <Button onClick={() => runFlashcards(20)} className="bg-pink-400 text-black border-2 border-black font-black hover:bg-pink-500">
                            20 CARDS
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
                      <div className="text-center py-16">
                        <div className="bg-pink-400 w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_#ec4899]">
                          <Brain className="w-12 h-12 text-black" />
                        </div>
                        <p className="text-xl font-black mb-4">NO FLASHCARDS YET</p>
                        <p className="text-gray-400 font-bold mb-8">Select documents and generate flashcards</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Button 
                            onClick={() => runFlashcards(5)} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("pink")} font-black shadow-[6px_6px_0px_#ec4899]`}
                          >
                            5 CARDS
                          </Button>
                          <Button 
                            onClick={() => runFlashcards(10)} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("pink")} font-black shadow-[6px_6px_0px_#ec4899]`}
                          >
                            10 CARDS
                          </Button>
                          <Button 
                            onClick={() => runFlashcards(20)} 
                            disabled={isLoading || !hasSelectedDocs} 
                            className={`${getColorClasses("pink")} font-black shadow-[6px_6px_0px_#ec4899]`}
                          >
                            20 CARDS
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz */}
                {activeTab === "quiz" && (
                  <div>
                    <h2 className="text-3xl font-black text-purple-400 mb-6">AI QUIZ</h2>

                    {/* Quiz Completed */}
                    {quiz && isCompleted ? (
                      <div className="text-center py-16">
                        <div className="bg-green-400 w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_#22c55e] animate-bounce">
                          <CheckSquare className="w-12 h-12 text-black" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">🎉 QUIZ COMPLETE!</h3>
                        <p className="text-xl mb-4">
                          You scored <span className="text-purple-400 font-black">{score}</span> / {quiz.length}
                        </p>
                        <p className="text-lg mb-8 font-bold">
                          {score >= Math.ceil(quiz.length * 0.6) ? "🌟 Great job!" : "📚 Keep studying!"}
                        </p>

                        <div className="space-y-3 text-left max-w-3xl mx-auto mb-8">
                          {quiz.map((q, i) => (
                            <div key={i} className="p-4 border-4 border-gray-600 bg-gray-900">
                              <p className="font-bold mb-2 text-white">
                                {i + 1}. {q.question}
                              </p>
                              <div className="space-y-1">
                                <p className={`font-bold ${quizAnswers[i] === q.correct ? "text-green-400" : "text-red-400"}`}>
                                  Your Answer: {quizAnswers[i] >= 0 ? q.options[quizAnswers[i]] : "Not answered"}
                                </p>
                                <p className="text-purple-400 font-bold">
                                  Correct: {q.options[q.correct]}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center gap-4">
                          <Button
                            onClick={() => {
                              setQuizAnswers(Array(quiz.length).fill(-1));
                              setQuizIndex(0);
                              setIsCompleted(false);
                            }}
                            className="bg-gray-400 text-black border-4 border-black font-black px-6 py-3 shadow-[4px_4px_0px_#9ca3af]"
                          >
                            RETAKE
                          </Button>
                          <Button
                            onClick={() => {
                              setQuiz(null);
                              setQuizAnswers([]);
                              setQuizIndex(0);
                              setIsCompleted(false);
                              setActiveTab("content");
                            }}
                            className="bg-purple-400 text-black border-4 border-black font-black px-6 py-3 shadow-[4px_4px_0px_#a855f7]"
                          >
                            CLOSE
                          </Button>
                        </div>
                      </div>
                    ) : quiz && quizCurrent ? (
                      <div className="space-y-6">
                        <div className="bg-black border-4 border-purple-400 p-6 shadow-[8px_8px_0px_#a855f7]">
                          <div className="flex items-center justify-between mb-6">
                            <span className="font-black text-purple-400 text-lg">
                              QUESTION {quizIndex + 1} OF {quiz.length}
                            </span>
                            <div className="flex gap-1">
                              {quiz.map((_, index) => (
                                <div 
                                  key={index} 
                                  className={`w-4 h-4 border-2 border-black ${
                                    index === quizIndex 
                                      ? "bg-purple-400" 
                                      : quizAnswers[index] !== -1 
                                      ? "bg-green-400" 
                                      : "bg-gray-600"
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>

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
                            onClick={handlePrev} 
                            className="bg-gray-400 text-black border-4 border-black font-black disabled:opacity-50 shadow-[4px_4px_0px_#9ca3af]"
                          >
                            <ChevronLeft size={16} className="mr-2" />
                            PREV
                          </Button>

                          <Button 
                            onClick={handleNext} 
                            className="bg-purple-400 text-black border-4 border-black font-black shadow-[4px_4px_0px_#a855f7]"
                          >
                            {quizIndex >= quiz.length - 1 ? "FINISH" : "NEXT"}
                            <ChevronRight size={16} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-purple-400 w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_#a855f7]">
                          <CheckSquare className="w-12 h-12 text-black" />
                        </div>
                        <p className="text-xl font-black mb-4">NO QUIZ YET</p>
                        <p className="text-gray-400 font-bold mb-8">Select documents and generate quiz</p>
                        <Button 
                          onClick={runQuiz} 
                          disabled={isLoading || !hasSelectedDocs} 
                          className={`${getColorClasses("purple")} font-black text-lg px-8 py-4 shadow-[6px_6px_0px_#a855f7]`}
                        >
                          GENERATE QUIZ
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

       {/* Sidebar - Chat / Tutorly */}
{isTutorVisible && (
  <div className="lg:col-span-1">
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-900 border-4 border-cyan-400 p-6 shadow-[8px_8px_0px_#22d3ee] sticky top-32"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* AI Avatar */}
          <img
            src={GITHUB_RAW_AI}
            alt="Tutorly AI"
            className="w-14 h-14 border-4 border-black shadow-[4px_4px_0px_#22d3ee] bg-cyan-400 rounded-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='black'><rect width='100%' height='100%' fill='%2322d3ee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' font-family='Arial'>AI</text></svg>";
            }}
          />

          <div>
            <h3 className="text-xl font-black text-cyan-400">TUTORLY</h3>
            <p className="text-gray-400 font-bold text-sm">Your AI study helper</p>
          </div>
        </div>

        <Button
          onClick={() => setIsTutorVisible(false)}
          size="sm"
          className="bg-gray-600 text-white border-2 border-gray-400 hover:bg-gray-700 p-2"
          aria-label="Hide Tutorly"
        >
          <Minimize2 size={16} />
        </Button>
      </div>

      <ChatBox
        contextText={chatContextText}
        docs={docs}
        selectedDocId={chatDocId}
        setSelectedDocId={setChatDocId}
        chatUseAllDocs={chatUseAllDocs}
        setChatUseAllDocs={setChatUseAllDocs}
      />
    </motion.div>
  </div>
)}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MultiDocSession;

/* ---------- FlashcardComponent ---------- */
const FlashcardComponent: React.FC<{ 
  card: { id: string; question: string; answer: string }; 
  index: number 
}> = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.1 }} 
      className="h-48 cursor-pointer" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div 
        className="w-full h-full relative" 
        animate={{ rotateY: isFlipped ? 180 : 0 }} 
        transition={{ duration: 0.6 }} 
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full bg-pink-400 text-black border-4 border-black p-4 flex flex-col justify-center shadow-[6px_6px_0px_#ec4899]" 
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <div className="bg-black text-pink-400 px-3 py-1 font-black text-xs mb-4 inline-block border-2 border-pink-400">
              QUESTION
            </div>
            <p className="font-bold text-lg leading-tight">{card.question}</p>
            <div className="text-xs font-bold mt-4 opacity-70">CLICK TO REVEAL</div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full bg-green-400 text-black border-4 border-black p-4 flex flex-col justify-center shadow-[6px_6px_0px_#22c55e]" 
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <div className="bg-black text-green-400 px-3 py-1 font-black text-xs mb-4 inline-block border-2 border-green-400">
              ANSWER
            </div>
            <p className="font-bold text-lg leading-tight">{card.answer}</p>
            <div className="text-xs font-bold mt-4 opacity-70">CLICK FOR QUESTION</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------- ChatBox Component ---------- */
const ChatBox: React.FC<{ 
  contextText: string; 
  docs: SessionDoc[]; 
  selectedDocId: string | null; 
  setSelectedDocId: (id: string | null) => void;
  chatUseAllDocs: boolean;
  setChatUseAllDocs: (use: boolean) => void;
}> = ({ contextText, docs, selectedDocId, setSelectedDocId, chatUseAllDocs, setChatUseAllDocs }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async () => {
    if (!input.trim() || !contextText.trim()) {
      if (!contextText.trim()) toast({ title: "Select documents first" });
      return;
    }
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Use the following study materials to answer concisely and helpfully.\n\n<materials>\n${contextText}\n</materials>\n\nQuestion: ${q}`,
          model: "groq",
        }),
      });
      const data = await resp.json();
      setMessages((m) => [...m, { role: "assistant", content: data.response || "No response" }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { role: "assistant", content: "Error fetching answer." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  const suggestedQuestions = [
    "What are the main topics?", 
    "Summarize key points", 
    "Create a study plan", 
    "Explain difficult concepts"
  ];

  return (
    <div className="flex flex-col h-96">
      {/* Chat scope controls */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-xs text-gray-400 font-bold">CHAT SCOPE:</div>
        <div className="flex gap-2">
          <button 
            onClick={() => { 
              setChatUseAllDocs(true); 
              setSelectedDocId(null); 
            }} 
            className={`px-3 py-1 text-xs font-black border-2 transition-all ${
              chatUseAllDocs 
                ? "bg-cyan-400 text-black border-black" 
                : "bg-black text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black"
            }`}
          >
            ALL DOCS
          </button>
          <button 
            onClick={() => { 
              setChatUseAllDocs(false); 
              if (docs.length > 0 && !selectedDocId) setSelectedDocId(docs[0].id); 
            }} 
            className={`px-3 py-1 text-xs font-black border-2 transition-all ${
              !chatUseAllDocs 
                ? "bg-cyan-400 text-black border-black" 
                : "bg-black text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black"
            }`}
          >
            SINGLE DOC
          </button>
        </div>
      </div>

      {/* Single doc selector */}
      {!chatUseAllDocs && docs.length > 0 && (
        <div className="mb-4">
          <select 
            value={selectedDocId || ""} 
            onChange={(e) => setSelectedDocId(e.target.value || null)} 
            className="w-full bg-black text-white border-2 border-gray-700 px-2 py-1 text-sm font-bold"
          >
            <option value="">Choose document...</option>
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
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
            <p className="font-black text-cyan-400 text-center mb-4">ASK TUTORLY</p>
            {suggestedQuestions.map((question, index) => (
              <motion.button 
                key={index} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.1 }} 
                onClick={() => setInput(question)} 
                className="block w-full text-left bg-black border-2 border-gray-600 hover:border-cyan-400 px-3 py-2 text-xs font-bold transition-all hover:shadow-[4px_4px_0px_#22d3ee]"
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
              className={`p-3 border-4 text-sm font-bold ${
                message.role === "user" 
                  ? "bg-cyan-400 text-black border-black ml-4 shadow-[4px_4px_0px_#22d3ee]" 
                  : "bg-black text-white border-cyan-400 mr-4 shadow-[4px_4px_0px_#22d3ee]"
              }`}
            >
              <div className={`text-xs font-black mb-1 ${
                message.role === "user" ? "text-black/70" : "text-cyan-400"
              }`}>
                {message.role === "user" ? "YOU" : "TUTORLY"}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </motion.div>
          ))
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-black text-white border-4 border-cyan-400 p-3 mr-4 shadow-[4px_4px_0px_#22d3ee]"
          >
            <div className="text-xs font-black text-cyan-400 mb-1">TUTORLY</div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <span className="text-xs font-bold">THINKING...</span>
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
          placeholder="Ask Tutorly..." 
          className="bg-black border-2 border-cyan-400 text-white font-mono text-sm font-bold focus:border-cyan-400 shadow-[2px_2px_0px_#22d3ee]" 
          disabled={loading || !contextText} 
        />
        <Button 
          onClick={ask} 
          disabled={loading || !input.trim() || !contextText} 
          className="bg-cyan-400 text-black border-4 border-black font-black hover:bg-cyan-500 shadow-[4px_4px_0px_#22d3ee] px-4"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight size={16} />
          )}
        </Button>
      </div>
    </div>
  );
};
