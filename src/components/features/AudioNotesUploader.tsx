
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAudioUpload, AudioUploadResult } from "@/hooks/useAudioUpload";
import { Mic, Upload, X, FileAudio, Clock, CheckCircle, Play, Pause, Copy, Save, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
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
  
  const { uploadAndProcess, isProcessing, progress } = useAudioUpload();
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
          
          // Create a URL for the blob
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          setIsRecording(false);
          clearInterval(timerRef.current as any);
          
          // Stop all tracks
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
    
    // Use the blob object if available, otherwise use the blob URL
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

  const getProgressMessage = () => {
    if (progress < 25) return "Uploading audio...";
    if (progress < 70) return "Transcribing with AI...";
    return "Generating smart notes...";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Audio Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-[#232453] to-[#1a1a2e] border-[#35357a] shadow-xl">
          <CardHeader className="border-b border-[#35357a] bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 md:p-6">
            <CardTitle className="flex items-center gap-3 text-white text-lg md:text-xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Mic className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </motion.div>
              AI Audio to Smart Notes
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Recording Controls */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${
                    isRecording 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg transition-all duration-200 w-full sm:w-auto`}
                  disabled={isProcessing}
                >
                  <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </motion.div>
              
              <span className="text-gray-400 text-sm hidden sm:block">or</span>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 px-4 md:px-6 py-3 md:py-4 rounded-xl w-full sm:w-auto"
                  disabled={isProcessing}
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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
                    className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full"
                  />
                  <span className="text-white font-medium text-sm md:text-base">Recording in progress...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-sm md:text-base">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                </div>
              </motion.div>
            )}

            {/* Audio Preview */}
            {(audioBlob || audioUrl) && !result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2a2a3e] border border-[#35357a] rounded-xl p-3 md:p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <FileAudio className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    <span className="text-white font-medium text-sm md:text-base">Audio Ready</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAudio}
                    className="text-gray-400 hover:text-white p-1 md:p-2"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="text-purple-400 hover:text-purple-300 p-1 md:p-2"
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
                  <Button
                    onClick={processAudio}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl shadow-lg text-sm md:text-base"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Process with AI
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3 md:space-y-4"
              >
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 md:w-8 md:h-8 border-2 border-purple-400 border-t-transparent rounded-full"
                  />
                </div>
                <div>
                  <p className="text-white font-medium mb-2 text-sm md:text-base">
                    {getProgressMessage()}
                  </p>
                  <Progress value={progress} className="w-full max-w-md mx-auto" />
                  <p className="text-xs md:text-sm text-gray-400 mt-1">{progress}% complete</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 md:space-y-6"
        >
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 md:p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 md:gap-3 text-white">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-semibold text-sm md:text-base">Transcript and notes generated! 🎉</span>
            </div>
            <Button
              onClick={retryProcessing}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white mt-2 text-xs md:text-sm"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Regenerate
            </Button>
          </motion.div>

          {/* Summary Card */}
          <Card className="bg-[#2a2a3e] border-[#35357a]">
            <CardHeader className="border-b border-[#35357a] p-3 md:p-4">
              <CardTitle className="flex items-center justify-between text-white text-sm md:text-base">
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                  Summary
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.summary, "Summary")}
                  className="p-1 md:p-2"
                >
                  <Copy className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <Textarea
                value={result.summary}
                readOnly
                className="bg-[#1a1a2e] border-[#35357a] text-white min-h-[120px] md:min-h-[150px] resize-none text-xs md:text-sm"
              />
            </CardContent>
          </Card>

          {/* Detailed Notes Card */}
          <Card className="bg-[#2a2a3e] border-[#35357a]">
            <CardHeader className="border-b border-[#35357a] p-3 md:p-4">
              <CardTitle className="flex items-center justify-between text-white text-sm md:text-base">
                <div className="flex items-center gap-2 md:gap-3">
                  <FileAudio className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  Detailed Study Notes
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.notes, "Notes")}
                    className="p-1 md:p-2"
                  >
                    <Copy className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveNotes}
                    className="p-1 md:p-2"
                  >
                    <Save className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <Textarea
                value={result.notes}
                readOnly
                className="bg-[#1a1a2e] border-[#35357a] text-white min-h-[300px] md:min-h-[400px] resize-none text-xs md:text-sm"
              />
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="bg-[#232453] border-[#35357a]">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                <span>Provider: {result.metadata.provider}</span>
                <span>Model: {result.metadata.model}</span>
                {result.metadata.duration && <span>Duration: {Math.round(result.metadata.duration)}s</span>}
                <span>Generated: {new Date(result.metadata.timestamp).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AudioNotesUploader;
