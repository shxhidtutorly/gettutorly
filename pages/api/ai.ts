
import type { NextApiRequest, NextApiResponse } from "next";
import { handleChat, handleSummary, handleEssay, handleCode } from "../../utils/ai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { type } = req.body;

  try {
    switch (type) {
      case "chat":
        return await handleChat(req, res);
      case "summary":
        return await handleSummary(req, res);
      case "essay":
        return await handleEssay(req, res);
      case "code":
        return await handleCode(req, res);
      default:
        return res.status(400).json({ error: "Invalid type parameter" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
