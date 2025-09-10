// A helper function for creating a delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// A robust helper function to safely parse JSON from the AI's response (works for both Gemini and TogetherAI)
function extractAndParseJson(text) {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error("Could not find a valid JSON code block in the AI response.");
  }
  const jsonString = jsonMatch[1];
  try {
    return JSON.parse(jsonString);
  } catch (initialError) {
    console.warn("Initial JSON.parse failed. Attempting to sanitize and re-parse...");
    const sanitizedJsonString = jsonString.replace(/\\(?![\\/"bfnrt])/g, '\\\\');
    try {
      return JSON.parse(sanitizedJsonString);
    } catch (secondError) {
      console.error("Failed to parse JSON even after sanitizing.", { original: jsonString, sanitized: sanitizedJsonString });
      throw new Error(`Invalid JSON format in AI response: ${initialError.message}`);
    }
  }
}

// --- PROMPT DEFINITIONS ---
const systemPrompt = `You are an expert mathematics tutor. Your task is to provide step-by-step solutions to math problems. You MUST ONLY respond with a JSON object in the specified format, enclosed in a \`\`\`json code block. Do not add any conversational text or explanations outside of the JSON structure. Ensure all LaTeX backslashes are correctly escaped for JSON.`;

const getMathPrompt = (problem) => `Solve the following math problem. Provide a clear, step-by-step solution.

Problem: "${problem}"

Your response MUST be a JSON object inside a \`\`\`json code block. The JSON object should have a single key "steps", which is an array of objects. Each object in the array represents a single step and must have two keys:
1. "explanation": A string explaining the concept or the action taken in this step.
2. "formula": A string containing the mathematical equation for this step, formatted in LaTeX. Use $$ for display math. IMPORTANT: All backslashes in LaTeX must be properly escaped for JSON (e.g., use "\\\\sqrt" instead of "\\sqrt").`;


// --- API CALLER FOR TOGETHERAI (FALLBACK) ---
async function callTogetherAIWithRetries(apiRequestBody, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (response.ok) return response;

      if (response.status >= 500) {
        console.warn(`⚠️ TogetherAI API returned status ${response.status}. Retrying in ${i + 1}s...`);
        await delay((i + 1) * 1000);
      } else {
        console.error(`❌ TogetherAI API returned client error: ${response.status}. Not retrying.`);
        return response;
      }
    } catch (error) {
      console.warn(`⚠️ Network error during TogetherAI fetch. Retrying in ${i + 1}s...`);
      await delay((i + 1) * 1000);
    }
  }
  return null;
}


export default async function handler(req, res) {
  console.log('=== MATH SOLVER API V4 (GEMINI PRIMARY) START ===');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { problem } = req.body;
    if (!problem || typeof problem !== 'string') {
      return res.status(400).json({ error: 'Problem is required and must be a string' });
    }
    console.log('✅ Valid request - Problem:', problem.substring(0, 70) + '...');

    let rawContent = null;
    let modelUsed = null;

    // --- ATTEMPT 1: GOOGLE GEMINI (PRIMARY) ---
    const geminiModel = 'gemini-1.5-flash-latest';
    console.log(`🤖 Calling primary model: ${geminiModel}`);
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY1;
      if (!geminiApiKey) throw new Error("GEMINI_API_KEY1 environment variable not set.");

      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      
      const geminiRequest = {
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${getMathPrompt(problem)}` }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequest),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        rawContent = data.candidates[0].content.parts[0].text;
        modelUsed = geminiModel;
      } else {
        // Handle cases where Gemini blocks the response for safety reasons
        throw new Error(`Gemini responded but without valid content. Block reason: ${data.candidates?.[0]?.finishReason}`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Primary model (Gemini) failed. Reason: ${error.message}`);
      // If Gemini fails, rawContent will remain null, triggering the fallback.
    }

    // --- ATTEMPT 2: TOGETHERAI (FALLBACK) ---
    if (!rawContent) {
      const fallbackModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';
      console.warn(`↪️ Falling back to model: ${fallbackModel}`);
      
      const togetherApiRequestBody = {
        model: fallbackModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: getMathPrompt(problem) }
        ],
        temperature: 0.2,
        max_tokens: 2048,
      };

      const response = await callTogetherAIWithRetries(togetherApiRequestBody);

      if (!response || !response.ok) {
        const errorBody = response ? await response.text() : "All retries failed with network errors.";
        throw new Error(`Fallback API error: ${response ? response.status : 'N/A'} - ${errorBody}`);
      }

      const data = await response.json();
      rawContent = data.choices[0].message.content;
      modelUsed = data.model || fallbackModel;
    }

    if (!rawContent) {
        throw new Error("Both primary and fallback models failed to generate a response.");
    }

    const structuredSolution = extractAndParseJson(rawContent);

    console.log(`✅ Solution parsed successfully using model: ${modelUsed}`);
    console.log('=== MATH SOLVER API V4 (GEMINI PRIMARY) SUCCESS ===');

    return res.status(200).json({
      solution: structuredSolution,
      model: modelUsed,
    });

  } catch (error) {
    console.error('=== MATH SOLVER API V4 (GEMINI PRIMARY) ERROR ===');
    console.error('Error details:', error);
    return res.status(500).json({
      error: 'Failed to solve math problem.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
