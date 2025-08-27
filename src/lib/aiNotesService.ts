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


// --- 2. DIRECT API CALLING LOGIC (No /api/ai) ---

// Configuration for API keys from .env.local file
const apiConfig = {
  gemini: {
    apiKey: import.meta.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash-latest',
  },
  groq: {
    apiKey: import.meta.env.GROQ_API_KEY,
    model: 'openai/gpt-oss-20b',
  },
  mistral: {
    apiKey: import.meta.env.MISTRAL_API_KEY,
    model: 'open-mixtral-8x7b',
  },
  openrouter: {
    apiKey: import.meta.env.OPENROUTER_API_KEY,
    model: 'openai/gpt-oss-20b:free',
  },
};

/**
 * Tries a list of AI providers in order until one returns a valid response.
 * This version calls the provider APIs directly from the client.
 */
async function callAIWithFallback(prompt: string): Promise<string> {
  const providersToTry: (keyof typeof apiConfig)[] = ['gemini', 'groq', 'openrouter', 'mistral'];
  let lastError: Error | null = new Error("No API keys are configured. Please check your .env.local file.");

  for (const provider of providersToTry) {
    const config = apiConfig[provider];
    if (!config || !config.apiKey) {
      console.warn(`API key for ${provider} is missing. Skipping.`);
      continue;
    }

    try {
      console.log(`🛰️ Trying provider: ${provider}`);
      let responseText: string;

      if (provider === 'gemini') {
        responseText = await callGeminiAPI(prompt, config.apiKey, config.model);
      } else {
        // Groq, Mistral, and OpenRouter use an OpenAI-compatible API format
        responseText = await callOpenAICompatibleAPI(provider, prompt, config.apiKey, config.model);
      }

      if (!responseText || responseText.trim().length < 20) {
        throw new Error(`Provider ${provider} returned an empty or invalid response.`);
      }

      console.log(`✅ Success from provider: ${provider}`);
      return responseText;

    } catch (err: any) {
      console.error(`❌ Provider ${provider} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError;
}


// --- Provider-Specific Helper Functions ---

async function callGeminiAPI(prompt: string, apiKey: string, model: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.4,
    },
  };
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAICompatibleAPI(provider: 'groq' | 'mistral' | 'openrouter', prompt: string, apiKey: string, model: string): Promise<string> {
  const endpoints = {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    mistral: 'https://api.mistral.ai/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  };

  const url = endpoints[provider];
  const body = {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${provider} API error: ${data.error?.message || 'Unknown error'}`);
  }
  return data.choices?.[0]?.message?.content || "";
}


// --- 3. MAIN EXPORTED FUNCTION (Used by your React component) ---

/**
 * Generates structured study notes by calling AI providers directly.
 */
export async function generateNotesAI(text: string, filename: string): Promise<AINote> {
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
    const aiResponseString = await callAIWithFallback(prompt);

    const jsonMatch = aiResponseString.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain a recognizable JSON object.');
    }
    
    const extractedJson = jsonMatch[1] || jsonMatch[2];
    const parsed = JSON.parse(extractedJson);

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
