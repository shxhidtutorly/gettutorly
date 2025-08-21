import { PassThrough } from "stream";
import multiparty from "multiparty";

// IMPORTANT: AssemblyAI and Deepgram SDKs are a bit complex to use in a generic Next.js/Vercel serverless function with streaming files.
// A simpler, more robust approach is to upload the file to a public URL (like AWS S3 or a local file system) first and then pass that URL to the APIs.
// This example uses a simplified approach for demonstration, assuming the API can handle a direct stream.
// A better production-level solution might involve uploading the blob to a temporary storage first.
// The provided code handles the file directly from the request stream.

// Make sure you have the following environment variables set in Vercel:
// ASSEMBLYAI_API_KEY
// DEEPGRAM_API_KEY
// GEMINI_API_KEY

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser so we can handle the file stream
  },
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new multiparty.Form();
  let file;
  let provider;

  try {
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    file = data.files.audio[0];
  } catch (err) {
    console.error("Error parsing form data:", err);
    return res.status(400).json({ error: "Failed to parse audio file" });
  }

  let finalTranscript = null;

  // --- Try AssemblyAI (Primary) ---
  try {
    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) throw new Error("AssemblyAI API key not configured.");

    console.log("Attempting transcription with AssemblyAI...");
    const stream = new PassThrough();
    req.pipe(stream);

    const assemblyResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: assemblyAIKey, "Content-Type": file.headers["content-type"] },
      body: stream,
    });
    const uploadData = await assemblyResponse.json();
    if (!assemblyResponse.ok) throw new Error(uploadData.error || "Failed to upload to AssemblyAI.");
    
    const audioUrl = uploadData.upload_url;
    const transcriptRequest = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: assemblyAIKey, "Content-Type": "application/json" },
      body: JSON.stringify({ audio_url: audioUrl }),
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

      console.log("Attempting transcription with Deepgram...");
      const stream = new PassThrough();
      req.pipe(stream);
      
      const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen?punctuate=true&diarize=true", {
        method: "POST",
        headers: { authorization: `Token ${deepgramKey}`, "Content-Type": file.headers["content-type"] },
        body: stream,
      });

      const deepgramData = await deepgramResponse.json();
      if (!deepgramResponse.ok) throw new Error(deepgramData.error || "Deepgram API call failed.");
      
      finalTranscript = deepgramData.results.channels[0].alternatives[0].transcript;
      provider = "Deepgram";

    } catch (err) {
      console.error("Deepgram failed:", err.message);

      // --- Try Gemini Pro (Fallback 2) ---
      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) throw new Error("Gemini API key not configured.");

        console.log("Attempting transcription with Gemini Pro...");
        // This is a simplified fallback. Gemini 1.5 Pro can handle audio, but direct file
        // upload via API is more complex. A more robust solution would be to use a
        // dedicated multimodal API route. This example passes a base64 encoded string.
        const audioBuffer = await new Promise((resolve, reject) => {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
          req.on('error', reject);
        });

        const base64Audio = audioBuffer.toString('base64');
        
        const geminiResponse = await fetch(`${process.env.VERCEL_URL}/api/ai`, {
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

  // Final successful response
  return res.status(200).json({
    transcript: finalTranscript,
    provider: provider,
  });
}
