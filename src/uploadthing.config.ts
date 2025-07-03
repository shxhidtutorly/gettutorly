import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  audioUploader: f({ audio: { maxFileSize: "10MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded file:", file.url);
      return { uploadedBy: "tutorly-system" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
