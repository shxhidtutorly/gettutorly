import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAudioUpload, AudioUploadResult } from "@/hooks/useAudioUpload";
import { Mic, Upload, X, FileAudio, Clock, CheckCircle, Play, Pause, Copy, Save, RefreshCw, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const AudioNotesUploader = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AudioUploadResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadAndProcess, isProcessing, progress, currentStep } = useAudioUpload();
  const { toast } = useToast();

  function startRecording() {
    setIsRecording(true);
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setRecordingTime(0);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });
        mediaRecorderRef.current.start();

        const audioChunks: Blob[] = [];
        mediaRecorderRef.current.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          setIsRecording(false);
          clearInterval(timerRef.current as any);
          
          stream.getTracks().forEach(track => track.stop());
        });

        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to record audio.",
          variant: "destructive",
        });
        setIsRecording(false);
      });
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioBlob(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file.",
          variant: "destructive",
        });
      }
    }
  }

  async function processAudio() {
    if (!audioBlob && !audioUrl) return;
    
    const audioInput = audioBlob || audioUrl;
    if (!audioInput) return;
    
    const processingResult = await uploadAndProcess(audioInput);
    if (processingResult) {
      setResult(processingResult);
    }
  }

  function clearAudio() {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  function togglePlayback() {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Audio playback failed:', error);
          toast({
            title: "Playback failed",
            description: "Could not play audio. Try re-recording or uploading again.",
            variant: "destructive",
          });
        });
      }
      setIsPlaying(!isPlaying);
    }
  }

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied!`,
      description: `${type} has been copied to your clipboard.`,
    });
  }

  function saveNotes() {
    if (result) {
      toast({
        title: "Notes saved!",
        description: "Your audio notes have been saved to your library.",
      });
    }
  }

  function retryProcessing() {
    if (audioBlob || audioUrl) {
      processAudio();
    }
  }

  function uploadAnother() {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  // Determine current step for step indicator
  const getCurrentStep = () => {
    if (result) return 4;
    if (isProcessing && progress >= 70) return 3;
    if (isProcessing && progress >= 25) return 2;
    if (isProcessing || (audioBlob || audioUrl)) return 1;
    return 0;
  };

  const stepLabels = ["Ready", "Uploading", "Transcribing", "Generating Notes", "Complete"];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-2 md:px-0">
      {/* Step Progress Bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/30"
          >
            <Progress value={progress} className="mb-3 h-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-300 font-medium">{currentStep}</span>
              <span className="text-blue-300">{progress}% complete</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#35357a]/50"
      >
        {stepLabels.map((label, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                getCurrentStep() >= index
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              {getCurrentStep() > index ? "✓" : index + 1}
            </div>
            <span className={`text-xs transition-colors ${
              getCurrentStep() >= index ? "text-green-400" : "text-gray-500"
            }`}>
              {label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Main Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-[#232453] to-[#1a1a2e] border-[#35357a] shadow-2xl">
          <CardHeader className="border-b border-[#35357a] bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 md:p-6">
            <CardTitle className="flex items-center gap-3 text-white text-xl md:text-2xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                🎙️
              </motion.div>
              Live Lectures
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                🧠
              </motion.div>
            </CardTitle>
            <p className="text-purple-200 text-sm md:text-base">
              Transform your lecture recordings into AI-powered study notes
            </p>
          </CardHeader>
          
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Recording Controls */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${
                    isRecording 
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" 
                      : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  } text-white px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-xl transition-all duration-300 w-full sm:w-auto font-semibold`}
                  disabled={isProcessing}
                >
                  <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  {isRecording ? "Stop Recording" : "Record Lecture"}
                </Button>
              </motion.div>
              
              <span className="text-gray-400 text-sm hidden sm:block">or</span>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-purple-400/50 text-purple-300 hover:bg-purple-400/10 hover:border-purple-400 px-4 md:px-6 py-3 md:py-4 rounded-xl w-full sm:w-auto font-semibold transition-all duration-300"
                  disabled={isProcessing}
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Upload Lecture
                </Button>
              </motion.div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Recording Status */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-3 bg-red-600/10 border border-red-500/30 rounded-xl p-4"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full shadow-lg"
                    />
                    <span className="text-white font-semibold text-sm md:text-base">Recording in progress...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-red-300">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-sm md:text-base font-mono">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio Preview */}
            <AnimatePresence>
              {(audioBlob || audioUrl) && !result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-[#2a2a3e] to-[#252540] border border-[#35357a] rounded-xl p-3 md:p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <FileAudio className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                      <span className="text-white font-semibold text-sm md:text-base">Lecture Ready</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAudio}
                      className="text-gray-400 hover:text-white hover:bg-red-500/20 p-1 md:p-2 transition-colors"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayback}
                      className="text-green-400 hover:text-green-300 hover:bg-green-400/10 p-1 md:p-2 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3 h-3 md:w-4 md:h-4" /> : <Play className="w-3 h-3 md:w-4 md:h-4" />}
                    </Button>
                    <audio
                      ref={audioRef}
                      src={audioUrl || undefined}
                      className="flex-1"
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>

                  <div className="text-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={processAudio}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl shadow-xl text-sm md:text-base font-semibold transition-all duration-300"
                        disabled={isProcessing}
                      >
                        <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Generate AI Notes
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Status */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-3 md:space-y-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl p-4 md:p-6"
                >
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 md:w-10 md:h-10 border-3 border-purple-400 border-t-transparent rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-2 text-sm md:text-base">
                      {currentStep || "Processing your lecture..."}
                    </p>
                    <p className="text-xs md:text-sm text-purple-300">This may take a few moments</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Success Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 md:p-6 text-center shadow-xl"
            >
              <div className="flex items-center justify-center gap-3 text-white mb-3">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                <span className="font-bold text-lg md:text-xl">✅ Your lecture notes are ready!</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={uploadAnother}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold"
                >
                  Upload Another
                </Button>
                <Button
                  onClick={retryProcessing}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </motion.div>

            {/* Notes Display - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Summary Section */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-[#2a2a3e] to-[#252540] border-[#35357a] shadow-xl h-full">
                  <CardHeader className="border-b border-[#35357a] p-3 md:p-4 sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between text-white text-sm md:text-base">
                      <div className="flex items-center gap-2 md:gap-3">
                        📌
                        <span className="font-bold">Summary</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.summary, "Summary")}
                        className="p-1 md:p-2 hover:bg-white/10"
                      >
                        <Copy className="w-3 h-3 md:w-4 md:h-4 text-purple-300" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4">
                    <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                      <Textarea
                        value={result.summary}
                        readOnly
                        className="bg-transparent border-none text-white resize-none text-xs md:text-sm leading-relaxed min-h-[250px] md:min-h-[350px] focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Detailed Notes Section */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-gradient-to-br from-[#2a2a3e] to-[#252540] border-[#35357a] shadow-xl h-full">
                  <CardHeader className="border-b border-[#35357a] p-3 md:p-4 sticky top-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between text-white text-sm md:text-base">
                      <div className="flex items-center gap-2 md:gap-3">
                        📖
                        <span className="font-bold">Detailed Notes</span>
                      </div>
                      <div className="flex gap-1 md:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.notes, "Notes")}
                          className="p-1 md:p-2 hover:bg-white/10"
                        >
                          <Copy className="w-3 h-3 md:w-4 md:h-4 text-blue-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveNotes}
                          className="p-1 md:p-2 hover:bg-white/10"
                        >
                          <Save className="w-3 h-3 md:w-4 md:h-4 text-green-300" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4">
                    <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                      <Textarea
                        value={result.notes}
                        readOnly
                        className="bg-transparent border-none text-white resize-none text-xs md:text-sm leading-relaxed min-h-[250px] md:min-h-[350px] focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-[#232453]/50 border-[#35357a]/50 shadow-lg">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-400 justify-center">
                    <span className="bg-purple-600/20 px-2 py-1 rounded">Provider: {result.metadata.provider}</span>
                    <span className="bg-blue-600/20 px-2 py-1 rounded">Model: {result.metadata.model}</span>
                    {result.metadata.duration && (
                      <span className="bg-green-600/20 px-2 py-1 rounded">Duration: {Math.round(result.metadata.duration)}s</span>
                    )}
                    <span className="bg-gray-600/20 px-2 py-1 rounded">
                      Generated: {new Date(result.metadata.timestamp).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AudioNotesUploader;
