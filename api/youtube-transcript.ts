// api/youtube-transcript.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Missing YouTube URL" });
    }

    const apiKey = process.env.SCRAPECREATORS_API_KEY;
    const apiUrl = `https://api.scrapecrafter.com/transcript?url=${encodeURIComponent(url)}&api_key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "Transcript API failed", details: data });
    }

    return res.status(200).json({ transcript: data });
  } catch (error) {
    console.error("Transcript API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
