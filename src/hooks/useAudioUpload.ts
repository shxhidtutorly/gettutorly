import React, { useRef, useState } from "react";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { useToast } from "@/hooks/use-toast";

const AudioNotesUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [aiNotes, setAiNotes] = useState<string | null>(null);

  const { uploadAndTranscribe, requestAINotes, isProcessing, progress } = useAudioUpload();
  const { toast } = useToast();

  // --- Utility to upload file to your backend ---
  async function uploadFileToUploadThing(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploadthing-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast({ title: "Upload failed", description: "Failed to upload file to UploadThing", variant: "destructive" });
      return null;
    }

    const data = await response.json();
    return data.url || null;
  }

  // --- Handler for file selection and upload ---
  const handleUpload = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;
    if (e?.target?.files && e.target.files.length > 0) {
      file = e.target.files[0];
      setUploadingFile(file);
    } else if (uploadingFile) {
      file = uploadingFile;
    } else {
      return;
    }

    setTranscript("");
    setAiNotes(null);

    // 1. Upload file to backend (UploadThing)
    const uploadThingUrl = await uploadFileToUploadThing(file);
    if (!uploadThingUrl) {
      toast({ title: "Upload failed", description: "Audio upload failed.", variant: "destructive" });
      return;
    }

    // 2. Send file URL to audio-to-notes API for transcription
    const result = await uploadAndTranscribe(uploadThingUrl);
    if (result) {
      setAudioUrl(result.audioUrl);
      setTranscript(result.transcription);
      setAiNotes(result.notes ?? null);
    } else {
      toast({ title: "Transcription failed", description: "Could not transcribe audio.", variant: "destructive" });
    }
  };

  // --- Handler for requesting AI notes after transcript ---
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
      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="upload-btn"
      >
        Select Audio File
      </button>

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
