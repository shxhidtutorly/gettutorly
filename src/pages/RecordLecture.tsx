
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, MicOff, Download, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LiveTranscript from "@/components/features/LiveTranscript";
import AINotesPanel from "@/components/features/AINotesPanel";
import { createLectureSession, updateLectureSession } from "@/lib/lectureRecording";

const RecordLecture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiNotes, setAiNotes] = useState<Array<{ id: string; content: string; timestamp: Date }>>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptBufferRef = useRef("");
  const lastNotesGenerationRef = useRef(0);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Create new lecture session
      const newSessionId = await createLectureSession(currentUser?.id || '', {
        title: `Lecture ${new Date().toLocaleDateString()}`,
        startTime: new Date(),
      });
      setSessionId(newSessionId);
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Send chunk for transcription
          const audioBlob = new Blob([event.data], { type: 'audio/webm' });
          await transcribeAudioChunk(audioBlob);
        }
      };
      
      mediaRecorder.start(10000); // 10-second chunks
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Your lecture is being recorded and transcribed in real-time.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [currentUser, toast]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setIsProcessing(true);
      
      // Generate final AI notes
      if (transcript.length > 0) {
        await generateAINotes(transcript, true);
      }
      
      // Update session with final data
      if (sessionId) {
        await updateLectureSession(sessionId, {
          transcript,
          aiNotes: aiNotes.map(note => note.content).join('\n\n'),
          endTime: new Date(),
        });
      }
      
      setIsProcessing(false);
      
      toast({
        title: "Recording stopped",
        description: "Your lecture has been saved successfully.",
      });
    }
  }, [isRecording, transcript, aiNotes, sessionId]);

  // Transcribe audio chunk
  const transcribeAudioChunk = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const { text } = await response.json();
        if (text.trim()) {
          setTranscript(prev => prev + ' ' + text);
          transcriptBufferRef.current += ' ' + text;
          
          // Check if we should generate AI notes
          const wordCount = transcriptBufferRef.current.split(' ').length;
          const timeSinceLastNotes = Date.now() - lastNotesGenerationRef.current;
          
          if (wordCount >= 400 || timeSinceLastNotes >= 30000) {
            await generateAINotes(transcriptBufferRef.current);
            transcriptBufferRef.current = "";
            lastNotesGenerationRef.current = Date.now();
          }
        }
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  // Generate AI notes
  const generateAINotes = async (text: string, isFinal = false) => {
    if (!text.trim()) return;
    
    try {
      const response = await fetch('/api/generate-lecture-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, isFinal }),
      });
      
      if (response.ok) {
        const { notes } = await response.json();
        const newNote = {
          id: Date.now().toString(),
          content: notes,
          timestamp: new Date(),
        };
        setAiNotes(prev => [...prev, newNote]);
      }
    } catch (error) {
      console.error("AI notes generation error:", error);
    }
  };

  // Download functions
  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecture-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadNotes = () => {
    const notesText = aiNotes.map(note => note.content).join('\n\n---\n\n');
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecture-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lecture Recording</h1>
            <p className="text-gray-400 mt-2">Record and transcribe your lectures in real-time</p>
          </div>
          
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
              >
                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
            
            {transcript && (
              <>
                <Button
                  onClick={downloadTranscript}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Transcript
                </Button>
                
                <Button
                  onClick={downloadNotes}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Notes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-medium">Recording in progress...</span>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Live Transcript */}
          <Card className="bg-[#1C1C1C] border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Live Transcript
              </h2>
              <LiveTranscript transcript={transcript} isRecording={isRecording} />
            </div>
          </Card>

          {/* Right Side - AI Notes */}
          <Card className="bg-[#1C1C1C] border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Generated Notes
              </h2>
              <AINotesPanel notes={aiNotes} isProcessing={isProcessing} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecordLecture;
