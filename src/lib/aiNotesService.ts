
export interface AINote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  filename: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export async function generateNotesAI(text: string, filename: string): Promise<AINote> {
  const prompt = `Transform the following content into well-structured, comprehensive study notes. 
  Format them with clear headings, bullet points, and key concepts highlighted. 
  Make them easy to study from:

  ${text}`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gemini' })
    });

    if (!response.ok) {
      throw new Error('Failed to generate notes');
    }

    const data = await response.json();
    
    return {
      id: Date.now().toString(),
      title: `Notes from ${filename}`,
      content: data.response,
      timestamp: new Date().toISOString(),
      filename
    };
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
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gemini' })
    });

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
  
  for (let i = 0; i < lines.length - 1; i += 2) {
    const question = lines[i]?.replace(/^\d+\.?\s*/, '').replace(/^Q:?\s*/i, '').trim();
    const answer = lines[i + 1]?.replace(/^A:?\s*/i, '').trim();
    
    if (question && answer) {
      flashcards.push({ id: '', question, answer });
    }
  }
  
  return flashcards;
}
