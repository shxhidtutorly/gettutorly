import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";

const colors = {
  primary: "#00e6c4",
  secondary: "#ff5a8f",
  text: "#e4e4e7",
  background: "#18181b",
  border: "#3f3f46",
};

const AudioNotes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const storedTranscript = localStorage.getItem("lastTranscript");
    if (storedTranscript) {
      setLastTranscript(storedTranscript);
    }
  }, []);

  useEffect(() => {
    if (status === "transcribing") {
      const start = Date.now();
      // Set a mock duration to make the progress bar feel real
      const duration = 20000; // 20 seconds
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const newProgress = Math.min((elapsed / duration) * 100, 99); // Cap at 99%
        setProgress(newProgress);
        if (newProgress >= 99) {
          clearInterval(intervalRef.current);
        }
      }, 50);
    } else {
      clearInterval(intervalRef.current);
      if (status !== "completed") setProgress(0); // Reset progress on failure or idle
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  const startRecording = async () => {
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
  
  try {
    // 1. Get a secure, temporary upload URL and the public URL from your API
    const getUrlResponse = await fetch("/api/get-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: `audio-${Date.now()}.${audioBlob.type.split('/')[1].split(';')[0]}`,
        filetype: audioBlob.type,
      }),
    });
    const { signedUrl, publicUrl } = await getUrlResponse.json();

    // 2. Upload the audio file directly to S3 using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: audioBlob,
      headers: { "Content-Type": audioBlob.type },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload audio to S3. Status: ${uploadResponse.status}`);
    }

    // 3. Call your main transcription API with the PUBLIC URL of the uploaded file
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
    const file = event.target.files[0];
    if (file) {
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-zinc-400 font-bold mb-4">
                Choose an option to transcribe your audio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `6px 6px 0px ${colors.secondary}` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg shadow-xl"
                  style={{ boxShadow: `4px 4px 0px ${colors.primary}` }}
                >
                  <Mic size={24} style={{ color: colors.primary }} />
                  Record Lecture
                </motion.button>
                <motion.label
                  whileHover={{ scale: 1.05, boxShadow: `6px 6px 0px ${colors.secondary}` }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg cursor-pointer shadow-xl"
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
            </motion.div>
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
                <p className="text-zinc-400 text-sm italic font-light max-h-40 overflow-auto">
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
              className="p-4 rounded-full border-4 border-red-500"
            >
              <MicOff size={48} className="text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-black tracking-wide">
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
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="p-4 rounded-full border-4 border-zinc-700"
            >
              <RotateCw size={48} style={{ color: colors.primary }} />
            </motion.div>
            <h2 className="text-2xl font-black tracking-wide">
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
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide">
                Transcript Generated!
              </h2>
            </div>
            <div className="bg-zinc-800 p-6 border-4 border-zinc-700 rounded-lg shadow-inner max-h-[500px] overflow-auto">
              <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {transcript}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 px-6 py-4 border-4 border-zinc-700 bg-zinc-800 text-zinc-200 font-black tracking-wide rounded-lg shadow-xl"
              style={{ boxShadow: `4px 4px 0px ${colors.secondary}` }}
            >
              <Download size={24} style={{ color: colors.secondary }} />
              Download Transcript (.txt)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatus("idle")}
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
      <header className="py-4 px-6 sm:px-8">
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
          <div></div> {/* Placeholder for alignment */}
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-white flex items-center gap-3 justify-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
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
              className="mt-6 text-center text-red-400 font-bold"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </main>
      <footer className="w-full py-4 text-center text-zinc-500 text-sm font-light">
        © 2025 Tutorly. All rights reserved.
      </footer>
    </div>
  );
};

export default AudioNotes;
