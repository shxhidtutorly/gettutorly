import { streamToString } from '@/lib/stream-utils'; // Helper function, see below

/**
 * A more robust helper function to safely parse JSON from the AI's response.
 * @param {string} text - The raw text response from the AI.
 * @returns {object} - The parsed JavaScript object.
 */
function extractAndParseJson(text) {
  // Find the JSON code block, allowing for some flexibility.
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch || !jsonMatch[1]) {
    // If no code block, try to parse the whole string as a fallback.
    console.log("⚠️ Could not find a JSON code block. Attempting to parse the entire response.");
    return parseWithSanitization(text);
  }

  const jsonString = jsonMatch[1];
  return parseWithSanitization(jsonString);
}

/**
 * Attempts to parse a JSON string, sanitizing it if the initial attempt fails.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {object} - The parsed JavaScript object.
 */
function parseWithSanitization(jsonString) {
  try {
    // First, try to parse the string as is.
    return JSON.parse(jsonString);
  } catch (initialError) {
    console.log("Initial JSON.parse failed. Attempting to sanitize and re-parse...");
    console.log("Initial error:", initialError.message);
    
    // This is a common issue where the AI forgets to escape backslashes for LaTeX.
    // This regex looks for a single backslash followed by a letter (like in \frac, \sqrt)
    // and replaces it with a double backslash. It's safer than the previous version.
    const sanitizedJsonString = jsonString.replace(/\\([a-zA-Z])/g, '\\\\$1');

    try {
      // Try parsing the sanitized string.
      const parsedJson = JSON.parse(sanitizedJsonString);
      console.log("✅ Successfully parsed JSON after sanitization.");
      return parsedJson;
    } catch (secondError) {
      console.error("❌ Failed to parse JSON even after sanitizing.");
      console.error("Original JSON String:", jsonString);
      console.error("Sanitized JSON String:", sanitizedJsonString);
      console.error("Second error:", secondError.message);
      // Throw the original error for better debugging context.
      throw new Error(`Invalid JSON format in AI response: ${initialError.message}`);
    }
  }
}

export default async function handler(req, res) {
  console.log('=== MATH SOLVER API V3 (OPTIMIZED) START ===');
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

    const mathPrompt = `Solve the math problem: "${problem}".
Your response MUST be a JSON object inside a \`\`\`json code block.
The JSON object must have a single key "steps", which is an array of objects.
Each object in the array represents a step and must have two keys:
1. "explanation": A string explaining the step.
2. "formula": A string with the LaTeX equation for the step.

IMPORTANT: All backslashes in LaTeX must be properly escaped for JSON. For example, use "\\\\frac", not "\\frac".

Example Response:
\`\`\`json
{
  "steps": [
    {
      "explanation": "Apply the quadratic formula.",
      "formula": "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}"
    }
  ]
}
\`\`\`
`;

    const systemPrompt = `You are a math tutor bot. You only respond with a JSON object in the specified format, enclosed in a \`\`\`json code block. Do not add any text outside the JSON block. Ensure all LaTeX backslashes are correctly escaped.`;
    
    // Use a much faster and more cost-effective model suitable for this task.
    const model = 'meta-llama/Llama-3-8B-Instruct-Turbo';

    const apiRequestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mathPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2048,
      stream: true, // Enable streaming for faster response start
    };

    console.log(`🤖 Calling TogetherAI with model: ${model}...`);
    
    // Implement a timeout to prevent long-running requests that can crash servers.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
      signal: controller.signal, // Link the timeout controller
    });

    clearTimeout(timeoutId); // Clear the timeout if the request succeeds

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`TogetherAI API error: ${response.status} - ${errorBody}`);
    }

    // Process the streamed response
    const rawContent = await streamToString(response.body);
    const structuredSolution = extractAndParseJson(rawContent);

    console.log('✅ Math solution received and parsed.');
    console.log('=== MATH SOLVER API V3 (OPTIMIZED) SUCCESS ===');

    return res.status(200).json({
      solution: structuredSolution,
      model: model
    });

  } catch (error) {
    console.error('=== MATH SOLVER API V3 (OPTIMIZED) ERROR ===');
    console.error('Error details:', error);
    const errorMessage = error.name === 'AbortError' ? 'API request timed out.' : 'Failed to solve math problem.';
    return res.status(500).json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
