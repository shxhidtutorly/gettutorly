import React, { useRef, useState } from "react";
import { useAudioUpload } from "@/hooks/useAudioUpload";

// Replace with your favorite button/spinner if you have one
const Button = ({ onClick, disabled, children }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: "#0070f3",
      color: "white",
      border: "none",
      borderRadius: 4,
      padding: "0.5rem 1.5rem",
      margin: "0.5rem 0",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    }}
  >
    {children}
  </button>
);

export const AudioNotesUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadAndTranscribe,
    requestAINotes,
    isProcessing,
    progress,
  } = useAudioUpload();

  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

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

    const result = await uploadAndTranscribe(file);
    if (result) {
      setAudioUrl(result.audioUrl);
      setTranscript(result.transcription);
      setAiNotes(null);
    }
  };

  const handleGetAINotes = async () => {
    if (!audioUrl || !transcript) return;
    const result = await requestAINotes(audioUrl, transcript);
    if (result) setAiNotes(result.notes);
  };

  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: 8,
      padding: "2rem",
      maxWidth: 500,
      margin: "2rem auto",
      background: "#fafbfc",
    }}>
      <h2>Upload Audio for Notes</h2>

      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Select Audio File"}
      </Button>

      {progress > 0 && progress < 100 && (
        <div style={{ margin: "1rem 0" }}>
          <div style={{
            background: "#eee",
            height: 8,
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 4
          }}>
            <div style={{
              background: "#0070f3",
              width: `${progress}%`,
              height: "100%",
              transition: "width 0.3s"
            }} />
          </div>
          <div style={{ fontSize: 12 }}>
            {progress < 100 ? `Processing... ${progress}%` : "Done!"}
          </div>
        </div>
      )}

      {transcript && !aiNotes && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Transcript</h3>
          <pre style={{
            background: "#f3f3f3",
            padding: "1rem",
            borderRadius: 6,
            fontSize: 14,
            whiteSpace: "pre-wrap"
          }}>
            {transcript}
          </pre>
          <Button onClick={handleGetAINotes} disabled={isProcessing}>
            {isProcessing ? "Generating AI Notes..." : "Get AI-powered Summary & Notes"}
          </Button>
        </div>
      )}

      {aiNotes && (
        <div style={{ marginTop: "2rem" }}>
          <h3>AI Notes</h3>
          <div style={{
            background: "#f6fafd",
            border: "1px solid #e7eaf2",
            borderRadius: 6,
            padding: "1rem",
            fontSize: 15,
            whiteSpace: "pre-wrap"
          }}>
            {aiNotes}
          </div>
        </div>
      )}

      {audioUrl && (
        <div style={{ marginTop: "1rem" }}>
          <audio controls src={audioUrl} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
};
