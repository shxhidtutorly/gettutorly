// uploadthing.config.ts

import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  audioUploader: f({ audio: { maxFileSize: "20MB" } }).onUploadComplete(({ file }) => {
    console.log("File uploaded:", file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
