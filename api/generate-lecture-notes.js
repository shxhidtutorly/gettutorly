
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, isFinal = false } = req.body;

    if (!transcript || transcript.trim().length < 50) {
      return res.json({ notes: '' });
    }

    const prompt = `Generate concise, structured lecture notes from this transcript:

${transcript}

Instructions:
- Use clear headings and subheadings
- Create bullet points for key concepts
- Highlight important definitions and formulas
- Make it easy to study and review
- Use markdown formatting
${isFinal ? '- This is the final transcript, provide comprehensive notes' : '- This is a partial transcript, focus on the main points covered so far'}

Format as structured markdown notes:`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate notes');
    }

    const data = await response.json();
    const notes = data.choices?.[0]?.message?.content || 'Unable to generate notes at this time.';

    return res.json({ notes });

  } catch (error) {
    console.error('Notes generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate notes',
      notes: '**Note Generation Error**\n\nUnable to process transcript at this time.',
    });
  }
}
