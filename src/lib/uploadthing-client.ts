import { createUploadthing } from "uploadthing/client";

// Initialize UploadThing
const ut = createUploadthing();

export const uploadAudioToUploadThing = async (file: File): Promise<string> => {
  // Use the endpoint you've set up in your UploadThing dashboard
  const endpoint = "audioUploader";

  const res = await ut.uploadFiles(endpoint, { files: [file] });
  if (!res?.[0]?.url) throw new Error("UploadThing upload failed");
  return res[0].url;
};
