
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import AudioNotesUploader from "@/components/features/AudioNotesUploader";
import { ArrowLeft } from "lucide-react";

const AudioNotes = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to access audio notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      {/* Top bar with back button */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-6 mb-2 px-4 animate-fade-in">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21253a] hover:bg-[#262a42] transition font-semibold shadow border border-[#21253a] text-white"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffd600] via-[#f9484a] to-[#4a90e2] drop-shadow">
              🎙️ Audio to AI Notes
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-1">
              Transform your lecture recordings into comprehensive study notes 🎓
            </p>
          </div>

          {/* Audio Notes Component */}
          <div className="animate-fade-in-up">
            <AudioNotesUploader />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AudioNotes;
