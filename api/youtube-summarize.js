// api/youtube-summarize.js
import { AIProviderManager } from "../src/lib/aiProviders.js";
import { YoutubeTranscript } from "youtube-transcript";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

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

    // Extract videoId helper
    const extractVideoId = (u) => {
      try {
        const parsed = new URL(u);
        if (parsed.hostname.includes("youtu.be")) {
          return parsed.pathname.replace("/", "");
        }
        if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
        if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2];
      } catch {}
      return null;
    };

    let transcriptText = "";
    let usedTranscript = false;

    // Try youtube-transcript first
    try {
      const items = await YoutubeTranscript.fetchTranscript(url).catch(async () => {
        const vid = extractVideoId(url);
        if (!vid) throw new Error("Invalid YouTube URL");
        return YoutubeTranscript.fetchTranscript(vid);
      });

      if (Array.isArray(items) && items.length) {
        transcriptText = items.map((t) => t.text).join(" ");
        if (transcriptText.length > 16000) transcriptText = transcriptText.slice(0, 16000);
        usedTranscript = true;
      }
    } catch (e) {
      console.warn("youtube-transcript failed:", e?.message || e);
    }

    // If youtube-transcript failed, try Puppeteer
    if (!usedTranscript) {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Handle cookies popup (EU)
        try {
          await page.waitForSelector('button[aria-label="Accept all"]', { timeout: 3000 });
          await page.click('button[aria-label="Accept all"]');
        } catch {}

        // Click 3-dot menu
        await page.waitForSelector("#more-button", { visible: true });
        await page.click("#more-button");

        // Click "Show transcript"
        await page.waitForSelector('tp-yt-paper-item:has-text("Show transcript")', { visible: true });
        await page.click('tp-yt-paper-item:has-text("Show transcript")');

        // Wait for transcript panel
        await page.waitForSelector("ytd-transcript-renderer", { visible: true });

        // Extract transcript
        transcriptText = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("ytd-transcript-segment-renderer"))
            .map((el) => {
              const text = el.querySelector(".segment-text")?.innerText.trim();
              return text;
            })
            .join(" ");
        });

        if (transcriptText) {
          if (transcriptText.length > 16000) transcriptText = transcriptText.slice(0, 16000);
          usedTranscript = true;
        }

        await browser.close();
      } catch (e) {
        console.warn("Puppeteer transcript failed:", e?.message || e);
      }
    }

    // Prepare AI prompt
    const aiManager = new AIProviderManager();
    const baseInstructions = `You are an expert study assistant. Create a clear, structured study summary with:
- Title
- 5-8 key takeaways
- Short outline
- Practical examples or formulas when relevant
- Actionable tips for revision`;

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
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
