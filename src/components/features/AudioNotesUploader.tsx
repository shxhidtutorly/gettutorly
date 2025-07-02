// src/components/features/AudioNotesUploader.tsx

"use client";

import React, { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import type { OurFileRouter } from "@/uploadthing.config";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { useToast } from "@/hooks/use-toast";

const AudioNotesUploader: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [aiNotes, setAiNotes] = useState<string | null>(null);

  const { uploadAndTranscribe, requestAINotes, isProcessing, progress } = useAudioUpload();
  const { toast } = useToast();

  const handleUploadComplete = async (res: { url: string }[]) => {
    if (!res || res.length === 0) {
      toast({ title: "Upload failed", description: "No file URL received", variant: "destructive" });
      return;
    }

    const fileUrl = res[0].url;
    setAudioUrl(fileUrl);
    setTranscript("");
    setAiNotes(null);

    const result = await uploadAndTranscribe(fileUrl);
    if (result) {
      setTranscript(result.transcription);
      setAiNotes(result.notes ?? null);
    } else {
      toast({ title: "Transcription failed", description: "Could not transcribe audio.", variant: "destructive" });
    }
  };

  const handleRequestAINotes = async () => {
    if (!audioUrl || !transcript) return;
    const result = await requestAINotes(audioUrl, transcript);
    if (result) {
      setAiNotes(result.notes ?? null);
    } else {
      toast({ title: "AI Notes failed", description: "Could not generate AI notes.", variant: "destructive" });
    }
  };

  return (
    <div className="audio-notes-uploader">
      <h2>Upload Audio and Generate Notes</h2>

      <UploadButton<OurFileRouter>
        endpoint="audioUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) =>
          toast({ title: "UploadThing Error", description: error.message, variant: "destructive" })
        }
      />

      {isProcessing && (
        <div>
          <p>Processing: {progress}%</p>
          <progress value={progress} max={100} />
        </div>
      )}

      {transcript && (
        <div className="transcript-box">
          <h3>Transcript</h3>
          <p>{transcript}</p>
        </div>
      )}

      {audioUrl && !isProcessing && (
        <div>
          <audio controls src={audioUrl} />
          <button onClick={handleRequestAINotes}>Generate AI Notes</button>
        </div>
      )}

      {aiNotes && (
        <div className="ai-notes-box">
          <h3>AI Notes</h3>
          <p>{aiNotes}</p>
        </div>
      )}
    </div>
  );
};

export default AudioNotesUploader;
