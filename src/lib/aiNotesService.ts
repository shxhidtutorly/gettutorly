
import { supabase } from "@/integrations/supabase/client";

export interface AINote {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  filename: string;
  timestamp: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export const generateNotesAI = async (text: string, filename: string): Promise<AINote> => {
  try {
    console.log('Generating AI notes for:', filename);
    
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Please create comprehensive study notes from the following text. Format the response as detailed, well-structured notes with clear headings, bullet points, and key concepts highlighted:\n\n${text}`,
        model: 'gemini'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate notes');
    }

    const data = await response.json();
    
    const aiNote: AINote = {
      id: Date.now().toString(),
      title: `AI Notes: ${filename}`,
      content: data.response || data.result,
      filename: filename,
      timestamp: new Date().toISOString(),
    };

    console.log('AI notes generated successfully');
    return aiNote;
  } catch (error) {
    console.error('Error generating AI notes:', error);
    throw new Error('Failed to generate AI notes. Please try again.');
  }
};

export const generateFlashcardsAI = async (content: string): Promise<Flashcard[]> => {
  try {
    console.log('Generating flashcards from content...');
    
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Create 10-15 flashcards from the following study notes. Format each flashcard as "Q: [question] | A: [answer]" on separate lines:\n\n${content}`,
        model: 'gemini'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate flashcards');
    }

    const data = await response.json();
    const flashcardsText = data.response || data.result;
    
    // Parse the response into flashcard objects
    const flashcards: Flashcard[] = [];
    const lines = flashcardsText.split('\n');
    
    lines.forEach((line: string, index: number) => {
      if (line.includes('Q:') && line.includes('A:')) {
        const parts = line.split(' | ');
        if (parts.length >= 2) {
          const question = parts[0].replace('Q:', '').trim();
          const answer = parts[1].replace('A:', '').trim();
          
          if (question && answer) {
            flashcards.push({
              id: `flashcard-${index}`,
              front: question,
              back: answer,
            });
          }
        }
      }
    });
    
    console.log(`Generated ${flashcards.length} flashcards`);
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
};
