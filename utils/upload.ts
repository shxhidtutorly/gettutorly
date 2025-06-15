// Modular file handlers for /api/upload.ts

import { NextApiResponse } from "next";
import { File } from "formidable";

// PDF upload
export async function handlePdfUpload(file: File, fields: any, res: NextApiResponse) {
  // Process PDF: extract data, save, etc.
  return res.status(200).json({ message: "PDF uploaded!", filename: file.originalFilename });
}

// DOCX upload
export async function handleDocxUpload(file: File, fields: any, res: NextApiResponse) {
  // Process DOCX here
  return res.status(200).json({ message: "DOCX uploaded!", filename: file.originalFilename });
}

// TXT upload
export async function handleTxtUpload(file: File, fields: any, res: NextApiResponse) {
  // Process TXT here
  return res.status(200).json({ message: "TXT uploaded!", filename: file.originalFilename });
}

// Other files
export async function handleOtherUpload(file: File, fields: any, res: NextApiResponse) {
  // Generic file handler
  return res.status(200).json({ message: "File uploaded!", filename: file.originalFilename });
}
