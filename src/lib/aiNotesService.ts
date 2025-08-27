// src/lib/aiNotesService.ts
// Client-side direct-calls version. REQUIRES VITE_* env vars to be set in Vercel.
// Warning: exposing API keys in client = insecure. Prefer server-side for production.

// --- 1. INTERFACES (same as before) ---
export interface AINoteContent {
  title: string;
  summary: string;
  keyTakeaways: string[];
  fullNotes: Array<{ heading: string; content: string }>;
}
export interface Flashcard { id: string; question: string; answer: string; }
export interface QuizQuestion { question: string; options: string[]; correct: number; explanation: string; }
export interface AINote {
  id: string;
  filename: string;
  timestamp: string;
  content: AINoteContent;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

// --- 2. CONFIG (read from import.meta.env Vite variables) ---
const apiConfig = {
  gemini: {
    apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY,
    model: 'gemini-1.5-flash-latest',
  },
  groq: {
    apiKey: (import.meta as any).env?.VITE_GROQ_API_KEY,
    model: 'openai/gpt-oss-20b',
  },
  mistral: {
    apiKey: (import.meta as any).env?.VITE_MISTRAL_API_KEY,
    model: 'open-mixtral-8x7b',
  },
  openrouter: {
    apiKey: (import.meta as any).env?.VITE_OPENROUTER_API_KEY,
    model: 'openai/gpt-oss-20b:free',
  },
} as const;

// small helper for safe JSON extraction
function tryParseJSON(candidate: string) {
  try { return JSON.parse(candidate); } catch { return null; }
}

// --- 3. MAIN fallback caller (tries providers in order) ---
async function callAIWithFallback(prompt: string): Promise<string> {
  const providersToTry = ['gemini','groq','openrouter','mistral'] as const;
  let lastError: Error | null = new Error("No API keys are configured. Please set VITE_GEMINI_API_KEY (or other VITE_* keys) in Vercel env and redeploy.");

  for (const provider of providersToTry) {
    const cfg = (apiConfig as any)[provider];
    if (!cfg || !cfg.apiKey) {
      console.warn(`API key for ${provider} is missing. Skipping.`);
      continue;
    }

    try {
      console.log(`🛰️ Trying provider: ${provider}`);
      let responseText = '';
      if (provider === 'gemini') {
        responseText = await callGeminiAPI(prompt, cfg.apiKey, cfg.model);
      } else {
        responseText = await callOpenAICompatibleAPI(provider as any, prompt, cfg.apiKey, cfg.model);
      }

      if (!responseText || responseText.trim().length < 20) {
        throw new Error(`Provider ${provider} returned an empty or too-short response.`);
      }

      console.log(`✅ Success from provider: ${provider}`);
      return responseText;

    } catch (err: any) {
      console.error(`❌ Provider ${provider} failed: ${err?.message || err}`);
      lastError = err;
      // continue to next provider
    }
  }

  throw lastError;
}

// --- 4. Provider implementations (client-side) ---

async function callGeminiAPI(prompt: string, apiKey: string, model: string): Promise<string> {
  // NOTE: Using the key as query param (Gemini GCP key) — works if key is an API key meant for client use.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.4,
      // you can tune other generation configs here
    },
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => null);
  if (!r.ok || (data && data.error)) {
    const msg = (data && data.error && data.error.message) ? data.error.message : `HTTP ${r.status}`;
    throw new Error(`Gemini API error: ${msg}`);
  }

  // Gemini often nests the text inside candidates[0].content.parts[0].text
  const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text) ?? (data?.candidates?.[0]?.content?.text) ?? '';
  if (!text) throw new Error('Gemini returned no textual content.');
  return String(text);
}

async function callOpenAICompatibleAPI(provider: 'groq'|'mistral'|'openrouter', prompt: string, apiKey: string, model: string): Promise<string> {
  const endpoints: Record<string,string> = {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    mistral: 'https://api.mistral.ai/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  };
  const url = endpoints[provider];

  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are a helpful study assistant. Output a single valid JSON object containing content, flashcards and quiz per instructions.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    // response_format: { type: "json_object" } // optional, some providers understand this
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const errMsg = data?.error?.message || data?.message || `HTTP ${r.status}`;
    throw new Error(`${provider} API error: ${errMsg}`);
  }

  // Flexible extraction:
  // - choices[0].message.content (chat response)
  // - choices[0].text (completion-style)
  const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';
  if (!content) throw new Error(`${provider} returned no content.`);
  return String(content);
}

// --- 5. JSON extractor (robust) ---
function extractJsonFromText(raw: string): string {
  if (!raw) throw new Error('Empty raw AI output');

  // 1) fenced ```json ... ```
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) return fenced[1].trim();

  // 2) any first {...} block
  const objectMatch = raw.match(/({[\s\S]*})/);
  if (objectMatch && objectMatch[1]) return objectMatch[1];

  // 3) maybe the model returned plain JSON without fences
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  throw new Error('AI response did not contain a recognizable JSON object.');
}

// --- 6. SAFE fetch helper for client-side errors ---
async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

// --- 7. MAIN exported function (used by components) ---
export async function generateNotesAI(text: string, filename: string): Promise<AINote> {
  const prompt = `You are an expert AI study assistant. Your task is to analyze the following source text and generate a structured JSON object containing comprehensive study materials.
Follow the provided JSON schema precisely. Your output MUST be a single, complete, valid JSON object and nothing else.

JSON Schema:
{
  "content": {
    "title": "<A concise, descriptive title>",
    "summary": "<3-5 sentence executive summary>",
    "keyTakeaways": ["<5-10 key takeaways>"],
    "fullNotes": [{ "heading": "<Section>", "content": "<Markdown notes>" }]
  },
  "flashcards": [{ "question": "<Q>", "answer": "<A>" }],
  "quiz": [{ "question": "<Q>", "options": ["A","B","C","D"], "correct": 0, "explanation": "<why>" }]
}

Now process the following source:
---
${text}
---`;

  try {
    const aiRaw = await callAIWithFallback(prompt);

    // Extract JSON text then parse
    const jsonText = extractJsonFromText(aiRaw);
    const parsed = tryParseJSON(jsonText);
    if (!parsed) throw new Error('Unable to parse JSON returned by AI.');

    const now = Date.now();
    const finalNote: AINote = {
      id: String(now),
      filename,
      timestamp: new Date().toISOString(),
      content: parsed.content ?? { title: `Notes for ${filename}`, summary: '', keyTakeaways: [], fullNotes: [] },
      flashcards: (Array.isArray(parsed.flashcards) ? parsed.flashcards : []).map((fc: any, i: number) => ({
        id: `${now}-${i}`,
        question: String(fc?.question ?? ''),
        answer: String(fc?.answer ?? ''),
      })),
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz.map((q: any) => ({
        question: String(q?.question ?? ''),
        options: Array.isArray(q?.options) ? q.options.map(String) : [],
        correct: Number.isInteger(q?.correct) ? q.correct : 0,
        explanation: String(q?.explanation ?? ''),
      })) : [],
    };

    return finalNote;

  } catch (err: any) {
    console.error('Fatal error in generateNotesAI:', err);
    throw new Error(`Failed to generate AI notes. ${err?.message || err}`);
  }
}
