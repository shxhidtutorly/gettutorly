// A helper function to safely parse JSON from the AI's response
function extractAndParseJson(text) {
  // Find the start and end of the JSON code block
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error("Could not find a valid JSON code block in the AI response.");
  }
  try {
    // Parse the extracted JSON string
    return JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    throw new Error("Invalid JSON format in the AI response.");
  }
}

export default async function handler(req, res) {
  console.log('=== MATH SOLVER API V2 START ===');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { problem } = req.body;
    if (!problem || typeof problem !== 'string') {
      return res.status(400).json({ error: 'Problem is required and must be a string' });
    }

    console.log('✅ Valid request - Problem:', problem.substring(0, 50) + '...');

    // New prompt that requests a structured JSON output
    const mathPrompt = `Solve the following math problem. Provide a clear, step-by-step solution.

Problem: "${problem}"

Your response MUST be a JSON object inside a \`\`\`json code block. The JSON object should have a single key "steps", which is an array of objects. Each object in the array represents a single step in the solution and must have two keys:
1. "explanation": A string explaining the concept or the action taken in this step.
2. "formula": A string containing the mathematical equation or expression for this step, formatted in LaTeX. Use $$ for display math.

Example Response Format:
\`\`\`json
{
  "steps": [
    {
      "explanation": "First, we identify the coefficients a, b, and c from the quadratic equation.",
      "formula": "ax^2 + bx + c = 0"
    },
    {
      "explanation": "Next, we apply the quadratic formula to solve for x.",
      "formula": "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}"
    }
  ]
}
\`\`\`
`;

    const systemPrompt = `You are an expert mathematics tutor. Your task is to provide step-by-step solutions to math problems. You MUST ONLY respond with a JSON object in the specified format, enclosed in a \`\`\`json code block. Do not add any conversational text or explanations outside of the JSON structure.`;

    const apiRequestBody = {
      model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free', // Primary model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mathPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    };

    console.log('🤖 Calling TogetherAI...');
    let response;
    try {
      response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody)
      });
    } catch (error) {
      console.log('⚠️ Primary model failed, trying fallback...');
      apiRequestBody.model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo'; // Fallback model
       response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody)
      });
    }


    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`TogetherAI API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    // Parse the structured JSON from the raw response
    const structuredSolution = extractAndParseJson(rawContent);

    console.log('✅ Math solution received and parsed.');
    console.log('=== MATH SOLVER API V2 SUCCESS ===');

    return res.status(200).json({
      solution: structuredSolution,
      model: data.model || 'together-ai'
    });

  } catch (error) {
    console.error('=== MATH SOLVER API V2 ERROR ===');
    console.error('Error details:', error);
    return res.status(500).json({
      error: 'Failed to solve math problem.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
