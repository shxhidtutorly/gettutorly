// /api/youtube-transcript.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SCRAPE_CREATORS_ENDPOINT = 'https://api.scrapecreators.com/v1/youtube/video/transcript';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET with ?url=' });
    return;
  }

  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server missing SCRAPECREATORS_API_KEY' });
    return;
  }

  const url = (req.query.url as string) || '';
  if (!url) {
    res.status(400).json({ error: 'Missing required query param: url' });
    return;
  }

  try {
    const upstream = await fetch(`${SCRAPE_CREATORS_ENDPOINT}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: { 'x-api-key': apiKey },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      res.status(upstream.status).json({
        error: `ScrapeCreators error: ${upstream.status}`,
        details: text?.slice(0, 500),
      });
      return;
    }

    const data = await upstream.json();
    // Normalize a tiny bit so the frontend always has a flat `transcriptText`
    const transcriptText =
      data?.transcript_only_text ??
      (Array.isArray(data?.transcript)
        ? data.transcript.map((t: any) => t.text).join(' ')
        : '');

    res.status(200).json({
      success: true,
      videoId: data?.videoId,
      type: data?.type,
      url: data?.url,
      language: data?.language,
      transcriptText,
      raw: data, // optional: keep full payload for debugging / future features
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch transcript', details: err?.message });
  }
}
