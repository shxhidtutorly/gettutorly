// src/lib/aiNotesService.ts
export interface AINote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  filename: string;
  flashcards?: Flashcard[];
  quiz?: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

/**
 * Small helper to perform fetch with timeout.
 */
async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 60_000) {
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
 * No HuggingFace here — only direct providers as requested.
 */
async function callAIProviders(prompt: string, userId?: string, timeoutMs = 60000): Promise<string> {
  const providers = [
    { model: 'nvidia' },
    { model: 'mistral' },
    { model: 'cerebras' },
    { model: 'together' },
    { model: 'openrouter' },
    { model: 'groq' },
    { model: 'claude' },
    { model: 'gemini' }
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
        // try parse error message for debugging
        let errText = '';
        try {
          const errJson = await resp.json();
          errText = JSON.stringify(errJson).slice(0, 1000);
        } catch {
          errText = await resp.text().catch(() => `HTTP ${resp.status}`);
        }
        const e = new Error(`${provider.model} returned HTTP ${resp.status}: ${errText}`);
        console.warn('❌', e.message);
        lastError = e;
        continue; // next provider
      }

      // Parse body
      const data = await resp.json().catch(() => null);
      // Accept multiple response shapes
      const possible = (data && (
        data.result ||
        data.response ||
        data.summary ||
        data.output ||
        data.text ||
        (typeof data === 'string' ? data : undefined)
      )) ?? null;

      if (!possible) {
        // If provider response is present but doesn't contain main text, attempt to stringify useful parts
        const fallback = data ? JSON.stringify(data).slice(0, 2000) : null;
        const e = new Error(`${provider.model} returned no usable payload. Raw: ${fallback}`);
        console.warn('⚠️', e.message);
        lastError = e;
        continue;
      }

      // Got something usable
      const resultText = typeof possible === 'string' ? possible : String(possible);
      // minimal sanity: require > 20 chars
      if (resultText.trim().length < 20) {
        const e = new Error(`${provider.model} returned too-short response`);
        console.warn('⚠️', e.message);
        lastError = e;
        continue;
      }

      console.log(`✅ Success from ${provider.model}`);
      return resultText;
    } catch (err: any) {
      // network / timeout / abort / parse error
      const msg = (err && err.message) ? err.message : String(err);
      console.warn(`❌ Provider ${provider.model} failed: ${msg}`);
      lastError = err instanceof Error ? err : new Error(msg);
      // continue to next provider
    }
  }

  throw lastError ?? new Error('All providers failed');
}

/**
 * Generate highly-structured markdown notes using your original long prompt.
 */
