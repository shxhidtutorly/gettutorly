
export default async function handler(req, res) {
  console.log('=== FOLLOWUP API START ===');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, followup } = req.body;
    
    if (!question || !followup) {
      return res.status(400).json({ error: 'Question and followup are required' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    console.log('Processing followup for:', question);
    console.log('Followup type:', followup);

   const systemPrompt = "You're an AI tutor helping students understand concepts better.";
let userPrompt;

if (req.body.chain) {
  userPrompt = `The user asked: "${question}"

Here is a breakdown chain of prerequisite questions and explanations:
${req.body.chain}

Now, as an AI tutor, synthesize a detailed answer to the original question, making use of all the breakdowns and explanations above.`;
} else {
  userPrompt = `The user asked: "${question}"\nFollow-up request: "${followup}"\nProvide a helpful, specific response.`;
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
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    console.log('Followup Response:', result);
    console.log('=== FOLLOWUP API SUCCESS ===');

    return res.status(200).json({ result });

  } catch (error) {
    console.error('Followup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
