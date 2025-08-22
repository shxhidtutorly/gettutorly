import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  CloudUpload,
  RotateCw,
  FileText,
  Download,
  Info,
} from "lucide-react";

// The brutalist-inspired color palette
const colors = {
  primary: "#00d4b6", // Softer turquoise (still vibrant but easier on the eyes)
  secondary: "#ff4d80", // Slightly deeper pink for contrast
  text: "#e4e4e7", // Soft white for readability
  subText: "#9ca3af", // Softer muted gray for secondary text
  background: "#18181b", // Deep charcoal (good for brutalist dark mode)
  cardBg: "#1f1f23", // Darker but distinct card background
  border: "#2d2d32", // Subtle border that doesn’t overpower
  error: "#f43f5e", // Keep red bold for errors
  recording: "#e11d48", // Slightly darker red for recording state
};

const MAX_DAILY_UPLOADS = 15;
const MAX_FILE_SIZE_MB = 50; // Max file size in megabytes

const AudioNotes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  // Load last transcript and initialize rate limit from localStorage
  useEffect(() => {
    const storedTranscript = localStorage.getItem("lastTranscript");
    if (storedTranscript) {
      setLastTranscript(storedTranscript);
    }
    const storedCount = localStorage.getItem("uploadCount");
    const storedDate = localStorage.getItem("lastUploadDate");

    const today = new Date().toDateString();

    if (storedDate === today) {
      setUploadCount(parseInt(storedCount, 10) || 0);
    } else {
      localStorage.setItem("uploadCount", 0);
      localStorage.setItem("lastUploadDate", today);
      setUploadCount(0);
    }
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (status === "transcribing") {
      const start = Date.now();
      const duration = 20000; // 20 seconds
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const newProgress = Math.min((elapsed / duration) * 100, 99);
        setProgress(newProgress);
        if (newProgress >= 99) {
          clearInterval(intervalRef.current);
        }
      }, 50);
    } else {
      clearInterval(intervalRef.current);
      if (status !== "completed") setProgress(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const checkRateLimit = () => {
    if (uploadCount >= MAX_DAILY_UPLOADS) {
      setError(`Daily limit reached. You can upload up to ${MAX_DAILY_UPLOADS} audios per day.`);
      return false;
    }
    return true;
  };

  const incrementUploadCount = () => {
    const newCount = uploadCount + 1;
    setUploadCount(newCount);
    localStorage.setItem("uploadCount", newCount);
  };

  const startRecording = async () => {
    if (!checkRateLimit()) return;
    setError(null);
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        stream.getTracks().forEach((track) => track.stop());
        handleProcessAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setStatus("recording");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setStatus("uploading");
    }
  };

  const handleProcessAudio = async (audioBlob) => {
    setStatus("transcribing");
    setError(null);

    incrementUploadCount();
    
    try {
      const getUrlResponse = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `audio-${Date.now()}.${audioBlob.type.split('/')[1].split(';')[0]}`,
          filetype: audioBlob.type,
        }),
      });
      const { signedUrl, publicUrl } = await getUrlResponse.json();

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: audioBlob,
        headers: { "Content-Type": audioBlob.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload audio to S3. Status: ${uploadResponse.status}`);
      }

      const transcriptResponse = await fetch("/api/audio-to-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_url: publicUrl }),
      });

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json().catch(() => ({}));
        throw new Error(errorData.details || `Transcription API call failed with status: ${transcriptResponse.status}`);
      }

      const data = await transcriptResponse.json();
      if (data.transcript) {
        setTranscript(data.transcript);
        localStorage.setItem("lastTranscript", data.transcript);
        setStatus("completed");
      } else {
        throw new Error("No transcript received from the API.");
      }
    } catch (err) {
      console.error("Error during transcription:", err);
      setError(`Transcription failed: ${err.message}. Please try again.`);
      setStatus("idle");
    }
  };

  const handleFileUpload = (event) => {
    if (!checkRateLimit()) return;
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setError(null);
      handleProcessAudio(file);
    }
  };

  const handleDownload = () => {
    if (transcript) {
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcript.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <div className="flex flex-col items-center gap-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-lg font-bold text-zinc-400"
            >
              Choose an option to transcribe your audio.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.secondary}` }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="w-full flex-1 flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg shadow-xl"
                style={{ boxShadow: `4px 4px 0px ${colors.primary}` }}
              >
                <Mic size={24} style={{ color: colors.primary }} />
                Record Lecture
              </motion.button>
              <motion.label
                whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.secondary}` }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex-1 flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg cursor-pointer shadow-xl"
                htmlFor="file-upload"
                style={{ boxShadow: `4px 4px 0px ${colors.primary}` }}
              >
                <CloudUpload size={24} style={{ color: colors.primary }} />
                Upload Audio File
                <input
                  id="file-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </motion.label>
            </div>
            {lastTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full mt-8 p-6 border-4 border-zinc-700 bg-zinc-800 rounded-lg shadow-inner"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileText style={{ color: colors.primary }} />
                  <h3 className="text-xl font-bold tracking-wide text-zinc-200">
                    Last Session Transcript
                  </h3>
                </div>
                <p className="text-zinc-400 text-sm italic font-light max-h-40 overflow-auto whitespace-pre-wrap">
                  {lastTranscript.substring(0, 500)}...
                </p>
              </motion.div>
            )}
          </div>
        );
      case "recording":
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
              }}
              className="p-4 rounded-full border-4"
              style={{ borderColor: colors.recording }}
            >
              <MicOff size={48} style={{ color: colors.recording }} />
            </motion.div>
            <h2 className="text-2xl font-black tracking-wide text-zinc-200">
              Recording in progress...
            </h2>
            <p className="text-zinc-400">Click stop when you're done.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="px-6 py-3 border-4 border-red-500 bg-red-600 text-white font-black rounded-lg shadow-md"
            >
              Stop Recording
            </motion.button>
          </motion.div>
        );
      case "transcribing":
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
            <h2 className="text-2xl font-black tracking-wide text-zinc-200 text-center">
              Generating Transcript...
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
            <p className="text-sm font-bold text-zinc-400 mt-2">
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
            <div className="flex items-center gap-3 mb-4">
              <FileText size={32} style={{ color: colors.primary }} />
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-zinc-200">
                Transcript Generated!
              </h2>
            </div>
            <div className="bg-zinc-800 p-6 border-4 border-zinc-700 rounded-lg shadow-inner max-h-[500px] overflow-auto">
              <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {transcript}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.secondary}` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg shadow-xl"
              style={{ boxShadow: `4px 4px 0px ${colors.secondary}` }}
            >
              <Download size={24} style={{ color: colors.secondary }} />
              Download Transcript (.txt)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `8px 8px 0px ${colors.primary}` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTranscript("");
                setStatus("idle");
              }}
              className="flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg shadow-xl"
              style={{ boxShadow: `4px 4px 0px ${colors.primary}` }}
            >
              <Sparkles size={24} style={{ color: colors.primary }} />
              Start New Session
            </motion.button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-gray-100 font-mono">
      <header className="py-4 px-6 sm:px-8 border-b-4 border-zinc-700">
        <nav className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Dashboard</span>
          </motion.button>
          <div className="font-black text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            AUDIO TO TEXT
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Info size={16} />
            <p>
              {MAX_DAILY_UPLOADS - uploadCount} / {MAX_DAILY_UPLOADS} left today
            </p>
          </div>
        </nav>
      </header>
      <main className="flex-1 py-8 px-4 sm:px-8 pb-24 md:pb-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl mx-auto p-8 border-4 border-zinc-700 bg-zinc-900 rounded-lg shadow-2xl"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black flex items-center gap-3 justify-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-md" />
              Tutorly Transcriber
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-bold text-zinc-400">
              Transform lectures & conversations into text.
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
      <footer className="w-full py-4 text-center text-zinc-500 text-sm font-light border-t-4 border-zinc-700">
        © 2025 Tutorly. All rights reserved.
      </footer>
    </div>
  );
};

export default AudioNotes;
