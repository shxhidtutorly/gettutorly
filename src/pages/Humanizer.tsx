import { useState } from "react";
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
  X,
  FileEdit,
} from "lucide-react";

// The brutalist-inspired color palette (same as other components)
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

const Humanizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State for form inputs
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Neutral");
  
  // State for API response
  const [status, setStatus] = useState("idle"); // idle, processing, completed, error
  const [rewrittenText, setRewrittenText] = useState("");
  const [score, setScore] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
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
        body: JSON.stringify({ text: inputText, language, tone }),
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

  // Copy output to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenText);
    // Could add a toast notification here
  };
  
  // Open text editor with humanized text
  const handleEditText = () => {
    sessionStorage.setItem("humanizedContent", rewrittenText);
    navigate("/text-editor");
  };

  // Get score color based on value
  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 76) return colors.success;
    if (scoreValue >= 51) return colors.warning;
    return colors.danger;
  };

  // Render the main content based on status
  const renderContent = () => {
    switch (status) {
      case "idle":
      case "error":
        return (
          <div className="flex flex-col gap-6 w-full">
            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-6">
                <label 
                  htmlFor="input-text" 
                  className="block mb-2 font-bold tracking-wide"
                  style={{ color: colors.text }}
                >
                  Enter your text
                </label>
                <textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type your text here..."
                  className="w-full h-40 p-4 bg-zinc-800 border-4 border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
                  style={{ color: colors.text }}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label 
                    htmlFor="language" 
                    className="block mb-2 font-bold tracking-wide"
                    style={{ color: colors.text }}
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 bg-zinc-800 border-4 border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
                    style={{ color: colors.text }}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
                
                <div>
                  <label 
                    htmlFor="tone" 
                    className="block mb-2 font-bold tracking-wide"
                    style={{ color: colors.text }}
                  >
                    Tone
                  </label>
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 bg-zinc-800 border-4 border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
                    style={{ color: colors.text }}
                  >
                    <option value="Neutral">Neutral</option>
                    <option value="Formal">Formal</option>
                    <option value="Casual">Casual</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Informative">Informative</option>
                  </select>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.secondary}` }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg shadow-xl"
                style={{ boxShadow: `4px 4px 0px ${colors.primary}` }}
              >
                <Sparkles size={24} style={{ color: colors.primary }} />
                Humanize Text
              </motion.button>
            </form>
          </div>
        );
        
      case "processing":
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="p-4 rounded-full border-4 border-zinc-700"
            >
              <RotateCw size={48} style={{ color: colors.primary }} />
            </motion.div>
            <h2 className="text-2xl font-black tracking-wide text-center" style={{ color: colors.text }}>
              Humanizing Your Text...
            </h2>
            <div className="w-full h-8 bg-zinc-800 border-4 border-zinc-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-sm font-bold mt-2" style={{ color: colors.subText }}>
              Please wait, this may take a moment.
            </p>
          </motion.div>
        );
        
      case "completed":
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full flex flex-col gap-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText size={32} style={{ color: colors.primary }} />
                <h2 className="text-2xl sm:text-3xl font-black tracking-wide" style={{ color: colors.text }}>
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
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4 font-bold text-xl"
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
            
            <div className="relative bg-zinc-800 p-6 border-4 border-zinc-700 rounded-lg shadow-inner max-h-[300px] overflow-auto">
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: colors.text }}>
                {rewrittenText}
              </p>
            </div>
            
            <div className="text-sm font-bold" style={{ color: getScoreColor(score) }}>
              {explanation}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.secondary}` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 font-black tracking-wide rounded-lg shadow-xl"
              style={{ boxShadow: `4px 4px 0px ${colors.secondary}`, color: colors.text }}
            >
              <Copy size={24} style={{ color: colors.secondary }} />
              Copy Output
            </motion.button>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.secondary}` }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditText}
                      className="flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 font-black tracking-wide rounded-lg shadow-xl flex-1"
                      style={{ boxShadow: `4px 4px 0px ${colors.secondary}`, color: colors.text }}
                    >
                      <FileEdit size={24} style={{ color: colors.secondary }} />
                      Edit Text
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.primary}` }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setInputText("");
                        setStatus("idle");
                      }}
                      className="flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 font-black tracking-wide rounded-lg shadow-xl flex-1"
                      style={{ boxShadow: `4px 4px 0px ${colors.primary}`, color: colors.text }}
                    >
                      <Sparkles size={24} style={{ color: colors.primary }} />
                      Start New Session
                    </motion.button>
                  </div>
          </motion.div>
        );
        
      default:
        return null;
    }
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
            <Info size={16} />
            <span>AI Humanizer</span>
          </div>
        </nav>
      </header>
      <main className="flex-1 py-8 px-4 sm:px-8 pb-24 md:pb-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl mx-auto p-8 border-4 rounded-lg shadow-2xl"
          style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black flex items-center gap-3 justify-center tracking-tight" style={{ color: colors.text }}>
              AI Humanizer
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-bold" style={{ color: colors.subText }}>
              Transform AI-generated content into natural, human-like writing.
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-[400px] flex items-center justify-center"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center font-bold"
              style={{ color: colors.error }}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </main>
      <footer className="w-full py-4 text-center text-sm font-light border-t-4" style={{ color: colors.subText, borderColor: colors.border }}>
        © 2025 Tutorly. All rights reserved.
      </footer>
    </div>
  );
};

export default Humanizer;
