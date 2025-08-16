// api/translate.js
import crypto from "crypto";
import fetch from "node-fetch"; // node >=18 has global fetch; keep this for environments without it
import admin from "firebase-admin";


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

/* ---------- replace callOpenRouter and translateChunkWithFallback with this block ---------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try calling OpenRouter with retries for transient errors.
 * On DNS/network errors (ENOTFOUND / EAI_AGAIN / ECONNREFUSED / ETIMEDOUT), throw an Error with code 'NETWORK'.
 * On non-OK status, throw an Error with code 'API'.
 */
const callOpenRouter = async (model, prompt, max_output_tokens = 2000) => {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  // allow override host if needed (useful for testing or enterprise)
  const baseUrl = process.env.OPENROUTER_API_HOST?.trim() || OPENROUTER_API;
  const payload = { model, input: prompt, temperature: 0, max_output_tokens };
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_KEY}`
  };
  if (process.env.VERCEL_URL) headers["HTTP-Referer"] = process.env.VERCEL_URL;

  const maxRetries = 2;
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const resp = await fetch(baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        // optional timeout handling: Node 18+ doesn't have built-in timeout; you can use AbortController if desired
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        const msg = `OpenRouter ${resp.status} - ${txt}`;
        const err = new Error(msg);
        err.code = "API";
        throw err;
      }

      const data = await resp.json().catch(() => null);
      const parsed = parseOpenRouterOutput(data);
      return parsed;
    } catch (err) {
      // Network / DNS errors usually contain ENOTFOUND, EAI_AGAIN, ECONNREFUSED, ETIMEDOUT in message
      const msg = String(err?.message || err);
      const isNetwork = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ENETUNREACH/i.test(msg);

      if (isNetwork) {
        // Mark error for caller to detect network problem
        const netErr = new Error("Network/DNS error when calling OpenRouter: " + msg);
        netErr.code = "NETWORK";
        throw netErr;
      }

      // For API errors, we might retry a bit (rate limits / transient server errors)
      attempt++;
      if (attempt > maxRetries) {
        err.code = err.code || "API";
        throw err;
      }
      // exponential backoff
      const wait = 300 * Math.pow(2, attempt);
      console.warn(`OpenRouter API request failed (attempt ${attempt}), retrying in ${wait}ms: ${msg}`);
      await sleep(wait);
    }
  }
};

/**
 * Fallback translators:
 * 1) LibreTranslate (public instance) - free, no key required but rate-limited.
 * 2) Google Translate API (if GOOGLE_TRANSLATE_API_KEY available) - paid but robust.
 */
const callLibreTranslate = async (text, source, target) => {
  try {
    const resp = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: source === "auto" ? "auto" : source, target, format: "text" })
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`LibreTranslate ${resp.status} - ${txt}`);
    }
    const data = await resp.json();
    return data?.translatedText || "";
  } catch (err) {
    throw new Error("LibreTranslate failed: " + (err.message || err));
  }
};

const callGoogleTranslateAPI = async (text, target) => {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("Google Translate API key missing");
  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target })
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Google Translate ${resp.status} - ${txt}`);
    }
    const data = await resp.json();
    if (data?.data?.translations && data.data.translations.length > 0) {
      return data.data.translations.map(t => t.translatedText).join("\n\n");
    }
    throw new Error("No translation returned from Google");
  } catch (err) {
    throw new Error("Google Translate failed: " + (err.message || err));
  }
};

/**
 * Try modelCandidates using OpenRouter, but if network/DNS error occurs for OpenRouter,
 * fall back immediately to LibreTranslate and/or Google Translate.
 */
const translateChunkWithFallback = async (chunk, targetLang, sourceLang, modelCandidates) => {
  const errors = [];
  let aggregatedResult = { translatedText: chunk, modelUsed: "none", errors: [] };

  // Try OpenRouter models first (modelCandidates is an array of model strings)
  for (const model of modelCandidates) {
    try {
      const estTokens = Math.max(256, Math.ceil(chunk.length / 4) + 200);
      const maxOutputTokens = Math.min(estTokens, 120_000);
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
      if (translated && String(translated).trim().length > 0) {
        aggregatedResult.translatedText = String(translated).trim();
        aggregatedResult.modelUsed = model;
        return aggregatedResult;
      } else {
        errors.push({ model, reason: "empty result" });
      }
    } catch (err) {
      const code = err.code || "";
      errors.push({ model, error: err.message || String(err), code });
      // If this was a NETWORK error (DNS/outbound blocked) -> break and fallback to other translator
      if (code === "NETWORK") {
        console.warn("OpenRouter network error detected, will fallback to LibreTranslate/Google Translate:", err.message);
        break; // break out of model loop to try fallback translators
      }
      // For API errors continue to next model
      continue;
    }
  }

  // If we reached here, either OpenRouter models exhausted OR a network error occurred.
  // Try LibreTranslate first (free public service).
  try {
    const lib = await callLibreTranslate(chunk, sourceLang, targetLang);
    if (lib && lib.trim().length > 0) {
      aggregatedResult.translatedText = String(lib).trim();
      aggregatedResult.modelUsed = "libretranslate";
      aggregatedResult.errors = errors;
      return aggregatedResult;
    }
  } catch (libErr) {
    errors.push({ libretranslate: libErr.message || String(libErr) });
  }

  // Next fallback: Google Cloud Translate (if API key present)
  try {
    const google = await callGoogleTranslateAPI(chunk, targetLang);
    if (google && google.trim().length > 0) {
      aggregatedResult.translatedText = String(google).trim();
      aggregatedResult.modelUsed = "google-translate";
      aggregatedResult.errors = errors;
      return aggregatedResult;
    }
  } catch (gErr) {
    errors.push({ google: gErr.message || String(gErr) });
  }

  // All fallbacks failed, return original chunk and note errors
  aggregatedResult.errors = errors;
  aggregatedResult.modelUsed = "none";
  return aggregatedResult;
};
