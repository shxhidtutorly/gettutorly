// api/translate.js (CommonJS - drop into your serverless functions folder)make sure to add meta-llama/Llama-Vision-Free with together ai api
const crypto = require("crypto");

let fetchFn;
try {
  // prefer global fetch
  fetchFn = globalThis.fetch;
} catch (e) {
  fetchFn = undefined;
}

const dynamicFetch = async (...args) => {
  if (typeof fetchFn === "function") return fetchFn(...args);
  // dynamic import node-fetch if global fetch not present
  const nf = await import("node-fetch").then(m => m.default || m);
  return nf(...args);
};

// Firebase Admin (optional)
let admin;
let firestore = null;
try {
  admin = require("firebase-admin");
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    try {
      const cred = typeof svc === "string" ? JSON.parse(svc) : svc;
      if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(cred) });
      }
      firestore = admin.firestore();
    } catch (err) {
      console.warn("Failed to init Firebase Admin (invalid FIREBASE_SERVICE_ACCOUNT):", err.message);
      firestore = null;
    }
  } else {
    console.info("FIREBASE_SERVICE_ACCOUNT not provided — skipping Firestore cache.");
  }
} catch (err) {
  console.info("firebase-admin not installed or failed to load — skipping Firestore cache.");
  firestore = null;
}

const OPENROUTER_API = process.env.OPENROUTER_API_HOST?.trim() || "https://api.openrouter.ai/v1/responses";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || null;
const GOOGLE_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || null;

const generateHash = (text, targetLang) =>
  crypto.createHash("sha256").update(text + ":" + targetLang).digest("hex");

// Models ordered by preference (free/generous early)
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

// Chunker: tries to preserve code fences and paragraphs
const splitIntoChunks = (text, maxChunkChars = 100000) => {
  if (!text) return [];
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let current = "";
  let openFence = false;
  const fenceCount = (s) => (s.match(/```/g) || []).length;
  for (const p of paragraphs) {
    const fc = fenceCount(p);
    if (fc % 2 === 1) openFence = !openFence;
    if (!openFence && (current.length + p.length + 2) > maxChunkChars) {
      if (current) {
        chunks.push(current);
        current = p;
      } else {
        // paragraph itself too large
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

// Parse OpenRouter / generic responses (try multiple shapes)
const parseOpenRouterOutput = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.output_text) return data.output_text;
  if (Array.isArray(data.output)) {
    const txts = data.output.map((o) => {
      if (typeof o === "string") return o;
      if (o?.content) {
        if (typeof o.content === "string") return o.content;
        if (Array.isArray(o.content)) {
          return o.content.map(c => c?.text || c?.content || "").join("");
        }
      }
      if (o?.text) return o.text;
      return "";
    });
    return txts.filter(Boolean).join("\n\n");
  }
  if (data?.generations && Array.isArray(data.generations)) {
    return data.generations.map(g => g.text || g.output || "").join("\n\n");
  }
  if (data?.choices && Array.isArray(data.choices)) {
    const c = data.choices[0];
    if (c?.message?.content) return c.message.content;
    if (c?.text) return c.text;
    if (c?.message?.text) return c.message.text;
  }
  if (data?.result) return data.result;
  // fallback
  try { return JSON.stringify(data); } catch(e) { return String(data) || ""; }
};

// Call OpenRouter (with error classification)
const callOpenRouter = async (model, prompt, max_output_tokens = 2000) => {
  if (!OPENROUTER_KEY) throw Object.assign(new Error("OPENROUTER_API_KEY not configured"), { code: "NO_KEY" });

  const payload = { model, input: prompt, temperature: 0, max_output_tokens };
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_KEY}` };
  if (process.env.VERCEL_URL) headers["HTTP-Referer"] = process.env.VERCEL_URL;

  // use dynamicFetch
  let resp;
  try {
    resp = await dynamicFetch(OPENROUTER_API, { method: "POST", headers, body: JSON.stringify(payload) });
  } catch (err) {
    // network/DNS error -> mark as NETWORK
    const msg = String(err.message || err);
    const e = new Error("Network/DNS error calling OpenRouter: " + msg);
    e.code = "NETWORK";
    throw e;
  }

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    const e = new Error(`OpenRouter ${resp.status} - ${txt}`);
    e.code = "API";
    throw e;
  }

  const data = await resp.json().catch(() => null);
  return parseOpenRouterOutput(data);
};

// LibreTranslate public fallback
const callLibreTranslate = async (text, source, target) => {
  try {
    const resp = await dynamicFetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: source === "auto" ? "auto" : (source || "auto"), target, format: "text" })
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

// Google Translate fallback (if key present)
const callGoogleTranslateAPI = async (text, target) => {
  if (!GOOGLE_KEY) throw new Error("GOOGLE_TRANSLATE_API_KEY not configured");
  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(GOOGLE_KEY)}`;
  const resp = await dynamicFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target })
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Google Translate ${resp.status} - ${txt}`);
  }
  const data = await resp.json();
  if (data?.data?.translations && data.data.translations.length) {
    return data.data.translations.map(t => t.translatedText).join("\n\n");
  }
  throw new Error("Google translate returned no translations");
};

