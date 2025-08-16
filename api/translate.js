// api/translate.js
import crypto from "crypto";
import fetch from "node-fetch"; // node >=18 has global fetch; keep this for environments without it
import admin from "firebase-admin";

/**
 * NOTES:
 * - Expects FIREBASE_SERVICE_ACCOUNT env var (stringified JSON service account).
 * - Expects OPENROUTER_API_KEY env var.
 * - This file:
 *    - initializes Firebase Admin (only once),
 *    - checks Firestore cache (collection: translations),
 *    - chunks input (preserving code fences),
 *    - tries a list of models in order with fallback per chunk,
 *    - stores successful translations into Firestore cache.
 */

/* ---------------------- Firebase Admin init ---------------------- */
function initFirebaseAdmin() {
  if (admin.apps?.length) return admin.app();
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svc) {
    console.warn("FIREBASE_SERVICE_ACCOUNT not set — caching disabled.");
    return null;
  }
  let cred;
  try {
    cred = JSON.parse(svc);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", err.message);
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(cred),
    });
  } catch (err) {
    // In many serverless envs re-initialization throws; fallback to existing app
    if (admin.apps?.length) return admin.app();
    throw err;
  }
}

const firebaseApp = initFirebaseAdmin();
const firestore = firebaseApp ? admin.firestore() : null;

/* ---------------------- Helpers ---------------------- */
const generateHash = (text, targetLang) =>
  crypto.createHash("sha256").update(text + ":" + targetLang).digest("hex");

// list of fallback models (ordered). Prioritize free/generous context where possible.
const MODELS = [
  "google/gemini-2.5-pro-exp-03-25",
  "qwen/qwen3-coder:free",
  "openai/gpt-oss-20b:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "mistralai/mistral-small-3.2-24b-instruct:free",
  "google/gemma-3n-e2b-it:free",
  "mistralai/mistral-7b-instruct:free"
];

const selectModel = (textLength) => {
  if (textLength > 600_000) return MODELS[0];
  if (textLength > 150_000) return MODELS[1];
  if (textLength > 40_000) return MODELS[2];
  if (textLength > 8_000) return MODELS[3];
  return MODELS[MODELS.length - 1];
};

/**
 * Chunker that tries to respect paragraph boundaries and code fences.
 * - Splits by double-newline paragraphs, but keeps code fences intact.
 * - maxChunkChars default 100k characters (tuneable).
 */
