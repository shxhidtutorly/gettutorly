
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Upload, CheckCircle, Loader2, RefreshCw } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-bl from-[#0A0A0A] via-[#1a1a2e] to-[#16213e] text-white p-4">
      <style>
        {`
          .progress-bar {
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            height: 4px;
            border-radius: 2px;
            transition: width 0.3s ease;
          }
        `}
      </style>

      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            🧠 AI Notes
          </h1>
          <p className="text-gray-400 text-lg italic">
            👉 Record your lectures or upload your class audio with the click of a button.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              className="w-full bg-gray-800 rounded-full h-1 mb-6"
            >
              <div 
                className="progress-bar" 
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
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-purple-600/30 text-purple-200' 
                      : 'bg-gray-800/50 text-gray-500'
                  } ${isCurrent ? 'ring-2 ring-purple-400' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent && isProcessing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium hidden sm:block">{item.label}</span>
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
          >
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Upload Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Section */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Record Live Audio</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex items-center gap-2 ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    {audioBlob && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Audio recorded
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">Or</span>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Upload Audio File</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </Button>
                    {uploadFile && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {uploadFile.name}
                      </span>
                    )}
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!audioBlob && !uploadFile || isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Generate Notes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <h2 className="text-2xl font-bold text-green-400">Notes Generated Successfully!</h2>
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
                  >
                    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm h-full">
                      <CardHeader className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700">
                        <CardTitle className="text-white flex items-center gap-2">
                          📌 Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-96 overflow-y-auto p-6">
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {result.summary}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Detailed Notes Section */}
                {result.notes && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm h-full">
                      <CardHeader className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700">
                        <CardTitle className="text-white flex items-center gap-2">
                          📖 Detailed Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-96 overflow-y-auto p-6">
                        <div className="prose prose-invert max-w-none">
                          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {result.notes}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-4"
              >
                <Button
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Upload Another
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
