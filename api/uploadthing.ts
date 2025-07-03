// app/api/uploadthing/route.ts
import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  audioUploader: f({ audio: { maxFileSize: "16MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("✅ File uploaded:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

import { createNextRouteHandler } from "uploadthing/next";

export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
