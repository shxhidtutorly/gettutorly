// api/summarize.js - Enhanced with smart provider switching
export default async function handler(req, res) {
  console.log(`🔍 Summarize API called: ${req.method} to ${req.url}`);
  
  // Set CORS headers first
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for summarize');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`❌ Method ${req.method} not allowed`);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST'],
      received: req.method,
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Parse request body
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }
    
    const { text } = body;
    console.log(`📝 Received text length: ${text?.length || 0} characters`);

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log(`❌ Invalid text input`);
      return res.status(400).json({ 
        error: 'Text is required and must be a non-empty string',
        received: typeof text,
        length: text?.length || 0
      });
    }

    // Smart API Provider Configuration
    const apiProviders = [
      {
        name: 'OpenRouter',
        key: process.env.OPENROUTER_KEY,
        url: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'mistralai/mistral-7b-instruct',
        headers: {
          'HTTP-Referer': 'https://gettutorly.com',
          'X-Title': 'Tutorly PDF Summarizer'
        },
        rateLimitErrors: [429, 402, 403] // Rate limit, payment required, forbidden
      },
      {
        name: 'Claude',
        key: process.env.CLAUDE_API_KEY,
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307', // Fast and efficient model
        headers: {
          'anthropic-version': '2023-06-01'
        },
        rateLimitErrors: [429, 402, 403],
        isAnthropic: true // Special handling for Claude API
      },
      {
        name: 'Groq',
        key: process.env.GROQ_API_KEY,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-8b-8192', // Fast Groq model
        headers: {},
        rateLimitErrors: [429, 402, 403]
      },
      {
        name: 'Together',
        key: process.env.TOGETHER_API_KEY,
        url: 'https://api.together.xyz/v1/chat/completions',
        model: 'meta-llama/Llama-2-7b-chat-hf',
        headers: {},
        rateLimitErrors: [429, 402, 403]
      }
    ];

    // Filter providers that have valid API keys
    const availableProviders = apiProviders.filter(provider => provider.key && provider.key.length > 10);
    
    console.log(`🔧 Available providers: ${availableProviders.map(p => p.name).join(', ')}`);
    
    if (availableProviders.length === 0) {
      return res.status(500).json({
        error: 'No valid API keys found',
        message: 'Please configure at least one API provider'
      });
    }

    // Function to make API call with specific provider
    async function callProvider(provider, textToSummarize) {
      console.log(`🚀 Trying ${provider.name}...`);
      
      let requestBody;
      let headers = {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
        ...provider.headers
      };

      if (provider.isAnthropic) {
        // Claude API format
        requestBody = {
          model: provider.model,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Please provide a clear and concise summary of the following text:\n\n${textToSummarize.slice(0, 15000)}`
            }
          ]
        };
      } else {
        // OpenAI-compatible format (OpenRouter, Groq, Together)
        requestBody = {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, well-structured summaries of documents. Focus on the main points and key information.'
            },
            {
              role: 'user',
              content: `Please provide a clear and concise summary of the following text:\n\n${textToSummarize.slice(0, 15000)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        };
      }

      const response = await fetch(provider.url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log(`📡 ${provider.name} response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if this is a rate limit error
        if (provider.rateLimitErrors.includes(response.status)) {
          console.log(`⚠️ ${provider.name} rate limited or quota exceeded (${response.status})`);
          throw new Error(`RATE_LIMITED:${response.status}`);
        }
        
        console.error(`❌ ${provider.name} API error:`, errorData);
        throw new Error(`API_ERROR:${response.status}:${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      let summary;

      if (provider.isAnthropic) {
        // Claude response format
        summary = data.content?.[0]?.text;
      } else {
        // OpenAI-compatible response format
        summary = data.choices?.[0]?.message?.content;
      }

      if (!summary) {
        console.error(`❌ No summary in ${provider.name} response:`, data);
        throw new Error(`NO_SUMMARY:No summary generated by ${provider.name}`);
      }

      return {
        summary: summary.trim(),
        provider: provider.name,
        model: provider.model
      };
    }

    // Try providers in order until one succeeds
    let lastError = null;
    
    for (const provider of availableProviders) {
      try {
        const result = await callProvider(provider, text);
        
        console.log(`✅ Summary generated successfully using ${result.provider}`);
        console.log(`📊 Summary length: ${result.summary.length} characters`);
        
        return res.status(200).json({
          summary: result.summary,
          metadata: {
            inputLength: text.length,
            outputLength: result.summary.length,
            provider: result.provider,
            model: result.model,
            timestamp: new Date().toISOString(),
            providersAttempted: availableProviders.indexOf(provider) + 1,
            totalProvidersAvailable: availableProviders.length
          }
        });
        
      } catch (error) {
        lastError = error;
        
        if (error.message.startsWith('RATE_LIMITED')) {
          console.log(`⏭️ ${provider.name} rate limited, trying next provider...`);
          continue; // Try next provider
        } else {
          console.log(`⚠️ ${provider.name} failed: ${error.message}, trying next provider...`);
          continue; // Try next provider for other errors too
        }
      }
    }

    // If we get here, all providers failed
    console.error('💥 All providers failed');
    
    return res.status(500).json({
      error: 'All API providers failed or exceeded their limits',
      message: 'Please try again later when rate limits reset',
      providersAttempted: availableProviders.map(p => p.name),
      lastError: lastError?.message || 'Unknown error',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    
    return res.status(500).json({ 
      error: "Internal server error occurred while processing your request",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
