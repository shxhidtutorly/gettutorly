import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Neon Brutalist Color Palette
const neonColors = {
  yellow: "border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#ffd600]",
  blue: "border-blue-400 text-blue-400 shadow-[4px_4px_0px_#3b82f6]",
  pink: "border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]",
  green: "border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]",
  cyan: "border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]",
};

const AudioNotes = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-mono">
      <Navbar />

      {/* Top bar with brutalist back button */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl mx-auto flex justify-between items-center mt-4 md:mt-7 mb-2 px-2 md:px-4"
      >
        <button
          className={`flex items-center gap-3 px-5 py-2 border-4 border-yellow-400 bg-black font-black text-yellow-400 text-lg rounded-none shadow-[4px_4px_0px_#ffd600] hover:bg-yellow-400 hover:text-black transition-all duration-200`}
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden xs:inline">Back to Dashboard</span>
          <span className="inline xs:hidden">Back</span>
        </button>
      </motion.div>

      <main className="flex-1 py-3 md:py-8 px-1 xs:px-2 sm:px-4 pb-24 md:pb-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`w-full max-w-3xl md:max-w-5xl mx-auto bg-black border-4 border-blue-400 rounded-none shadow-[8px_8px_0px_#3b82f6] p-2 xs:p-4 sm:p-6 md:p-8`}
        >

          {/* Brutalist Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 text-center"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black flex items-center gap-3 justify-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-400"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
              <Sparkles className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_6px_#ffd600]" />
              AI Notes Generator
            </h1>
            <p className="mt-2 text-lg xs:text-xl font-bold text-pink-500 drop-shadow-[0_0_6px_#ec4899]">
              Transform your lecture recordings into comprehensive study notes 🎓
            </p>
          </motion.div>

          {/* Brutalist Audio Notes Uploader Section w/ animation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <AudioNotesUploader />
          </motion.div>
        </motion.div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AudioNotes;
