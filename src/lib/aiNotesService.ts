// src/lib/aiNotesService.ts

// --- 1. UPDATED INTERFACES FOR STRUCTURED JSON OUTPUT ---

/**
 * Represents the structured content of the AI-generated notes.
 * This is designed to be easily rendered in a UI.
 */
export interface AINoteContent {
  title: string;
  summary: string; // The executive summary
  keyTakeaways: string[]; // List of key points
  fullNotes: Array<{
    heading: string;
    content: string; // Detailed notes for this section in Markdown format
  }>;
  commonMistakes?: string[]; // Optional: List of common mistakes
  formulas?: Array<{
    formula: string; // e.g., "E = mc^2" (can contain LaTeX)
    description: string;
  }>;
}

/**
 * Represents a single flashcard with a question and an answer.
 */
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

/**
 * Represents a single quiz question with multiple choice options.
 */
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // 0-based index of the correct option
  explanation: string; // Explanation for the correct answer
}

/**
 * The main interface for a complete AI-generated note object.
 * The 'content' is now a structured object instead of a string.
 */
export interface AINote {
  id: string;
  filename: string;
  timestamp: string;
  content: AINoteContent;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}


// --- 2. CORE AI PROVIDER LOGIC (Largely Unchanged, but still robust) ---

/**
 * Small helper to perform fetch with a timeout.
 */
async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 90_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Attempts the configured providers in order until one returns a usable result.
 */