// translate chunk with model fallback and fallback translators
const translateChunkWithFallback = async (chunk, targetLang, sourceLang, modelCandidates) => {
  const errors = [];

  // estimate tokens for max_output_tokens
  const estTokens = Math.max(256, Math.ceil(chunk.length / 4) + 200);
  const maxOutputTokens = Math.min(estTokens, 120000);

  // Try OpenRouter models in order
  for (const model of modelCandidates) {
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
      if (translated && String(translated).trim().length) {
        return { translatedText: String(translated).trim(), modelUsed: model, errors: null };
      } else {
        errors.push({ model, reason: "empty result" });
      }
    } catch (err) {
      const code = err.code || "";
      errors.push({ model, error: err.message || String(err), code });
      // network error -> break and go to generic translator fallback
      if (code === "NETWORK") {
        break;
      }
      // otherwise try next model
    }
  }

  // Fallback translators (LibreTranslate -> Google)
  try {
    const lib = await callLibreTranslate(chunk, sourceLang, targetLang);
    if (lib && lib.trim().length) return { translatedText: lib.trim(), modelUsed: "libretranslate", errors };
  } catch (libErr) {
    errors.push({ libretranslate: libErr.message || String(libErr) });
  }

  if (GOOGLE_KEY) {
    try {
      const g = await callGoogleTranslateAPI(chunk, targetLang);
      if (g && g.trim().length) return { translatedText: g.trim(), modelUsed: "google-translate", errors };
    } catch (gErr) {
      errors.push({ google: gErr.message || String(gErr) });
    }
  }

  // nothing worked — return original chunk
  return { translatedText: chunk, modelUsed: "none", errors };
};

// Firestore helpers
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

// HTTP handler (Express/Next/Vercel style)
const httpHandler = async (req, res) => {
  // CORS headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Accept raw JSON body or string
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { text, targetLang, sourceLang = "auto", contextType = "general" } = body ?? {};

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing required fields: text, targetLang" });
    }

    if (sourceLang && sourceLang !== "auto" && sourceLang === targetLang) {
      return res.json({ translatedText: text, cached: false, modelUsed: "none" });
    }

    const hash = generateHash(text, targetLang);
    const cached = await getCachedTranslation(hash);
    if (cached && cached.translatedText) {
      return res.status(200).json({ translatedText: cached.translatedText, cached: true, modelUsed: cached.modelUsed || "cached" });
    }

    const chunks = splitIntoChunks(text, 100000);
    console.info(`Translating ${chunks.length} chunk(s) -> ${targetLang}`);

    const initialModel = selectModel(text.length);
    const startIndex = MODELS.indexOf(initialModel);
    const modelCandidates = MODELS.slice(startIndex).concat(MODELS.slice(0, startIndex));

    const translatedChunks = [];
    const modelUsedSet = new Set();
    for (const chunk of chunks) {
      const { translatedText, modelUsed, errors } = await translateChunkWithFallback(chunk, targetLang, sourceLang, modelCandidates);
      translatedChunks.push(translatedText);
      if (modelUsed && modelUsed !== "none") modelUsedSet.add(modelUsed);
      if (errors && errors.length) console.debug("Chunk translation errors:", errors);
    }

    const finalTranslation = translatedChunks.join("\n\n");
    const finalModelUsed = modelUsedSet.size ? Array.from(modelUsedSet).join(",") : "none";

    // cache
    await setCachedTranslation(hash, {
      hash,
      sourceLang,
      targetLang,
      originalText: text,
      translatedText: finalTranslation,
      modelUsed: finalModelUsed,
      createdAt: admin && admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    });

    return res.status(200).json({ translatedText: finalTranslation, cached: false, modelUsed: finalModelUsed });
  } catch (err) {
    console.error("Translation handler error:", err);
    return res.status(500).json({ error: "Translation failed", details: err?.message || String(err) });
  }
};

// Lambda adapter (API Gateway / Lambda style)
const lambdaHandler = async (event, context) => {
  // Build simple req/res adapter for AWS style
  const body = event?.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};
  // simple mock of res object
  let statusCode = 200;
  const headers = { "Content-Type": "application/json" };
  try {
    const req = { method: event.httpMethod || "POST", body };
    // call httpHandler and capture response by hijacking res object
    const res = {
      status(code) { statusCode = code; return this; },
      setHeader(k, v) { headers[k] = v; },
      json(payload) { return { statusCode, headers, body: JSON.stringify(payload) }; },
      end() { return { statusCode, headers, body: "" }; }
    };
    const out = await httpHandler(req, res);
    // If handler itself returned response, forward it
    if (out && out.statusCode) return out;
    // By default return OK with whatever last res.json returned (but httpHandler returns its own res)
    // to be safe return 200
    return { statusCode, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};

// Export for HTTP server frameworks (Next/Vercel/Express style)
module.exports = httpHandler;
// Also export Lambda-style handler
module.exports.handler = lambdaHandler;
