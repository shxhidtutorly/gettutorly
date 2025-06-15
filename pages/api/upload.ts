
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { handlePdfUpload, handleDocxUpload, handleTxtUpload, handleOtherUpload } from "../../utils/upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields, files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { fields, files } = await parseForm(req);
    const fileObj = files.file as File;
    const mime = fileObj?.mimetype || "";
    switch (fields.fileType || mime) {
      case "application/pdf":
      case ".pdf":
        return await handlePdfUpload(fileObj, fields, res);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case ".docx":
        return await handleDocxUpload(fileObj, fields, res);
      case "text/plain":
      case ".txt":
        return await handleTxtUpload(fileObj, fields, res);
      default:
        return await handleOtherUpload(fileObj, fields, res);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
