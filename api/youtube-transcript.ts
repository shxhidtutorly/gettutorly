// api/youtube-transcript.js
// Vercel Edge API (ESM). Replace your file contents with this exact code.

export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    // parse query param from the incoming Request URL
    const { searchParams } = new URL(req.url);
    const youtubeUrl = searchParams.get("url");

    if (!youtubeUrl) {
      return new Response(JSON.stringify({ success: false, error: "Missing required query param: url" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const apiKey = process.env.SCRAPECREATORS_API_KEY;
    if (!apiKey) {
      // server-side config missing
      return new Response(JSON.stringify({ success: false, error: "Server missing SCRAPECREATORS_API_KEY" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const endpoint = "https://api.scrapecreators.com/v1/youtube/video/transcript";
    const upstreamUrl = `${endpoint}?url=${encodeURIComponent(youtubeUrl)}`;

    const upstreamResp = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json",
      },
    });

    const rawText = await upstreamResp.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (parseErr) {
      // upstream returned non-JSON (rare) — include raw text in response for debug
      data = { rawText };
    }

    if (!upstreamResp.ok) {
      console.error("ScrapeCreators upstream error", { status: upstreamResp.status, body: rawText });
      return new Response(
        JSON.stringify({
          success: false,
          error: "ScrapeCreators returned an error",
          status: upstreamResp.status,
          details: data,
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    // Normalize transcript text
    const transcriptText =
      data?.transcript_only_text ??
      (Array.isArray(data?.transcript) ? data.transcript.map((t) => t.text).join(" ") : "");

    return new Response(
      JSON.stringify({
        success: true,
        videoId: data?.videoId ?? null,
        type: data?.type ?? null,
        url: data?.url ?? youtubeUrl,
        language: data?.language ?? null,
        transcriptText,
        raw: data,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    // Catch-all (Edge runtime preserves console)
    console.error("youtube-transcript edge handler error:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error", details: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