async function callAIProviders(prompt: string, userId?: string, timeoutMs = 90000): Promise<string> {
  // Gemini and Claude are generally better at following structured JSON instructions.
  // We prioritize them here.
  const providers = [
    { model: 'gemini' },
    { model: 'groq' },
    { model: 'openrouter' },
    { model: 'mistral' },
    { model: 'nvidia' },
    { model: 'together' },
    { model: 'cerebras' },
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    const body = {
      prompt,
      model: provider.model,
      userId
    };

    try {
      console.log(`🛰️ Trying provider: ${provider.model}`);
      const resp = await fetchWithTimeout('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, timeoutMs);

      if (!resp.ok) {
        let errText = `HTTP ${resp.status}`;
        try {
          const errJson = await resp.json();
          errText = JSON.stringify(errJson).slice(0, 500);
        } catch {
          // fallback to text if json parsing fails
          errText = await resp.text().catch(() => errText);
        }
        throw new Error(`${provider.model} returned an error: ${errText}`);
      }

      const data = await resp.json().catch(() => null);
      
      // Accept multiple common response shapes
      const resultText = (data && (
        data.result ||
        data.response ||
        data.summary ||
        data.output ||
        data.text ||
        (typeof data === 'string' ? data : null)
      )) ?? (data ? JSON.stringify(data) : null);


      if (!resultText || resultText.trim().length < 20) {
        throw new Error(`${provider.model} returned an empty or too-short response.`);
      }

      console.log(`✅ Success from ${provider.model}`);
      return resultText;

    } catch (err: any) {
      const msg = (err && err.message) ? err.message : String(err);
      console.warn(`❌ Provider ${provider.model} failed: ${msg}`);
      lastError = err instanceof Error ? err : new Error(msg);
      // continue to next provider
    }
  }

  throw lastError ?? new Error('All AI providers failed to generate a response.');
}


// --- 3. REVISED AI NOTE GENERATION SERVICE ---

/**
 * Generates structured study notes, flashcards, and quizzes in a single AI call,
 * requesting a JSON object for direct use in the UI.
 *
 * @param text The source text provided by the user.
 * @param filename The name of the source file.
 * @param userId An optional user ID for tracking.
 * @returns A promise that resolves to a structured AINote object.
 */
// src/lib/aiNotesService.ts
// ... (keep all the other code in the file, like interfaces and callAIProviders)

/**
 * Generates structured study notes, flashcards, and quizzes in a single AI call,
 * requesting a JSON object for direct use in the UI.
 *
 * @param text The source text provided by the user.
 * @param filename The name of the source file.
 * @param userId An optional user ID for tracking.
 * @returns A promise that resolves to a structured AINote object.
 */
export async function generateNotesAI(text: string, filename: string, userId?: string): Promise<AINote> {
  
  const jsonSchema = `{
    "content": {
      "title": "<A concise, descriptive title for the notes>",
      "summary": "<A 3-5 sentence executive summary of the source material>",
      "keyTakeaways": [
        "<Key takeaway 1>",
        "<Key takeaway 2>",
        "..."
      ],
      "fullNotes": [
        {
          "heading": "<Main Section Heading 1>",
          "content": "<Detailed notes for this section in Markdown format. Use bullet points, bold text, and lists.>"
        }
      ]
    },
    "flashcards": [
      {
        "question": "<Flashcard question 1>",
        "answer": "<A concise answer>"
      }
    ],
    "quiz": [
      {
        "question": "<Multiple choice question 1>",
        "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
        "correct": 0,
        "explanation": "<A brief explanation of why the answer is correct>"
      }
    ]
  }`;

  // The new, shorter, and more effective prompt.
  const prompt = `You are an expert AI study assistant. Your task is to analyze the following source text and generate a structured JSON object containing comprehensive study materials.

Follow the provided JSON schema precisely. Do NOT add any commentary, explanations, or text outside of the single JSON object.

**JSON Schema to Follow:**
\`\`\`json
${jsonSchema}
\`\`\`

**Instructions:**
1.  **title**: Create a clear and relevant title.
2.  **summary**: Write a concise summary (3-5 sentences).
3.  **keyTakeaways**: Extract 5-10 of the most important points.
4.  **fullNotes**: Break down the source text into logical sections. The 'content' for each section should be well-structured Markdown.
5.  **flashcards**: Generate 5-10 high-quality flashcards.
6.  **quiz**: Create 3-5 exam-style multiple-choice questions.
7.  **CRITICAL**: Your output MUST be a single, complete, and valid JSON object. Prioritize completing the full JSON structure over providing exhaustive detail in any single section.

Now, process the following source text and produce the JSON object:

--- SOURCE TEXT ---
${text}
--- END SOURCE TEXT ---
`;

  try {
    const aiResponseString = await callAIProviders(prompt, userId, 90_000);

    // --- Robust JSON Parsing ---
    const jsonMatch = aiResponseString.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (!jsonMatch) {
      console.error("AI response did not contain a JSON object.", aiResponseString);
      throw new Error('AI response did not contain a valid JSON object.');
    }
    
    const extractedJson = jsonMatch[1] || jsonMatch[2];

    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(extractedJson);
    } catch (parseError) {
      console.error('Failed to parse JSON from AI response:', extractedJson);
      throw new Error('AI returned malformed JSON. Please try again.');
    }

    // --- NEW: Graceful Validation and Sanitization ---
    // This part prevents the app from crashing if the AI response is incomplete.
    
    const validatedContent = parsedResponse.content && typeof parsedResponse.content === 'object' 
      ? {
          title: parsedResponse.content.title || `Notes for ${filename}`,
          summary: parsedResponse.content.summary || "No summary provided.",
          keyTakeaways: Array.isArray(parsedResponse.content.keyTakeaways) ? parsedResponse.content.keyTakeaways : [],
          fullNotes: Array.isArray(parsedResponse.content.fullNotes) ? parsedResponse.content.fullNotes : [],
        }
      : {
          title: `Notes for ${filename}`,
          summary: "Failed to generate structured notes. Displaying raw output.",
          keyTakeaways: [],
          fullNotes: [{ heading: "Raw AI Output", content: extractedJson }]
        };

    const validatedFlashcards: Flashcard[] = (Array.isArray(parsedResponse.flashcards) ? parsedResponse.flashcards : []).map((fc: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        question: fc.question || "Missing Question",
        answer: fc.answer || "Missing Answer"
    }));
    
    const validatedQuiz: QuizQuestion[] = Array.isArray(parsedResponse.quiz) ? parsedResponse.quiz : [];

    const finalNote: AINote = {
      id: Date.now().toString(),
      filename: filename,
      timestamp: new Date().toISOString(),
      content: validatedContent,
      flashcards: validatedFlashcards,
      quiz: validatedQuiz,
    };
    
    return finalNote;

  } catch (error) {
    console.error('Fatal error in generateNotesAI:', error);
    throw new Error(`Failed to generate AI notes. ${(error as Error).message}`);
  }
}