export async function generateNotesAI(text: string, filename: string, userId?: string): Promise<AINote> {
  // Keep the prompt exactly as you provided (unchanged).
  const prompt = `You are a top-tier AI study assistant. Your job is to convert the provided source material into **complete, exam-ready, highly-structured study notes**. The consumer of these notes is a serious student preparing for exams and deep revision. Use up to **MaxTokens: 40000** to produce exhaustive, high-quality output.

MANDATES (read carefully):
1. **Output only valid Markdown** (no surrounding commentary). Use heading levels with #, ##, ###, etc.
2. **Do not omit important content.** If the source omits something, explicitly note "Not present in source."
3. **Preserve original structure** when present (e.g., Unit, Chapter, Section titles) and map each source heading to a corresponding Markdown heading.
4. **Cite exact location** of important facts where possible using the source marker provided (e.g., "p. 12", "Paragraph 3", or "Slide 2"). If no markers available, state "location: source text".
5. Use LaTeX ($$ ... $$) for mathematical formulas and code fences for any code snippets.

REQUIRED FINAL SECTIONS & ORDER (use these exact headings and fill them thoroughly):
# Title & Metadata
- Title (derived from source)
- Source summary (one-line)
- Date / original filename (if available)
- Estimated reading time (short, e.g., "≈ 18 minutes")
- Difficulty level (Beginner / Intermediate / Advanced)

# Table of Contents
- Auto-generated linked TOC covering all major headings and subheadings.

# Executive Summary
- 3–6 concise sentences capturing the main purpose and scope of the content.

# Key Takeaways
- 8–15 short bullet points listing the most important facts someone must remember.

# Definitions & Key Terms (Alphabetical)
- Each term: **Term** — concise definition (1–2 lines).
- If a term appears multiple times, add short cross-reference (e.g., "see §2.3").

# Full Notes (Organized, Comprehensive)
- Mirror the source structure: Unit / Chapter / Section headings.
- For each subsection include:
  - A 1–2 sentence *summary*
  - Detailed bullet points with facts, mechanisms, formulas, lists, and explanations
  - Clear examples (labelled Example 1, Example 2) including step-by-step solutions where relevant
  - Any lists, processes, or numbered steps must be preserved exactly and presented as ordered lists
  - Tables for comparative data (Markdown tables)
  - Short, captioned ASCII diagrams or **Mermaid** diagrams (if helpful) labelled and explained
  - LaTeX-rendered formulas for any equations
- Use nested bullets and numbered lists to improve scan-ability.
- Where applicable, mark "Important" or "Exam Tip" inline.

# Visuals & Diagrams
- Provide at least one clear ASCII or Mermaid diagram for complex processes or system architectures.
- Label components and provide a one-line explanation for each label.

# Examples & Worked Problems
- 3–8 worked problems (where relevant), each with:
  - Problem statement
  - Step-by-step solution
  - Final answer and short explanation of reasoning

# Formulas & Cheat Sheet
- Compact list/table of all formulas, variables defined, units, and quick usage notes.

# Common Mistakes & Misconceptions
- 6–12 concise bullet points of typical student errors, with corrections and quick checks.

# Mnemonics & Memory Aids
- 6–12 practical mnemonics or short memory tips to recall lists/processes.

# Practice Questions (Exam-style)
- Provide **10** questions with varied difficulty (label Easy / Medium / Hard).
- After the question list, provide **detailed answers and explanations** for each.

# Flashcards (Q/A)
- Provide **20** short flashcards in a simple Q / A Markdown list (e.g., **Q:** ... **A:** ...).

# Study Schedule & Strategy
- Two compact study plans:
  - 2-day rapid revision plan (hour-by-hour)
  - 7-day spaced study plan (daily goals)
- Suggested active learning methods for this topic (e.g., spaced repetition, Feynman technique).

# Further Reading & References
- Short curated list of 6–10 recommended readings (books, papers, docs). If the source references specific pages or sections, include those page numbers.

# Quick Revision Sheet (One-page)
- A one-page "cheat-sheet" section with the smallest possible summary: 12–18 bullets that cover essentials.

PRESENTATION RULES:
- Use **consistent heading hierarchy** and clean Markdown.
- Bold important terms and italicize key notes or warnings.
- When presenting long lists, include a concise numeric summary line (e.g., "5 key points: ...").
- Use code blocks for commands or literal blocks from the source.
- If content is extremely long, automatically split into **Part 1 / Part 2 / ...** with clear continuation markers and repeat a short recap at the start of each part so parts are independently useful.
- If uncertain about any interpretation, clearly label as **[INFERRED]** and give the reasoning in one line.

FAIL SAFE:
- If the source lacks facts required for a section, write: "**Not present in source:** [what is missing]".
- Do not hallucinate references, page numbers, or direct quotes — only use information present in the supplied content.

Output begins below this line. Convert the provided content into notes now :

${text}
`;

  try {
    const aiResponse = await callAIProviders(prompt, userId, 60_000);
    // use aiResponse directly as markdown content
    const note: AINote = {
      id: Date.now().toString(),
      title: `Notes from ${filename}`,
      content: aiResponse,
      timestamp: new Date().toISOString(),
      filename
    };
    return note;
  } catch (error) {
    console.error('Error generating notes:', error);
    throw new Error('Failed to generate AI notes. Please try again.');
  }
}

/**
 * Create flashcards from notes via AI; fallback to parsing locally if all providers fail.
 */
