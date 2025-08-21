// File: gettutorly/api/audio-to-notes.js

import { PassThrough } from "stream";
import { Buffer } from "buffer";

// We need a specific package to parse multipart/form-data in a serverless function
// You will need to install this: npm install form-data-parser
import { parse } from "form-data-parser";

// Make sure you have these environment variables set in Vercel
// ASSEMBLYAI_API_KEY
// DEEPGRAM_API_KEY
// GEMINI_API_KEY

// The Vercel function configuration
export const config = {
  api: {
    bodyParser: false, // Must be false to handle file uploads
  },
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let fileStream;
  let fileType;
  let provider;
  let finalTranscript = null;

  try {
    // Parse the incoming multipart form data
    const parsedData = await parse(req, req.headers);
    if (!parsedData.files.audio || parsedData.files.audio.length === 0) {
        return res.status(400).json({ error: "No audio file provided" });
    }
    const audioFile = parsedData.files.audio[0];
    fileStream = audioFile.content;
    fileType = audioFile.mimeType;

  } catch (err) {
    console.error("Error parsing form data:", err);
    return res.status(400).json({ error: "Failed to parse audio file" });
  }

  // --- Try AssemblyAI (Primary) ---
  try {
    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) throw new Error("AssemblyAI API key not configured.");

    console.log("Attempting transcription with AssemblyAI...");

    // 1. Upload the file to AssemblyAI's temporary upload endpoint
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: assemblyAIKey,
        "Content-Type": fileType,
        "Transfer-Encoding": "chunked"
      },
      body: fileStream,
    });
    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(uploadData.error || "Failed to upload to AssemblyAI.");
    
    // 2. Start transcription job
    const audioUrl = uploadData.upload_url;
    const transcriptRequest = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: assemblyAIKey, "Content-Type": "application/json" },
      body: JSON.stringify({ audio_url: audioUrl }),
    });
    const { id: transcriptId } = await transcriptRequest.json();

    // 3. Poll for the result
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
      
      // We need to re-create the stream because it was consumed by AssemblyAI
      const tempBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        fileStream.on('data', chunk => chunks.push(chunk));
        fileStream.on('end', () => resolve(Buffer.concat(chunks)));
        fileStream.on('error', reject);
      });
      const newStream = new PassThrough();
      newStream.end(tempBuffer);

      const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen?punctuate=true&diarize=true", {
        method: "POST",
        headers: { authorization: `Token ${deepgramKey}`, "Content-Type": fileType },
        body: newStream,
      });

      const deepgramData = await deepgramResponse.json();
      if (!deepgramResponse.ok) throw new Error(deepgramData.error || "Deepgram API call failed.");
      
      finalTranscript = deepgramData.results.channels[0].alternatives[0].transcript;
      provider = "Deepgram";

    } catch (err) {
      console.error("Deepgram failed:", err.message);

      // --- Try Gemini Pro (Fallback 2) ---
      try {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error("Gemini API key not configured.");

        console.log("Attempting transcription with Gemini Pro...");
        
        // As before, we need a buffer for Gemini's API
        const tempBuffer = await new Promise((resolve, reject) => {
          const chunks = [];
          fileStream.on('data', chunk => chunks.push(chunk));
          fileStream.on('end', () => resolve(Buffer.concat(chunks)));
          fileStream.on('error', reject);
        });

        const base64Audio = tempBuffer.toString('base64');
        
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

  // Final successful response
  return res.status(200).json({
    transcript: finalTranscript,
    provider: provider,
  });
}
