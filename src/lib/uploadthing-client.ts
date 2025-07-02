import { generateUploadThingURL } from "uploadthing/client";

export const uploadAudioToUploadThing = async (file: File): Promise<string> => {
  // The endpoint name must match what you configured in your UploadThing dashboard
  const endpoint = "audioUploader";

  // Prepare the upload URL using UploadThing's helper
  const uploadUrl = generateUploadThingURL(endpoint);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("UploadThing upload failed");
  }

  const data = await res.json();
  // The response structure: [{ url: 'public_url', ... }]
  if (!data?.[0]?.url) {
    throw new Error("UploadThing did not return a URL");
  }
  return data[0].url;
};