const splitIntoChunks = (text, maxChunkChars = 100000) => {
  if (!text) return [];
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let current = "";
  let openFence = false;

  const fenceCount = (s) => (s.match(/```/g) || []).length;

  for (const p of paragraphs) {
    const fenceInPara = fenceCount(p);
    // Toggle openFence if odd number of fences in paragraph
    if (fenceInPara % 2 === 1) {
      openFence = !openFence;
    }

    // If adding paragraph would exceed size and not inside code block, flush
    if (!openFence && (current.length + p.length + 2) > maxChunkChars) {
      if (current) {
        chunks.push(current);
        current = p;
      } else {
        // paragraph itself is bigger than chunk size; push it as-is
        chunks.push(p);
        current = "";
      }
    } else {
      current += (current ? "\n\n" : "") + p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

/* ---------------------- OpenRouter call + parsing ---------------------- */
const OPENROUTER_API = "https://api.openrouter.ai/v1/responses"; // recommended
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_KEY) {
  console.warn("Warning: OPENROUTER_API_KEY not set — OpenRouter calls will fail.");
}

const parseOpenRouterOutput = (data) => {
  // OpenRouter responses vary by client; try common shapes:
  // 1) data.output_text
  if (data?.output_text) return data.output_text;
  // 2) data.output (array) -> find text fields
  if (Array.isArray(data?.output)) {
    // outputs often contain objects with 'content' or 'text'
    const texts = data.output.map((o) => {
      if (typeof o === "string") return o;
      if (o?.content) {
        if (typeof o.content === "string") return o.content;
        if (Array.isArray(o.content)) {
          return o.content.map((c) => (c?.text || c?.content || "")).join("");
        }
      }
      if (o?.text) return o.text;
      return "";
    });
    return texts.filter(Boolean).join("\n\n");
  }
  // 3) data?.generations or data?.choices style
  if (data?.generations && Array.isArray(data.generations)) {
    return data.generations.map((g) => g.text || g?.output || "").join("\n\n");
  }
  if (data?.choices && Array.isArray(data.choices)) {
    const c = data.choices[0];
    if (c?.message?.content) return c.message.content;
    if (c?.message?.text) return c.message.text;
    if (c?.text) return c.text;
  }
  // fallback: stringify
  return JSON.stringify(data);
};

const callOpenRouter = async (model, prompt, max_output_tokens = 2000) => {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  const payload = {
    model,
    input: prompt,
    temperature: 0,
    max_output_tokens,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_KEY}`,
  };
  // Provide referer if possible (some providers require)
  if (process.env.VERCEL_URL) headers["HTTP-Referer"] = process.env.VERCEL_URL;

  const resp = await fetch(OPENROUTER_API, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    const msg = `OpenRouter ${resp.status} - ${txt}`;
    const err = new Error(msg);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  const raw = parseOpenRouterOutput(data);
  return raw;
};

/* ---------------------- translateChunk with fallback ---------------------- */
const translateChunkWithFallback = async (chunk, targetLang, sourceLang, modelCandidates) => {
  const results = { translatedText: chunk, modelUsed: "none", errors: [] };

  // compute a safe max_output_tokens based on chunk length (chars -> tokens approx /4)
  const estTokens = Math.max(256, Math.ceil(chunk.length / 4) + 200);
  const maxOutputTokens = Math.min(estTokens, 120_000); // conservative cap

  for (let idx = 0; idx < modelCandidates.length; idx++) {
    const model = modelCandidates[idx];
    try {
      const prompt = `You are an expert translator. Translate the following text to ${targetLang}.
Requirements:
- Preserve formatting: headings, bullet lists, numbered lists, tables, and code blocks (\`\`\`).
- Keep special markers (e.g., "<<ANSWER: A>>") unchanged.
- Preserve inline code, variable names, and file names exactly.
- Do NOT add commentary or explain translations — output only the translated text.
Source language: ${sourceLang}
-----
${chunk}`;

      const translated = await callOpenRouter(model, prompt, maxOutputTokens);
      if (translated && translated.trim().length > 0) {
        results.translatedText = String(translated).trim();
        results.modelUsed = model;
        return results;
      } else {
        results.errors.push({ model, reason: "empty result" });
      }
    } catch (err) {
      console.error(`translateChunk: model ${model} failed:`, err.message || err);
      results.errors.push({ model, error: err.message || String(err) });
      // continue to next model
    }
  }

  // all models failed — return original text with modelUsed 'none'
  return results;
};

/* ---------------------- Firestore cache helpers ---------------------- */
const getCachedTranslation = async (hash) => {
  if (!firestore) return null;
  try {
    const doc = await firestore.collection("translations").doc(hash).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (err) {
    console.warn("Firestore read error:", err.message || err);
    return null;
  }
};

const setCachedTranslation = async (hash, payload) => {
  if (!firestore) return;
  try {
    await firestore.collection("translations").doc(hash).set(payload, { merge: true });
  } catch (err) {
    console.warn("Firestore write error:", err.message || err);
  }
};

/* ---------------------- Handler ---------------------- */
export default async function handler(req, res) {
  // CORS preflight / headers (adjust to your needs)
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { text, targetLang, sourceLang = "auto", contextType = "general" } = body ?? {};

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing required fields: text, targetLang" });
    }

    // If sourceLang provided and equals targetLang, nothing to do
    if (sourceLang && sourceLang !== "auto" && sourceLang === targetLang) {
      return res.json({ translatedText: text, cached: false, modelUsed: "none" });
    }

    // Compute cache hash
    const hash = generateHash(text, targetLang);

    // Firestore cache check
    const cached = await getCachedTranslation(hash);
    if (cached && cached.translatedText) {
      console.log("Translation cache hit:", hash);
      return res.status(200).json({
        translatedText: cached.translatedText,
        cached: true,
        modelUsed: cached.modelUsed || "cached"
      });
    }

    // Prepare chunking
    const chunks = splitIntoChunks(text, 100000);
    console.log(`Translating text in ${chunks.length} chunk(s) -> target: ${targetLang}`);

    // Build model candidate list starting at selected model
    const initialModel = selectModel(text.length);
    const startIndex = MODELS.indexOf(initialModel);
    const modelCandidates = MODELS.slice(startIndex).concat(MODELS.slice(0, startIndex)); // try selected then others

    const translatedChunks = [];
    const modelUses = new Set();

    for (const chunk of chunks) {
      const { translatedText, modelUsed, errors } = await translateChunkWithFallback(chunk, targetLang, sourceLang, modelCandidates);
      translatedChunks.push(translatedText);
      if (modelUsed && modelUsed !== "none") modelUses.add(modelUsed);
      if (errors && errors.length) {
        console.debug("Chunk translation errors:", errors);
      }
    }

    const finalTranslation = translatedChunks.join("\n\n");
    const finalModelUsed = modelUses.size ? Array.from(modelUses).join(",") : "none";

    // Cache in Firestore
    await setCachedTranslation(hash, {
      hash,
      sourceLang,
      targetLang,
      originalText: text,
      translatedText: finalTranslation,
      modelUsed: finalModelUsed,
      createdAt: admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    });

    return res.status(200).json({
      translatedText: finalTranslation,
      cached: false,
      modelUsed: finalModelUsed
    });

  } catch (err) {
    console.error("Translation handler error:", err);
    return res.status(500).json({
      error: "Translation failed",
      details: err?.message || String(err)
    });
  }
}
