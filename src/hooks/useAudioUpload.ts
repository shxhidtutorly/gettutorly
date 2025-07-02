import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface AudioUploadResult {
  audioUrl: string;
  transcription: string;
  summary?: string;
  notes?: string;
  metadata?: any;
}

export const useAudioUpload = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Upload file to backend, which uploads to UploadThing
  async function uploadFileToUploadThing(file: File): Promise<string | null> {
    setProgress(20);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploadthing-upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        toast({ title: "Upload failed", description: "Failed to upload file to UploadThing.", variant: "destructive" });
        return null;
      }
      const data = await response.json();
      setProgress(50);
      return data.url || null;
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
      return null;
    }
  }

  // Step 1: Convert blob or blob-URL to File, then upload to backend/UploadThing
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

    setProgress(25);

    const url = await uploadFileToUploadThing(file);
    if (!url) throw new Error("UploadThing upload failed.");
    setProgress(60);
    return url;
  };

  // Step 2: Transcribe via your API (using UploadThing URL)
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
      body: JSON.stringify({ audioUrl, transcript, aiNotes: true }),
    });
    if (!res.ok) throw new Error("AI Notes failed");
    const data = await res.json();
    setProgress(100);
    return data;
  };

  // Main handler: upload → transcribe
  const uploadAndTranscribe = async (audioBlobOrUrl: Blob | string): Promise<AudioUploadResult | null> => {
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
