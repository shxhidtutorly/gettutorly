console.log('🚀 Starting Math Solver API import...');

// Filter function to remove LaTeX, Markdown, and extra formatting
function cleanMathBotOutput(input) {
  return input
    // Remove LaTeX delimiters (\[ \], \( \)), $ and $$
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '')
    .replace(/\$\$?/g, '')
    // Remove Markdown bold (**bold**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove Markdown italics (*italic*)
    .replace(/\*(.*?)\*/g, '$1')
    // Remove inline code ticks
    .replace(/`/g, '')
    // Remove double backslashes used for LaTeX
    .replace(/\\\\/g, '\\')
    // Remove // comments at the start of lines (optional)
    .replace(/^\/\/.*$/gm, '')
    // Remove HTML <think>...</think> blocks (if any)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    // Remove empty lines
    .replace(/^\s*[\r\n]/gm, '')
    .trim();
}

export default async function handler(req, res) {
  console.log('=== MATH SOLVER API ROUTE START ===');
  console.log('Method:', req.method);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { problem } = req.body;

    // Validate required fields
    if (!problem || typeof problem !== 'string') {
      console.log('❌ Invalid problem:', problem);
      return res.status(400).json({
        error: 'Problem is required and must be a string'
      });
    }

    console.log('✅ Valid request - Problem:', problem.substring(0, 50) + '...');

    const mathPrompt = `You're a math expert. Solve the following problem step-by-step with LaTeX formatting for mathematical expressions. Use $ for inline math and $$ for display math blocks:

${problem}

Provide a clear, step-by-step solution with proper mathematical notation.`;

    console.log('🤖 Calling TogetherAI...');

    // Try DeepSeek R1 Distill LLaMA 70B first
    let response;
    try {
      response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
          messages: [
            {
              role: 'system',
              content: 'You are an expert mathematics tutor. Always format mathematical expressions using LaTeX notation with $ for inline math and $$ for display blocks.'
            },
            {
              role: 'user',
              content: mathPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });
    } catch (error) {
      console.log('⚠️ Primary model failed, trying fallback...');

      // Fallback to Meta Llama 3.3 70B
      response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert mathematics tutor. Always format mathematical expressions using LaTeX notation with $ for inline math and $$ for display blocks.'
            },
            {
              role: 'user',
              content: mathPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });
    }

    if (!response.ok) {
      throw new Error(`TogetherAI API error: ${response.status}`);
    }

    const data = await response.json();
    const solution = data.choices[0].message.content;
    const plainSolution = cleanMathBotOutput(solution);

    console.log('✅ Math solution received:', solution.substring(0, 100) + '...');
    console.log('=== MATH SOLVER API ROUTE SUCCESS ===');

    return res.status(200).json({
      solution: solution,
      plainSolution: plainSolution,
      model: data.model || 'together-ai'
    });

  } catch (error) {
    console.error('=== MATH SOLVER API ROUTE ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);

    console.log('❌ General error');
    return res.status(500).json({
      error: 'Failed to solve math problem. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
