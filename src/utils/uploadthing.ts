import { generateComponents } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing.config";

export const { UploadButton, UploadDropzone } = generateComponents<OurFileRouter>();
