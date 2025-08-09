// api/youtube-summarize.js
import { AIProviderManager } from "../src/lib/aiProviders.js";
import { YoutubeTranscript } from "youtube-transcript";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing YouTube URL" });
    }

    // Helper: extract videoId from common YouTube URL patterns
    const extractVideoId = (u) => {
      try {
        const parsed = new URL(u);
        if (parsed.hostname.includes("youtu.be")) {
          return parsed.pathname.replace("/", "");
        }
        if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
        // Shorts format
        if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2];
      } catch {}
      return null;
    };

    let transcriptText = "";
    let usedTranscript = false;

    try {
      // youtube-transcript can accept URL or videoId; try URL first
      const items = await YoutubeTranscript.fetchTranscript(url).catch(async () => {
        const vid = extractVideoId(url);
        if (!vid) throw new Error("Invalid YouTube URL");
        return YoutubeTranscript.fetchTranscript(vid);
      });

      if (Array.isArray(items) && items.length) {
        transcriptText = items.map((t) => t.text).join(" ");
        // Trim extremely long transcripts
        if (transcriptText.length > 16000) transcriptText = transcriptText.slice(0, 16000);
        usedTranscript = true;
      }
    } catch (e) {
      console.warn("Transcript fetch failed:", e?.message || e);
    }

    const aiManager = new AIProviderManager();

    const baseInstructions = `You are an expert study assistant. Create a clear, structured study summary with:\n- Title\n- 5-8 key takeaways\n- Short outline\n- Practical examples or formulas when relevant\n- Actionable tips for revision`;

    const prompt = usedTranscript
      ? `${baseInstructions}\n\nSummarize the following YouTube transcript in your own words, removing filler. Use concise bullet points and sections.\n\nTRANSCRIPT:\n${transcriptText}`
      : `${baseInstructions}\n\nNo transcript is available. Use general world knowledge to infer the likely content from the video URL and produce a helpful summary for a student.\nURL: ${url}`;

    const ai = await aiManager.getAIResponse(prompt, "together");

    return res.status(200).json({
      ok: true,
      usedTranscript,
      summary: ai.message,
      provider: ai.provider,
      model: ai.model,
    });
  } catch (error) {
    console.error("YouTube summarize error:", error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
}
