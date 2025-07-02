import { generateUploadThingURL } from "uploadthing/client";

export const uploadAudioToUploadThing = async (file: File): Promise<string> => {
  // Replace with your UploadThing endpoint:
  const endpoint = "https://uploadthing.com/api/uploadFiles"; // Or your custom endpoint if needed
  const formData = new FormData();
  formData.append("file", file);

  // You may need to add headers for your app ID/secret if required
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
    // headers: { ... } // if needed
  });

  if (!res.ok) throw new Error("UploadThing upload failed");
  const data = await res.json();
  if (!data?.[0]?.url) throw new Error("UploadThing did not return a URL");
  return data[0].url;
};
