// src/lib/aiNotesService.ts

// --- 1. INTERFACES (Defines the JSON structure we want from the AI) ---

export interface AINoteContent {
  title: string;
  summary: string;
  keyTakeaways: string[];
  fullNotes: Array<{
    heading: string;
    content: string; // Markdown format
  }>;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // 0-based index
  explanation: string;
}

export interface AINote {
  id: string;
  filename: string;
  timestamp: string;
  content: AINoteContent;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

// --- 2. SELF-CONTAINED AI CALLING LOGIC ---

/**
 * Helper to perform fetch with a timeout.
 */
async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 90_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort("Request timed out"), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Tries a list of AI models in order until one returns a valid response.
 * This function calls your local /api/ai endpoint.
 */
async function callAIWithFallback(prompt: string, userId?: string): Promise<string> {
  // Model priority list: Gemini is first, followed by fast/reliable fallbacks.
  const modelsToTry = [
    'gemini',
    'groq',
    'openrouter',
    'claude', // Good for structured data
    'mistral',
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🛰️ Trying model: ${model}`);
      const resp = await fetchWithTimeout('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, userId, response_format: 'json' }) // IMPORTANT: We request JSON format
      });

      if (!resp.ok) {
        throw new Error(`API returned HTTP ${resp.status} for model ${model}`);
      }

      const data = await resp.json();
      const resultText = data.response || data.result || data.message;

      if (!resultText || typeof resultText !== 'string' || resultText.trim().length < 20) {
        throw new Error(`Model ${model} returned an empty or invalid response.`);
      }

      console.log(`✅ Success from model: ${model}`);
      return resultText;

    } catch (err: any) {
      console.warn(`❌ Model ${model} failed: ${err.message}`);
      lastError = err;
      // Continue to the next model in the list
    }
  }

  throw lastError ?? new Error('All AI models failed to generate a response.');
}

// --- 3. MAIN EXPORTED FUNCTION (Used by your React component) ---

/**
 * Generates structured study notes by calling the AI with a JSON-focused prompt.
 */
export async function generateNotesAI(text: string, filename: string, userId?: string): Promise<AINote> {
  
  const jsonSchema = `{
    "content": { ... },
    "flashcards": [ ... ],
    "quiz": [ ... ]
  }`; // A summary for brevity in the prompt

  const prompt = `You are an expert AI study assistant. Your task is to analyze the following source text and generate a structured JSON object containing comprehensive study materials.
Follow the provided JSON schema precisely. Your output MUST be a single, complete, valid JSON object and nothing else.

**JSON Schema to Follow:**
\`\`\`json
{
  "content": {
    "title": "<A concise, descriptive title for the notes>",
    "summary": "<A 3-5 sentence executive summary of the source material>",
    "keyTakeaways": ["<5-10 key takeaways>"],
    "fullNotes": [{ "heading": "<Section Heading>", "content": "<Detailed notes in Markdown>" }]
  },
  "flashcards": [{ "question": "<Flashcard question>", "answer": "<Concise answer>" }],
  "quiz": [{ "question": "<Quiz question>", "options": ["<A>", "<B>", "<C>", "<D>"], "correct": 0, "explanation": "<Why it's correct>" }]
}
\`\`\`

**Instructions:**
1.  **Content**: Create a title, summary, key takeaways, and detailed notes.
2.  **Flashcards**: Generate 5-10 high-quality flashcards.
3.  **Quiz**: Create 3-5 exam-style multiple-choice questions.
4.  **CRITICAL**: Prioritize completing the full JSON structure over providing exhaustive detail in any single section.

Now, process the following source text:
---
${text}
---
`;

  try {
    const aiResponseString = await callAIWithFallback(prompt, userId);

    // Robustly find and parse the JSON from the AI's response string
    const jsonMatch = aiResponseString.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain a recognizable JSON object.');
    }
    
    const extractedJson = jsonMatch[1] || jsonMatch[2];
    const parsed = JSON.parse(extractedJson);

    // Validate and sanitize the parsed data to prevent UI crashes
    const finalNote: AINote = {
      id: Date.now().toString(),
      filename: filename,
      timestamp: new Date().toISOString(),
      content: parsed.content || { title: `Notes for ${filename}`, summary: "", keyTakeaways: [], fullNotes: [] },
      flashcards: (Array.isArray(parsed.flashcards) ? parsed.flashcards : []).map((fc: any, i: number) => ({ ...fc, id: `${Date.now()}-${i}` })),
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
    };
    
    return finalNote;

  } catch (error) {
    console.error('Fatal error in generateNotesAI:', error);
    throw new Error(`Failed to generate AI notes. ${(error as Error).message}`);
  }
}
