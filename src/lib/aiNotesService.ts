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
