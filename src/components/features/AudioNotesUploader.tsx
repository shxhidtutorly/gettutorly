"use client";

import React, { useState } from "react";
import { UploadButton } from "@uploadthing/react";
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
      toast({
        title: "Upload failed",
        description: "No file URL received",
        variant: "destructive",
      });
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
      toast({
        title: "Transcription failed",
        description: "Could not transcribe audio.",
        variant: "destructive",
      });
    }
  };

  const handleRequestAINotes = async () => {
    if (!audioUrl || !transcript) return;

    const result = await requestAINotes(audioUrl, transcript);
    if (result) {
      setAiNotes(result.notes ?? null);
    } else {
      toast({
        title: "AI Notes failed",
        description: "Could not generate AI notes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="audio-notes-uploader space-y-4 p-4 rounded-xl bg-white shadow-md dark:bg-gray-900">
      <h2 className="text-2xl font-semibold">Upload Audio and Generate Notes</h2>

      <UploadButton<OurFileRouter>
        endpoint="audioUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) =>
          toast({
            title: "UploadThing Error",
            description: error.message,
            variant: "destructive",
          })
        }
      />

      {isProcessing && (
        <div className="space-y-1">
          <p>Processing: {progress}%</p>
          <progress value={progress} max={100} className="w-full" />
        </div>
      )}

      {transcript && (
        <div className="transcript-box border p-3 rounded-md bg-gray-100 dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2">Transcript</h3>
          <p className="whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {audioUrl && !isProcessing && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <button
            onClick={handleRequestAINotes}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate AI Notes
          </button>
        </div>
      )}

      {aiNotes && (
        <div className="ai-notes-box border p-3 rounded-md bg-green-100 dark:bg-green-900">
          <h3 className="text-lg font-medium mb-2">AI Notes</h3>
          <p className="whitespace-pre-wrap">{aiNotes}</p>
        </div>
      )}
    </div>
  );
};

export default AudioNotesUploader;
