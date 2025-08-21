import { Buffer } from "buffer";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { audio_url } = req.body;
  if (!audio_url) {
    return res.status(400).json({ error: "Audio URL is required in the request body" });
  }

  let finalTranscript = null;
  let provider;

  // --- Try AssemblyAI (Primary) ---
  try {
    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) throw new Error("AssemblyAI API key not configured.");

    console.log("Attempting transcription with AssemblyAI using URL...");

    const transcriptRequest = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: assemblyAIKey, "Content-Type": "application/json" },
      body: JSON.stringify({ audio_url: audio_url }),
    });
    const { id: transcriptId } = await transcriptRequest.json();

    let transcript;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: assemblyAIKey },
      });
      transcript = await statusResponse.json();
      if (transcript.status === "completed") break;
      if (transcript.status === "error") throw new Error(`Transcription failed: ${transcript.error}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    if (!transcript || transcript.status !== "completed") throw new Error("AssemblyAI transcription timed out.");

    finalTranscript = transcript.text;
    provider = "AssemblyAI";

  } catch (err) {
    console.error("AssemblyAI failed:", err.message);

    // --- Try Deepgram (Fallback 1) ---
    try {
      const deepgramKey = process.env.DEEPGRAM_API_KEY;
      if (!deepgramKey) throw new Error("Deepgram API key not configured.");

      console.log("Attempting transcription with Deepgram using URL...");

      const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen?punctuate=true&diarize=true", {
        method: "POST",
        headers: { authorization: `Token ${deepgramKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: audio_url }),
      });

      const deepgramData = await deepgramResponse.json();
      if (!deepgramResponse.ok) throw new Error(deepgramData.error || "Deepgram API call failed.");

      finalTranscript = deepgramData.results.channels[0].alternatives[0].transcript;
      provider = "Deepgram";

    } catch (err) {
      console.error("Deepgram failed:", err.message);

      // --- Try Gemini Pro (Fallback 2) ---
      // Gemini requires a base64 encoded file, so we must download it first.
      try {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error("Gemini API key not configured.");

        console.log("Attempting transcription with Gemini Pro...");

        const downloadResponse = await fetch(audio_url);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download audio from URL: ${downloadResponse.status}`);
        }
        const audioBuffer = await downloadResponse.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        const geminiResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: "Transcribe the following audio content into text. Do not add any extra commentary or summary, just provide the full transcription.",
            audio: base64Audio,
            model: "gemini",
          }),
        });

        const geminiData = await geminiResponse.json();
        if (!geminiResponse.ok) throw new Error(geminiData.error || "Gemini API call failed.");

        finalTranscript = geminiData.response;
        provider = "Gemini Pro";

      } catch (err) {
        console.error("Gemini fallback failed:", err.message);
        return res.status(500).json({
          error: "Transcription failed with all fallback providers.",
          details: err.message,
        });
      }
    }
  }

  return res.status(200).json({
    transcript: finalTranscript,
    provider: provider,
  });
}
