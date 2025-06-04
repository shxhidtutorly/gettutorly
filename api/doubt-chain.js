
export default async function handler(req, res) {
  console.log('=== DOUBT CHAIN API START ===');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, depth = 0 } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    console.log('Processing question:', question);
    console.log('Current depth:', depth);

    // Different prompts based on depth
    let systemPrompt, userPrompt;
    
    if (depth >= 5) {
      // At maximum depth, provide fundamental explanation
      systemPrompt = 'You are a patient tutor explaining the most basic concepts to beginners.';
      userPrompt = `This is a fundamental concept question: "${question}". Provide a simple, clear explanation that assumes no prior knowledge. Keep it concise but complete.`;
    } else {
      // Break down into prerequisite
      systemPrompt = 'You are an expert tutor helping students understand difficult concepts through recursive breakdowns.';
      userPrompt = `Break this question into its most essential prerequisite question that a student must understand first: "${question}". Return ONLY the prerequisite question, nothing else.`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: depth >= 5 ? 400 : 100
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (!result) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    console.log('AI Response:', result);
    console.log('=== DOUBT CHAIN API SUCCESS ===');

    return res.status(200).json({
      result,
      isExplanation: depth >= 5,
      depth
    });

  } catch (error) {
    console.error('Doubt chain error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
