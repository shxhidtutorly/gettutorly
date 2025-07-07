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
    <div className="space-y-6">
      {/* Progress Bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="w-full bg-[#21253a]/50 rounded-full h-2 overflow-hidden"
          >
            <div 
              className="h-full bg-gradient-to-r from-[#ffd600] to-[#4a90e2] transition-all duration-300 ease-out"
              style={{ width: `${progress || 0}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {STEP_INDICATORS.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentStep >= item.step;
            const isCurrent = currentStep === item.step;

            return (
              <motion.div
                key={item.step}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all text-xs sm:text-sm
                  ${isActive ? 'bg-[#ffd600]/20 text-[#ffd600] border border-[#ffd600]/30' : 'bg-[#21253a]/50 text-gray-400 border border-gray-600/30'} 
                  ${isCurrent ? 'ring-2 ring-[#ffd600]/50' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isCurrent && isProcessing ? 'animate-spin' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Upload Section */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Enhanced Drag and Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-[#ffd600] bg-[#ffd600]/10 scale-105'
                : 'border-[#ffd600]/30 hover:border-[#ffd600]/60 hover:bg-[#ffd600]/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive ? 'bg-[#ffd600]/30 scale-110' : 'bg-[#ffd600]/20 hover:bg-[#ffd600]/30'
              }`}>
                <FileAudio className="w-8 h-8 text-[#ffd600]" />
              </div>
              <div>
                <p className="text-gray-300 text-lg font-medium">
                  {dragActive ? 'Drop your audio file here' : 'Drag and drop your audio file here'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Supports MP3, WAV, M4A formats
                </p>
              </div>
            </div>
          </div>

          {/* File Selection and Recording */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-base font-medium">Upload Audio File</Label>
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full flex items-center gap-2 bg-[#21253a]/50 border-[#4a90e2]/50 text-[#4a90e2] hover:bg-[#4a90e2]/10 hover:border-[#4a90e2]/70 transition-all duration-300"
                  aria-label="Choose audio file"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                {uploadFile && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="truncate">{uploadFile.name}</span>
                  </div>
                )}
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload audio file"
              />
            </div>

            {/* Recording */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-base font-medium">Record Live Audio</Label>
              <div className="space-y-2">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full flex items-center gap-2 transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 border-2' 
                      : 'bg-[#21253a]/50 border-[#4a90e2]/50 text-[#4a90e2] hover:bg-[#4a90e2]/10 hover:border-[#4a90e2]/70 border-2'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </>
                  )}
                </Button>
                {audioBlob && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>Audio recorded successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Process Button */}
          <Button
            onClick={handleUpload}
            disabled={!audioBlob && !uploadFile || isProcessing}
            className="w-full bg-gradient-to-r from-[#ffd600] to-[#4a90e2] text-black font-semibold py-4 text-lg hover:shadow-2xl hover:transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Generate notes"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Generate Notes
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Success Header */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h3 className="text-xl md:text-2xl font-bold text-green-400">Notes Generated Successfully!</h3>
              </div>
            </motion.div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Section */}
              {result.summary && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#151a2e]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="bg-[#ffd600]/10 px-6 py-4 border-b border-[#ffd600]/20">
                    <h4 className="text-[#ffd600] font-semibold flex items-center gap-2">
                      📌 Summary
                    </h4>
                  </div>
                  <div className="p-6 max-h-80 overflow-y-auto">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.summary}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Detailed Notes Section */}
              {result.notes && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-[#151a2e]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="bg-[#4a90e2]/10 px-6 py-4 border-b border-[#4a90e2]/20">
                    <h4 className="text-[#4a90e2] font-semibold flex items-center gap-2">
                      📖 Detailed Notes
                    </h4>
                  </div>
                  <div className="p-6 max-h-80 overflow-y-auto">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.notes}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                onClick={resetForm}
                className="flex items-center gap-2 bg-gradient-to-r from-[#ffd600] to-[#4a90e2] text-black font-semibold px-8 py-3 hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300"
                aria-label="Upload another audio file"
              >
                <RefreshCw className="w-4 h-4" />
                Upload Another
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