export async function generateFlashcardsAI(notesText: string, userId?: string): Promise<Flashcard[]> {
  const prompt = `Create 10-15 study flashcards from these notes. 
Each flashcard should have a clear question and a concise answer.
Format as JSON array with objects containing "question" and "answer" fields:

${notesText}`;

  try {
    let aiText: string;
    try {
      aiText = await callAIProviders(prompt, userId, 45_000);
    } catch (err) {
      console.warn('AI flashcards generation failed, falling back to local parser:', err);
      return parseFlashcardsFromText(notesText);
    }

    // Try to extract JSON array from AI response
    let parsedJson: any = null;
    const jsonArrayMatch = aiText.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        parsedJson = JSON.parse(jsonArrayMatch[0]);
      } catch (e) {
        // ignore parse error and fall through to text parsing
        parsedJson = null;
      }
    }

    let flashcardsRaw: Array<{ question?: string; answer?: string }> = [];

    if (Array.isArray(parsedJson)) {
      flashcardsRaw = parsedJson;
    } else {
      // Attempt to parse if AI returned "Q: ... A: ..." text
      try {
        flashcardsRaw = parseFlashcardsFromText(aiText).map(f => ({ question: f.question, answer: f.answer }));
        if (flashcardsRaw.length === 0) {
          // fallback: parse from original notes if AI didn't give Q/A
          flashcardsRaw = parseFlashcardsFromText(notesText).map(f => ({ question: f.question, answer: f.answer }));
        }
      } catch {
        flashcardsRaw = parseFlashcardsFromText(notesText).map(f => ({ question: f.question, answer: f.answer }));
      }
    }

    // Normalize and assign IDs
    const flashcards: Flashcard[] = flashcardsRaw
      .map((c, idx) => ({
        id: (Date.now() + idx).toString(),
        question: (c.question || '').toString().trim(),
        answer: (c.answer || '').toString().trim()
      }))
      .filter(fc => fc.question.length > 3 && fc.answer.length > 0)
      .slice(0, 15);

    // If still empty, try fallback parser once more on notesText
    if (flashcards.length === 0) {
      return parseFlashcardsFromText(notesText);
    }

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

/**
 * Best-effort parser for generating flashcards from plain text when AI is unavailable.
 */
function parseFlashcardsFromText(text: string): Flashcard[] {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const flashcards: Flashcard[] = [];

  // 1) Extract explicit Q/A blocks (Q: / A:)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(Q:|Question:)/i.test(line) || /^[Ww]hat|[Hh]ow|[Ww]hy|[Ww]hen|[Ww]here|[Ww]hich/.test(line)) {
      // question
      const q = line.replace(/^(Q:|Question:)\s*/i, '').trim();
      // find next answer-like line
      let answer = '';
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
        const next = lines[j];
        if (/^(A:|Answer:)/i.test(next)) {
          answer = next.replace(/^(A:|Answer:)\s*/i, '').trim();
          break;
        } else if (!/^(Q:|Question:)/i.test(next) && next.length > 5) {
          answer = next;
          break;
        }
      }
      if (q && answer) {
        flashcards.push({ id: (Date.now() + flashcards.length).toString(), question: q, answer });
      }
    }
    if (flashcards.length >= 15) break;
  }

  // 2) If none found, create Q/A from paired sentences (heuristic)
  if (flashcards.length === 0) {
    const sentences = text.split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length > 8);
    for (let i = 0; i < sentences.length - 1 && flashcards.length < 15; i += 2) {
      const q = sentences[i].replace(/\s+/g, ' ').trim();
      const a = sentences[i + 1].replace(/\s+/g, ' ').trim();
      flashcards.push({ id: (Date.now() + flashcards.length).toString(), question: q + '?', answer: a });
    }
  }

  // 3) Final fallback: bullet point to Q/A
  if (flashcards.length === 0) {
    const bullets = text.split(/[-•\u2022]/).map(s => s.trim()).filter(Boolean);
    for (let i = 0; i < bullets.length && flashcards.length < 15; i += 2) {
      const q = bullets[i];
      const a = bullets[i + 1] || '';
      if (q && a) {
        flashcards.push({ id: (Date.now() + flashcards.length).toString(), question: q, answer: a });
      }
    }
  }

  return flashcards.slice(0, 15);
}
