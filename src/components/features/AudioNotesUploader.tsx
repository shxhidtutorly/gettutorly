import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Mic, Upload, X, FileAudio, Clock, CheckCircle, AlertCircle, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

const AudioNotesUploader = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  function startRecording() {
    setIsRecording(true);
    setAudioBlob(null);
    setTranscript("");
    setNotes("");
    setRecordingTime(0);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();

        const audioChunks: Blob[] = [];
        mediaRecorderRef.current.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          setIsRecording(false);
          clearInterval(timerRef.current as any);
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
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioBlob(file);
        setTranscript("");
        setNotes("");
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file.",
          variant: "destructive",
        });
      }
    }
  }

  async function convertToNotes() {
    if (!audioBlob || !user) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setTranscript("");
    setNotes("");

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("userId", user.id);

    try {
      const response = await fetch("/api/audio-to-notes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is empty");
      }

      let receivedData = '';
      let decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        receivedData += decoder.decode(value);

        try {
          const parsedData = JSON.parse(receivedData);

          if (parsedData.transcript) {
            setTranscript(parsedData.transcript);
          }
          if (parsedData.notes) {
            setNotes(parsedData.notes);
          }
          if (parsedData.progress) {
            setUploadProgress(parsedData.progress);
          }

          receivedData = '';
        } catch (error) {
          // Ignore JSON parsing errors, wait for more data
        }
      }

    } catch (error: any) {
      console.error("Error converting audio to notes:", error);
      toast({
        title: "Conversion failed",
        description: error.message || "Failed to convert audio to notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function clearAudio() {
    setAudioBlob(null);
    setTranscript("");
    setNotes("");
    setRecordingTime(0);
  }

  function togglePlayback() {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }

  function saveNotes() {
    toast({
      title: "Notes saved!",
      description: "Your audio notes have been saved successfully.",
    });
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Audio Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-[#232453] to-[#1a1a2e] border-[#35357a] shadow-xl">
          <CardHeader className="border-b border-[#35357a] bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <CardTitle className="flex items-center gap-3 text-white">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Mic className="w-6 h-6 text-purple-400" />
              </motion.div>
              Audio to Notes Converter
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Recording Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${
                    isRecording 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white px-8 py-4 rounded-xl shadow-lg transition-all duration-200`}
                  disabled={isProcessing}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </motion.div>
              
              <span className="text-gray-400 text-sm">or</span>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 px-6 py-4 rounded-xl"
                  disabled={isProcessing}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Audio File
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
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-3"
              >
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 bg-red-500 rounded-full"
                  />
                  <span className="text-white font-medium">Recording in progress...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                </div>
              </motion.div>
            )}

            {/* Audio Preview */}
            {audioBlob && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2a2a3e] border border-[#35357a] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileAudio className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Audio Preview</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAudio}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <audio
                    ref={audioRef}
                    src={audioBlob ? URL.createObjectURL(audioBlob) : undefined}
                    className="flex-1"
                    controls
                  />
                </div>
              </motion.div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
                  />
                </div>
                <div>
                  <p className="text-white font-medium mb-2">Converting audio to notes...</p>
                  <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-gray-400 mt-1">{uploadProgress}% complete</p>
                </div>
              </motion.div>
            )}

            {/* Convert Button */}
            {audioBlob && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Button
                  onClick={convertToNotes}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Convert to Smart Notes
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {(transcript || notes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Transcript */}
          {transcript && (
            <Card className="bg-[#2a2a3e] border-[#35357a]">
              <CardHeader className="border-b border-[#35357a]">
                <CardTitle className="flex items-center gap-3 text-white">
                  <FileAudio className="w-5 h-5 text-blue-400" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="bg-[#1a1a2e] border-[#35357a] text-white min-h-[200px] resize-none"
                  placeholder="Audio transcript will appear here..."
                />
              </CardContent>
            </Card>
          )}

          {/* Generated Notes */}
          {notes && (
            <Card className="bg-[#2a2a3e] border-[#35357a]">
              <CardHeader className="border-b border-[#35357a]">
                <CardTitle className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Smart Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-[#1a1a2e] border-[#35357a] text-white min-h-[300px] resize-none"
                  placeholder="AI-generated notes will appear here..."
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={saveNotes}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AudioNotesUploader;
