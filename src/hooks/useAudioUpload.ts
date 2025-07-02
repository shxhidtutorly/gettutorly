import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadAudioToUploadThing } from "@/lib/uploadthing-client"; // <-- import helper

export interface AudioUploadResult {
  audioUrl: string;
  transcription: string;
  summary?: string;
  notes?: string;
  metadata: any;
}

export const useAudioUpload = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Step 1: Upload to UploadThing & get public URL
  const uploadAudioFile = async (audioBlobOrUrl: Blob | string): Promise<string> => {
    setProgress(10);
    let file: File;

    if (typeof audioBlobOrUrl === "string" && audioBlobOrUrl.startsWith("blob:")) {
      const response = await fetch(audioBlobOrUrl);
      const blob = await response.blob();
      file = new File([blob], `audio-${Date.now()}.mp3`, { type: "audio/mpeg" });
    } else if (audioBlobOrUrl instanceof Blob) {
      file = new File([audioBlobOrUrl], `audio-${Date.now()}.mp3`, { type: "audio/mpeg" });
    } else {
      throw new Error("Invalid audio input");
    }

    setProgress(30);
    const url = await uploadAudioToUploadThing(file);
    setProgress(60);
    return url;
  };

  // Step 2: Transcribe via your API
  const getTranscription = async (audioUrl: string) => {
    setProgress(70);
    const res = await fetch("/api/audio-to-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl }),
    });
    if (!res.ok) throw new Error("Transcription failed");
    const data = await res.json();
    setProgress(90);
    return data;
  };

  // Step 3: Get AI notes (when user asks)
  const getAINotes = async (audioUrl: string, transcript: string) => {
    setProgress(70);
    const res = await fetch("/api/audio-to-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Optionally pass a flag { audioUrl, transcript, aiNotes: true }
      body: JSON.stringify({ audioUrl, transcript, aiNotes: true }),
    });
    if (!res.ok) throw new Error("AI Notes failed");
    const data = await res.json();
    setProgress(100);
    return data;
  };

  // Main handler: upload → transcribe
  const uploadAndTranscribe = async (audioBlobOrUrl: Blob | string) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const audioUrl = await uploadAudioFile(audioBlobOrUrl);
      const data = await getTranscription(audioUrl);
      setProgress(100);
      return data; // { transcription, audioUrl, ... }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Handler: get AI notes after transcript
  const requestAINotes = async (audioUrl: string, transcript: string) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const data = await getAINotes(audioUrl, transcript);
      setProgress(100);
      return data;
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    uploadAndTranscribe, // use this for initial upload & transcription
    requestAINotes,      // use this when user asks for AI-powered notes
    isProcessing,
    progress,
  };
};
