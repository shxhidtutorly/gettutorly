// src/pages/AudioNotes.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import AudioNotesUploader from "@/components/features/AudioNotesUploader";
import { ArrowLeft } from "lucide-react";

const AudioNotes = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/auth/signin");
  }, [user, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-2xl font-bold">Audio Notes</h1>
        </div>

        <AudioNotesUploader />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AudioNotes;
