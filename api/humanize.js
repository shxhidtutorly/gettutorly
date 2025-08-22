// api/humanize.js - Tutorly AI Humanizer endpoint
// This endpoint transforms AI-generated content into natural, human-like writing

export default async function handler(req, res) {
  console.log(`🧠 Tutorly AI Humanizer called: ${req.method} ${req.url}`);

  // CORS + JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const safeParseBody = (b) => {
    try { return typeof b === 'string' ? JSON.parse(b) : b; } catch (e) { return b; }
  };

  const estimateTokens = (text) => {
    // conservative heuristic: 1 token ≈ 4 chars
    if (!text) return 0;
    return Math.ceil(String(text).length / 4);
  };

  const getEnv = (name) => process.env[name] || '';

  try {
    const body = safeParseBody(req.body);
    const { text, language, tone } = body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }

    // Validate language and tone
    const validLanguages = ['English', 'Spanish', 'French', 'German'];
    const validTones = ['Neutral', 'Formal', 'Casual', 'Persuasive', 'Informative'];

    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language selection' });
    }

    if (!validTones.includes(tone)) {
      return res.status(400).json({ error: 'Invalid tone selection' });
    }

    // Estimate token count for input text
    const estimatedInputTokens = estimateTokens(text);
    console.log(`Estimated input tokens: ${estimatedInputTokens}`);

    // Prepare the system prompt
    const systemPrompt = `Rewrite the given text to follow these rules:
- Use clear, simple language.
- Be spartan and informative.
- Use short, impactful sentences.
- Use active voice. Avoid passive voice.
- Give practical and actionable insights.
- Use bullet point lists for social media posts.
- Use data and examples when possible.
- Address the reader with "you" and "your".

Do not:
- Use em dashes. Only use commas, periods, or standard punctuation.
- Use semicolons.
- Use markdown, asterisks, or hashtags.
- Use setup phrases like "in conclusion" or "in closing".
- Use metaphors, clichés, or generalizations.
- Use unnecessary adjectives or adverbs.
- Include warnings, notes, or explanations outside of the rewritten text.
- Use banned words: very, really, just, actually, basically, literally.

After rewriting, return:
1. The cleaned and human-like version of the text.
2. A score from 1 to 100 measuring how close the rewritten text is to these rules.
3. A short one-line explanation of the score.

Output format must be a valid JSON with these fields: rewrittenText, score, explanation.`;

    // Add language and tone instructions to the prompt
    let userPrompt = `Please rewrite the following text in ${language} with a ${tone.toLowerCase()} tone:\n\n${text}`;

    // Try different AI providers in order of preference
    const providers = [
      callOpenRouter,
      callGroq,
      callTogetherAI,
      callOpenAI,
      callAnthropic,
      // Add more providers as needed
    ];

    let result = null;
    let error = null;

    // Try each provider until one succeeds
    for (const provider of providers) {
      try {
        result = await provider(systemPrompt, userPrompt);
        if (result) break;
      } catch (err) {
        console.error(`Provider error: ${err.message}`);
        error = err;
      }
    }

    if (!result) {
      console.error('All providers failed');
      return res.status(500).json({ 
        error: 'Failed to process text with available AI providers', 
        details: error?.message || 'Unknown error' 
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Humanizer error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Provider implementations
async function callOpenRouter(systemPrompt, userPrompt) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.log('OpenRouter API key not found, skipping');
    return null;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://gettutorly.com',
      'X-Title': 'Tutorly AI Humanizer'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from OpenRouter');
  }

  try {
    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    return {
      rewrittenText: parsedContent.rewrittenText,
      score: parseInt(parsedContent.score, 10),
      explanation: parsedContent.explanation
    };
  } catch (e) {
    console.error('Failed to parse OpenRouter response:', e);
    throw new Error('Invalid response format from AI provider');
  }
}

async function callGroq(systemPrompt, userPrompt) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.log('Groq API key not found, skipping');
    return null;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from Groq');
  }

  try {
    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    return {
      rewrittenText: parsedContent.rewrittenText,
      score: parseInt(parsedContent.score, 10),
      explanation: parsedContent.explanation
    };
  } catch (e) {
    console.error('Failed to parse Groq response:', e);
    throw new Error('Invalid response format from AI provider');
  }
}

async function callTogetherAI(systemPrompt, userPrompt) {
  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
  if (!TOGETHER_API_KEY) {
    console.log('Together AI key not found, skipping');
    return null;
  }

  const response = await fetch('https://api.together.xyz/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOGETHER_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.TOGETHER_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      prompt: `<s>[INST] ${systemPrompt} [/INST]\n\n[INST] ${userPrompt} [/INST]`,
      temperature: 0.3,
      max_tokens: 2000,
      stop: ['</s>']
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Together AI error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.text;
  
  if (!content) {
    throw new Error('Empty response from Together AI');
  }

  try {
    // Extract JSON from the response (it might be embedded in text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsedContent = JSON.parse(jsonMatch[0]);
    return {
      rewrittenText: parsedContent.rewrittenText,
      score: parseInt(parsedContent.score, 10),
      explanation: parsedContent.explanation
    };
  } catch (e) {
    console.error('Failed to parse Together AI response:', e);
    throw new Error('Invalid response format from AI provider');
  }
}

async function callOpenAI(systemPrompt, userPrompt) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API key not found, skipping');
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  try {
    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    return {
      rewrittenText: parsedContent.rewrittenText,
      score: parseInt(parsedContent.score, 10),
      explanation: parsedContent.explanation
    };
  } catch (e) {
    console.error('Failed to parse OpenAI response:', e);
    throw new Error('Invalid response format from AI provider');
  }
}

async function callAnthropic(systemPrompt, userPrompt) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    console.log('Anthropic API key not found, skipping');
    return null;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;
  
  if (!content) {
    throw new Error('Empty response from Anthropic');
  }

  try {
    // Extract JSON from the response (it might be embedded in text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsedContent = JSON.parse(jsonMatch[0]);
    return {
      rewrittenText: parsedContent.rewrittenText,
      score: parseInt(parsedContent.score, 10),
      explanation: parsedContent.explanation
    };
  } catch (e) {
    console.error('Failed to parse Anthropic response:', e);
    throw new Error('Invalid response format from AI provider');
  }
}
