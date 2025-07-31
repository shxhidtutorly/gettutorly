import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { Mic, MicOff, Upload, CheckCircle, Loader2, RefreshCw, FileAudio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEP_INDICATORS = [
  { step: 1, label: "Uploading", icon: Upload },
  { step: 2, label: "Transcribing", icon: Mic },
  { step: 3, label: "Generating Notes", icon: CheckCircle },
  { step: 4, label: "Complete", icon: CheckCircle }
];

export const AudioNotesUploader = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    uploadAndProcess,
    isProcessing,
    progress
  } = useAudioUpload();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Could not access microphone"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Audio captured successfully"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
      if (validTypes.includes(file.type)) {
        setUploadFile(file);
        setAudioBlob(null);
        toast({
          title: "File selected",
          description: `${file.name} ready for upload`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload MP3, WAV, or M4A files only"
        });
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
      if (validTypes.includes(file.type)) {
        setUploadFile(file);
        setAudioBlob(null);
        toast({
          title: "File selected",
          description: `${file.name} ready for upload`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload MP3, WAV, or M4A files only"
        });
      }
    }
  };

  const handleUpload = async () => {
    let fileToUpload: File | null = null;

    if (audioBlob) {
      fileToUpload = new File([audioBlob], `recording-${Date.now()}.mp3`, { type: 'audio/mp3' });
    } else if (uploadFile) {
      fileToUpload = uploadFile;
    }

    if (!fileToUpload) {
      toast({
        variant: "destructive",
        title: "No audio selected",
        description: "Please record or upload an audio file first"
      });
      return;
    }

    try {
      setCurrentStep(1);
      const uploadResult = await uploadAndProcess(fileToUpload);

      if (uploadResult) {
        setCurrentStep(4);
        setResult(uploadResult);
        toast({
          title: "✅ Notes generated successfully!",
          description: "Your audio has been transcribed and notes created"
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setCurrentStep(0);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again"
      });
    }
  };

  const resetForm = () => {
    setAudioBlob(null);
    setUploadFile(null);
    setCurrentStep(0);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
  <div className="space-y-10">
    {/* Neon Brutalist Progress Bar */}
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          className="w-full h-4 bg-black border-4 border-yellow-400 rounded-none shadow-[4px_4px_0px_#ffd600] overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-blue-400 transition-all duration-300"
            style={{ width: `${progress || 0}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>

    {/* Brutalist Step Indicators */}
    <div className="flex justify-center mb-6">
      <div className="flex flex-wrap gap-2">
        {STEP_INDICATORS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentStep >= item.step;
          const isCurrent = currentStep === item.step;
          return (
            <motion.div
              key={item.step}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-2 px-4 py-2 border-2 rounded-none font-black text-xs shadow-[4px_4px_0px_#ffd600] 
                ${isActive ? "bg-yellow-400 text-black border-yellow-400" : "bg-gray-900 text-gray-400 border-gray-700"} 
                ${isCurrent ? "ring-2 ring-yellow-400" : ""}`}
            >
              <Icon className={`w-5 h-5 ${isCurrent && isProcessing ? 'animate-spin' : ''}`} />
              <span>{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* Neon Brutalist Upload Section */}
    {!result && (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-8"
      >
        {/* Drag & Drop Zone */}
        <div
          className={`relative border-4 border-dashed rounded-none p-8 text-center transition-all duration-300 
            ${dragActive ? 'border-pink-500 bg-pink-500/10 scale-105' : 'border-yellow-400 hover:bg-yellow-400/5'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 bg-yellow-400 flex items-center justify-center rounded-none shadow-[4px_4px_0px_#ffd600]`}>
              <FileAudio className="w-8 h-8 text-black" />
            </div>
            <p className="font-black text-lg text-black">{dragActive ? "Drop your audio file here" : "Drag and drop audio file here"}</p>
            <p className="text-gray-700 font-bold text-sm">Supports MP3, WAV, M4A formats</p>
          </div>
        </div>

        {/* File Upload + Recording (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brutalist File Upload */}
          <div className="space-y-3">
            <Label className="text-cyan-400 font-black">Upload Audio File</Label>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full border-4 border-blue-400 bg-black text-blue-400 font-black rounded-none shadow-[4px_4px_0px_#3b82f6] hover:bg-blue-400 hover:text-black transition-all duration-200"
              aria-label="Choose audio file"
            >
              <Upload className="w-5 h-5" />
              Choose File
            </Button>
            {uploadFile && (
              <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 p-2 border-2 border-green-400 rounded-none shadow-[4px_4px_0px_#22c55e]">
                <CheckCircle className="w-4 h-4" />
                <span className="truncate">{uploadFile.name}</span>
              </div>
            )}
            <Input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload audio file"
            />
          </div>

          {/* Brutalist Recording */}
          <div className="space-y-3">
            <Label className="text-pink-500 font-black">Record Live Audio</Label>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full border-4 font-black rounded-none shadow-[4px_4px_0px_#ec4899] 
                ${isRecording ? "bg-pink-500 text-black border-pink-500 hover:bg-pink-600" 
                : "bg-black text-pink-500 border-pink-500 hover:bg-pink-500 hover:text-black"}`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Recording
                </>
              )}
            </Button>
            {audioBlob && (
              <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 p-2 border-2 border-green-400 rounded-none shadow-[4px_4px_0px_#22c55e]">
                <CheckCircle className="w-4 h-4" />
                <span>Audio recorded successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Brutalist Process Button */}
        <Button
          onClick={handleUpload}
          disabled={!audioBlob && !uploadFile || isProcessing}
          className="w-full py-5 text-lg font-black rounded-none shadow-[6px_6px_0px_#ffd600] bg-gradient-to-r from-yellow-400 to-blue-400 border-4 border-yellow-400 hover:scale-105 transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-700"
          aria-label="Generate notes"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mr-2" />
              Generate Notes
            </>
          )}
        </Button>
      </motion.div>
    )}

    {/* Brutalist Results Section */}
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Brutalist Success Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle className="w-10 h-10 text-green-400 shadow-[4px_4px_0px_#22c55e]" />
              <h3 className="text-2xl md:text-3xl font-black text-green-400">Notes Generated Successfully!</h3>
            </div>
          </div>

          {/* Results Brutalist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary */}
            {result.summary && (
              <div className="bg-black border-4 border-yellow-400 rounded-none shadow-[4px_4px_0px_#ffd600] overflow-hidden">
                <div className="bg-yellow-400/30 px-6 py-4 border-b-4 border-yellow-400">
                  <h4 className="text-yellow-400 font-black flex items-center gap-2">📌 Summary</h4>
                </div>
                <div className="p-6 max-h-80 overflow-y-auto">
                  <div className="text-gray-200 font-mono whitespace-pre-wrap">{result.summary}</div>
                </div>
              </div>
            )}
            {/* Notes */}
            {result.notes && (
              <div className="bg-black border-4 border-blue-400 rounded-none shadow-[4px_4px_0px_#3b82f6] overflow-hidden">
                <div className="bg-blue-400/30 px-6 py-4 border-b-4 border-blue-400">
                  <h4 className="text-blue-400 font-black flex items-center gap-2">📖 Detailed Notes</h4>
                </div>
                <div className="p-6 max-h-80 overflow-y-auto">
                  <div className="text-gray-200 font-mono whitespace-pre-wrap">{result.notes}</div>
                </div>
              </div>
            )}
          </div>

          {/* Brutalist Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={resetForm}
              className="flex items-center gap-2 px-10 py-4 font-black rounded-none shadow-[6px_6px_0px_#ffd600] bg-gradient-to-r from-yellow-400 to-blue-400 text-black border-4 border-yellow-400 hover:scale-105 transition-all duration-200"
              aria-label="Upload another audio file"
            >
              <RefreshCw className="w-5 h-5" />
              Upload Another
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
);
