// src/lib/uploadthing-client.ts

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing.config";
import { useCallback } from "react";

interface AudioUploadButtonProps {
  onUploadComplete: (url: string) => void;
}

export const AudioUploadButton = ({ onUploadComplete }: AudioUploadButtonProps) => {
  const handleUploadComplete = useCallback(
    (res: UploadthingResponse[] | undefined) => {
      if (!res || res.length === 0) {
        console.error("No file uploaded.");
        return;
      }

      const fileUrl = res[0].url;
      console.log("✅ File uploaded to:", fileUrl);
      onUploadComplete(fileUrl);
    },
    [onUploadComplete]
  );

  return (
    <UploadButton<OurFileRouter>
      endpoint="audioUploader"
      onClientUploadComplete={handleUploadComplete}
      onUploadError={(error: Error) => {
        console.error("❌ UploadThing Error:", error);
        alert(`Upload failed: ${error.message}`);
      }}
    />
  );
};

// Uploadthing type helper (if needed)
type UploadthingResponse = {
  url: string;
  name?: string;
};
