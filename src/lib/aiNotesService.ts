
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

export async function generateNotesAI(text: string, filename: string, userId?: string): Promise<AINote> {
  // Structured prompt for detailed Markdown notes
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

  async function callAI(prompt: string) {
  const providers = [
    { model: "groq" },
    { model: "openrouter" },
    { model: "claude" },
    { model: "together" },
    { model: "huggingface" },
    { model: "gemini" },
  ];

  let lastError: any;

  for (const provider of providers) {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: provider.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`Provider ${provider.model} failed: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.result) {
        console.log(`✅ Success with ${provider.model}`);
        return data.result;
      }
    } catch (error) {
      console.warn(`❌ ${provider.model} failed, trying next...`, error);
      lastError = error;
    }
  }

  throw new Error(`All providers failed. Last error: ${lastError?.message}`);
}

    if (!response.ok) {
      throw new Error('Failed to generate notes');
    }

    const data = await response.json();
    // DO NOT CLEAN MARKDOWN! Render as Markdown in your UI for structure

    const note: AINote = {
      id: Date.now().toString(),
      title: `Notes from ${filename}`,
      content: data.response || data.summary || 'Notes generated successfully',
      timestamp: new Date().toISOString(),
      filename
    };

    return note;
  } catch (error) {
    console.error('Error generating notes:', error);
    throw new Error('Failed to generate AI notes. Please try again.');
  }
}
export async function generateFlashcardsAI(notesText: string): Promise<Flashcard[]> {
  const prompt = `Create 10-15 study flashcards from these notes. 
  Each flashcard should have a clear question and a concise answer.
  Format as JSON array with objects containing "question" and "answer" fields:

  ${notesText}`;

  try {
    let response;
    try {
      response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'gemini' })
      });
    } catch (error) {
      // Create flashcards from the notes text directly
      return parseFlashcardsFromText(notesText);
    }

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    
    // Try to parse JSON from the response
    let flashcards;
    try {
      const jsonMatch = data.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse line by line
        flashcards = parseFlashcardsFromText(data.response);
      }
    } catch {
      flashcards = parseFlashcardsFromText(data.response);
    }

    return flashcards.map((card: any, index: number) => ({
      id: (Date.now() + index).toString(),
      question: card.question || card.q || '',
      answer: card.answer || card.a || ''
    })).filter((card: Flashcard) => card.question && card.answer);

  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

function parseFlashcardsFromText(text: string): Flashcard[] {
  const lines = text.split('\n').filter(line => line.trim());
  const flashcards: Flashcard[] = [];
  
  // Try to extract Q&A patterns from the text
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for question patterns
    if (line.match(/^(Q:|Question:|What|How|Why|When|Where|Which)/i)) {
      const question = line.replace(/^(Q:|Question:)\s*/i, '').trim();
      
      // Look for the answer in the next few lines
      let answer = '';
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.match(/^(A:|Answer:)/i)) {
          answer = nextLine.replace(/^(A:|Answer:)\s*/i, '').trim();
          break;
        } else if (nextLine && !nextLine.match(/^(Q:|Question:|What|How|Why|When|Where|Which)/i)) {
          answer = nextLine;
          break;
        }
      }
      
      if (question && answer) {
        flashcards.push({
          id: (Date.now() + flashcards.length).toString(),
          question,
          answer
        });
      }
    }
  }
  
  // If no Q&A patterns found, create flashcards from bullet points or sentences
  if (flashcards.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    for (let i = 0; i < Math.min(sentences.length - 1, 10); i += 2) {
      if (sentences[i] && sentences[i + 1]) {
        flashcards.push({
          id: (Date.now() + i).toString(),
          question: sentences[i].trim() + '?',
          answer: sentences[i + 1].trim()
        });
      }
    }
  }
  
  return flashcards.slice(0, 15); // Limit to 15 flashcards
}
