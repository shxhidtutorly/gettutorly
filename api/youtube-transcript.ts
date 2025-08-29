// api/youtube-transcript.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Missing YouTube URL" });
    }

    // Call external API
    const response = await fetch("https://scrapecreators.com/api/transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SCRAPECREATORS_API_KEY}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Transcript API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Transcript API failed", err);
    return res.status(500).json({ error: "Transcript API failed" });
  }
}
