
// src/lib/uploadthing-client.ts
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing.config";

interface AudioUploadButtonProps {
  onUploadComplete: (url: string) => void;
}

export const AudioUploadButton = ({ onUploadComplete }: AudioUploadButtonProps) => {
  return (
    <UploadButton<OurFileRouter>
      endpoint="audioUploader"
      onClientUploadComplete={(res) => {
        if (res && res.length > 0) {
          const fileUrl = res[0].url;
          console.log("File uploaded to:", fileUrl);
          onUploadComplete(fileUrl);
        }
      }}
      onUploadError={(error: Error) => {
        console.error("UploadThing Error:", error);
        alert(`Upload failed: ${error.message}`);
      }}
    />
  );
};
