import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  RotateCw,
  FileText,
  Info,
  Bold,
  Italic,
  Underline,
  List,
  Undo,
  Redo,
  Trash2,
  Download,
  FileEdit,
  Replace,
} from "lucide-react";

// The brutalist-inspired color palette (same as Humanizer component)
const colors = {
  primary: "#00e6c4", // A vibrant turquoise for accents
  secondary: "#ff5a8f", // A hot pink for contrast
  text: "#e4e4e7", // A soft white for main text
  subText: "#a1a1aa", // A muted gray for secondary text
  background: "#18181b", // A deep charcoal
  cardBg: "#27272a", // A slightly lighter gray for cards
  border: "#3f3f46", // A dark gray for borders
  error: "#f43f5e", // A bold red for errors
  success: "#10b981", // Green for success/high scores
  warning: "#f59e0b", // Orange for medium scores
  danger: "#ef4444", // Red for low scores
};

const TextEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const editorRef = useRef(null);

  // State for editor content
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  
  // State for humanizer
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Neutral");
  const [status, setStatus] = useState("idle"); // idle, processing, completed, error
  const [rewrittenText, setRewrittenText] = useState("");
  const [score, setScore] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedEditorContent = localStorage.getItem("textEditorContent");
    if (savedEditorContent) {
      setContent(savedEditorContent);
      setSavedContent(savedEditorContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = savedEditorContent;
      }
    }
    
    // Check for content passed from Humanizer page
    const humanizedContent = sessionStorage.getItem("humanizedContent");
    if (humanizedContent) {
      setContent(humanizedContent);
      setSavedContent(humanizedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = humanizedContent;
      }
      // Clear the session storage after using it
      sessionStorage.removeItem("humanizedContent");
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    if (content !== savedContent) {
      localStorage.setItem("textEditorContent", content);
      setSavedContent(content);
    }
  }, [content, savedContent]);

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Toolbar button handlers
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current.focus();
  };

  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleBulletList = () => execCommand("insertUnorderedList");
  const handleUndo = () => execCommand("undo");
  const handleRedo = () => execCommand("redo");
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all text?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        setContent("");
      }
    }
  };

  // Copy text to clipboard
  const handleCopy = () => {
    const textToCopy = editorRef.current ? editorRef.current.innerText : "";
    navigator.clipboard.writeText(textToCopy);
    // Could add a toast notification here
  };

  // Download as .txt file
  const handleDownload = () => {
    const textToDownload = editorRef.current ? editorRef.current.innerText : "";
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-editor-content.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Humanize text
  const handleHumanize = async () => {
    const textToHumanize = editorRef.current ? editorRef.current.innerText : "";
    if (!textToHumanize.trim()) {
      setError("Please enter some text to humanize.");
      return;
    }

    setStatus("processing");
    setError(null);
    setProgress(0);

    // Simulate progress while waiting for API response
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 100);

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToHumanize, language, tone }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      setRewrittenText(data.rewrittenText);
      setScore(data.score);
      setExplanation(data.explanation);
      setProgress(100);
      setStatus("completed");
    } catch (err) {
      console.error("Error during humanization:", err);
      setError(`Humanization failed: ${err.message}. Please try again.`);
      setStatus("error");
      clearInterval(progressInterval);
    }
  };

  // Replace original text with humanized version
  const handleReplaceWithHumanized = () => {
    if (rewrittenText && editorRef.current) {
      editorRef.current.innerHTML = rewrittenText;
      setContent(rewrittenText);
      setStatus("idle"); // Reset humanizer status
    }
  };

  // Get score color based on value
  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 76) return colors.success;
    if (scoreValue >= 51) return colors.warning;
    return colors.danger;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background, color: colors.text, fontFamily: 'monospace' }}>
      <header className="py-4 px-6 sm:px-8 border-b-4" style={{ borderColor: colors.border }}>
        <nav className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 font-bold"
            style={{ color: colors.subText }}
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Dashboard</span>
          </motion.button>
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.subText }}>
            <FileEdit size={16} />
            <span>Text Editor</span>
          </div>
        </nav>
      </header>
      <main className="flex-1 py-8 px-4 sm:px-8 pb-24 md:pb-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto p-8 border-4 rounded-lg shadow-2xl"
          style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black flex items-center gap-3 justify-center tracking-tight" style={{ color: colors.text }}>
              Text Editor
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-bold" style={{ color: colors.subText }}>
              Write, edit, and humanize your text with AI assistance.
            </p>
          </div>
          
          {/* Editor Toolbar */}
          <div className="mb-4 p-3 border-4 rounded-lg flex flex-wrap gap-2" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBold}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
              title="Bold"
            >
              <Bold size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleItalic}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
              title="Italic"
            >
              <Italic size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUnderline}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
              title="Underline"
            >
              <Underline size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBulletList}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
              title="Bullet List"
            >
              <List size={20} />
            </motion.button>
            <div className="h-6 w-px mx-1" style={{ backgroundColor: colors.border }}></div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUndo}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
              title="Undo"
            >
              <Undo size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRedo}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
              title="Redo"
            >
              <Redo size={20} />
            </motion.button>
            <div className="h-6 w-px mx-1" style={{ backgroundColor: colors.border }}></div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClearAll}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.error }}
              title="Clear All"
            >
              <Trash2 size={20} />
            </motion.button>
            <div className="flex-grow"></div>
            <div className="flex gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="p-2 rounded-lg text-sm"
                style={{ backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="p-2 rounded-lg text-sm"
                style={{ backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <option value="Neutral">Neutral</option>
                <option value="Formal">Formal</option>
                <option value="Casual">Casual</option>
                <option value="Persuasive">Persuasive</option>
                <option value="Informative">Informative</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Area */}
            <div className="flex flex-col gap-4">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                className="w-full min-h-[400px] p-6 bg-zinc-800 border-4 border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600 overflow-auto"
                style={{ color: colors.text }}
              ></div>
              
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `4px 4px 0px ${colors.secondary}` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-4 border-zinc-700 bg-zinc-800 font-bold tracking-wide rounded-lg shadow-xl"
                  style={{ boxShadow: `2px 2px 0px ${colors.secondary}`, color: colors.text }}
                >
                  <Copy size={18} style={{ color: colors.secondary }} />
                  Copy Text
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `4px 4px 0px ${colors.secondary}` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-4 border-zinc-700 bg-zinc-800 font-bold tracking-wide rounded-lg shadow-xl"
                  style={{ boxShadow: `2px 2px 0px ${colors.secondary}`, color: colors.text }}
                >
                  <Download size={18} style={{ color: colors.secondary }} />
                  Download .txt
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `4px 4px 0px ${colors.primary}` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleHumanize}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-4 border-zinc-700 bg-zinc-800 font-bold tracking-wide rounded-lg shadow-xl ml-auto"
                  style={{ boxShadow: `2px 2px 0px ${colors.primary}`, color: colors.text }}
                >
                  <Sparkles size={18} style={{ color: colors.primary }} />
                  Humanize Text
                </motion.button>
              </div>
            </div>
            
            {/* Humanized Text Preview */}
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-zinc-800 border-4 border-zinc-700 rounded-lg"
                  style={{ color: colors.subText }}
                >
                  <FileText size={48} style={{ color: colors.primary, opacity: 0.5 }} />
                  <p className="mt-4 text-center font-bold">
                    Click "Humanize Text" to see the AI-improved version here.
                  </p>
                </motion.div>
              )}
              
              {status === "processing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-zinc-800 border-4 border-zinc-700 rounded-lg"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="p-4 rounded-full border-4 border-zinc-700"
                  >
                    <RotateCw size={48} style={{ color: colors.primary }} />
                  </motion.div>
                  <h2 className="mt-4 text-xl font-black tracking-wide text-center" style={{ color: colors.text }}>
                    Humanizing Your Text...
                  </h2>
                  <div className="w-full h-8 mt-4 bg-zinc-900 border-4 border-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{
                        backgroundColor: colors.primary,
                        width: `${progress}%`,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.div>
              )}
              
              {status === "completed" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4 min-h-[400px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={24} style={{ color: colors.primary }} />
                      <h2 className="text-xl font-black tracking-wide" style={{ color: colors.text }}>
                        Humanized Text
                      </h2>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="relative flex items-center justify-center"
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center border-4 font-bold text-lg"
                        style={{ 
                          borderColor: getScoreColor(score),
                          color: getScoreColor(score),
                          backgroundColor: "rgba(0,0,0,0.3)"
                        }}
                      >
                        {score}
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="flex-grow bg-zinc-800 p-6 border-4 border-zinc-700 rounded-lg shadow-inner overflow-auto">
                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: colors.text }}>
                      {rewrittenText}
                    </p>
                  </div>
                  
                  <div className="text-sm font-bold" style={{ color: getScoreColor(score) }}>
                    {explanation}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `4px 4px 0px ${colors.primary}` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReplaceWithHumanized}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-4 border-zinc-700 bg-zinc-800 font-bold tracking-wide rounded-lg shadow-xl"
                    style={{ boxShadow: `2px 2px 0px ${colors.primary}`, color: colors.text }}
                  >
                    <Replace size={18} style={{ color: colors.primary }} />
                    Replace Original Text
                  </motion.button>
                </motion.div>
              )}
              
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-zinc-800 border-4 border-zinc-700 rounded-lg"
                  style={{ color: colors.error }}
                >
                  <p className="text-center font-bold">
                    {error || "An error occurred while humanizing your text. Please try again."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
      <footer className="w-full py-4 text-center text-sm font-light border-t-4" style={{ color: colors.subText, borderColor: colors.border }}>
        © 2025 Tutorly. All rights reserved.
      </footer>
    </div>
  );
};

export default TextEditor;
