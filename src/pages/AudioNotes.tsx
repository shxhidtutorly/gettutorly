import { useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { AudioNotesUploader } from "@/components/features/AudioNotesUploader";
import { ArrowLeft } from "lucide-react";

// Optional: define fallback animations if not in your tailwind.config.js
const fadeIn =
  "transition-opacity duration-700 ease-in opacity-0 animate-fade-in";
const fadeInUp =
  "transition-all duration-700 ease-in-out translate-y-4 opacity-0 animate-fade-in-up";

const AudioNotes = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  if (!user) {
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

      {/* Top bar with back button */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-4 md:mt-6 mb-2 px-2 md:px-4 animate-fade-in">
        <button
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-[#21253a] hover:bg-[#262a42] transition font-semibold shadow border border-[#21253a] text-white text-base md:text-lg"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Back to Dashboard</span>
          <span className="inline xs:hidden">Back</span>
        </button>
      </div>

      <main className="flex-1 py-3 md:py-8 px-1 xs:px-2 sm:px-4 pb-24 md:pb-8">
        <div className="w-full max-w-3xl md:max-w-6xl mx-auto bg-[#202741]/70 rounded-2xl shadow-lg p-2 xs:p-4 sm:p-6 md:p-8 animate-fade-in-up">
          {/* Title */}
          <div className="mb-4 md:mb-8 text-center animate-fade-in">
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 justify-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffd600] via-[#f9484a] to-[#4a90e2] drop-shadow">
              <span role="img" aria-label="brain">🧠</span>
              AI Notes Generator
            </h1>
            <p className="text-gray-300 text-sm xs:text-base md:text-lg mt-1 font-medium">
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

      {/* Responsive Animations */}
      <style>{`
        @media (max-width: 640px) {
          .animate-fade-in, .animate-fade-in-up {
            animation-duration: 0.7s;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioNotes;
