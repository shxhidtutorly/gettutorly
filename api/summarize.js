// api/summarize.js - Updated for meta-llama/Llama-3.3-70B-Instruct-Turbo-Free model
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
      received: req.method
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

    // Debug: Log available environment variables
    const envKeys = [
      'OPENROUTER_KEY',
      'CLAUDE_API_KEY', 
      'GROQ_API_KEY',
      'TOGETHER_API_KEY'
    ];
    
    console.log('🔑 Environment check:');
    envKeys.forEach(key => {
      const value = process.env[key];
      console.log(`  ${key}: ${value ? `✅ (${value.length} chars)` : '❌ missing'}`);
    });

    // Smart API Provider Configuration with proper error handling
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
        format: 'openai'
      },
      {
        name: 'Claude',
        key: process.env.CLAUDE_API_KEY,
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307',
        headers: {
          'anthropic-version': '2023-06-01'
        },
        format: 'anthropic'
      },
      {
        name: 'Groq',
        key: process.env.GROQ_API_KEY,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-8b-8192',
        headers: {},
        format: 'openai'
      },
      {
        name: 'Together',
        key: process.env.TOGETHER_API_KEY,
        url: 'https://api.together.xyz/v1/chat/completions',
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        headers: {},
        format: 'openai'
      }
    ];

    // Filter providers that have valid API keys (more than 10 characters)
    const availableProviders = apiProviders.filter(provider => {
      const hasKey = provider.key && provider.key.length > 10;
      console.log(`🔧 ${provider.name}: ${hasKey ? '✅ Available' : '❌ No valid key'}`);
      return hasKey;
    });
    
    console.log(`🚀 Will try providers in order: ${availableProviders.map(p => p.name).join(' → ')}`);
    
    if (availableProviders.length === 0) {
      return res.status(500).json({
        error: 'No valid API keys found',
        message: 'Please configure at least one API provider with a valid key',
        keysChecked: envKeys
      });
    }

    // Function to make API call with specific provider
    async function callProvider(provider, textToSummarize) {
      console.log(`\n🚀 Attempting ${provider.name}...`);
      console.log(`📋 Model: ${provider.model}`);
      console.log(`🔑 Key: ${provider.key.substring(0, 10)}...`);
      
      try {
        let requestBody;
        let headers = {
          'Content-Type': 'application/json',
          ...provider.headers
        };

        // Truncate text to prevent token limit issues
        const maxChars = 12000; // Conservative limit
        const truncatedText = textToSummarize.slice(0, maxChars);
        
        if (provider.format === 'anthropic') {
          // Claude API format
          headers['x-api-key'] = provider.key;
          requestBody = {
            model: provider.model,
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: `Please provide a clear and concise summary of the following text:\n\n${truncatedText}`
              }
            ]
          };
        } else {
          // OpenAI-compatible format (OpenRouter, Groq, Together)
          headers['Authorization'] = `Bearer ${provider.key}`;
          requestBody = {
            model: provider.model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that creates concise, well-structured summaries. Focus on the main points and key information.'
              },
              {
                role: 'user',
                content: `Please provide a clear and concise summary of the following text:\n\n${truncatedText}`
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          };
        }

        console.log(`📡 Making request to ${provider.url}`);
        console.log(`📊 Request body size: ${JSON.stringify(requestBody).length} characters`);

        const response = await fetch(provider.url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        });

        console.log(`📡 ${provider.name} response status: ${response.status}`);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: 'Failed to parse error response' };
          }
          
          console.log(`❌ ${provider.name} Error Response:`, JSON.stringify(errorData, null, 2));
          
          // Check if this is a rate limit error
          if ([429, 402, 403].includes(response.status)) {
            throw new Error(`RATE_LIMITED:${response.status}:${errorData.error?.message || 'Rate limited'}`);
          }
          
          throw new Error(`API_ERROR:${response.status}:${errorData.error?.message || errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log(`✅ ${provider.name} successful response received`);

        let summary;
        if (provider.format === 'anthropic') {
          // Claude response format
          summary = data.content?.[0]?.text;
        } else if (provider.name === 'Together') {
          // Together API response format
          // Usually, it's similar to OpenAI's format
          summary = data.choices?.[0]?.message?.content;
        } else {
          // OpenAI-compatible response format (OpenRouter, Groq)
          summary = data.choices?.[0]?.message?.content;
        }

        if (!summary) {
          console.error(`❌ No summary extracted from ${provider.name} response`);
          console.error('Response structure:', JSON.stringify(data, null, 2));
          throw new Error(`NO_SUMMARY:No valid summary found in response`);
        }

        return {
          summary: summary.trim(),
          provider: provider.name,
          model: provider.model
        };

      } catch (error) {
        console.error(`💥 ${provider.name} failed:`, error.message);
        throw error;
      }
    }

    // Try providers in order until one succeeds
    let lastError = null;
    const attemptedProviders = [];
    
    for (const provider of availableProviders) {
      attemptedProviders.push(provider.name);
      
      try {
        const result = await callProvider(provider, text);
        
        console.log(`\n🎉 SUCCESS! Summary generated using ${result.provider}`);
        console.log(`📊 Summary length: ${result.summary.length} characters`);
        
        return res.status(200).json({
          summary: result.summary,
          metadata: {
            inputLength: text.length,
            outputLength: result.summary.length,
            provider: result.provider,
            model: result.model,
            timestamp: new Date().toISOString(),
            providersAttempted: attemptedProviders.length,
            totalProvidersAvailable: availableProviders.length,
            success: true
          }
        });
        
      } catch (error) {
        lastError = error.message;
        console.log(`⏭️ ${provider.name} failed, trying next provider...`);
        continue;
      }
    }

    // If we get here, all providers failed
    console.error(`❌ All providers failed after trying: ${attemptedProviders.join(', ')}`);
    return res.status(503).json({
      error: 'All API providers failed to generate summary',
      lastError: lastError,
      providersAttempted: attemptedProviders
    });

  } catch (err) {
    console.error('❌ Unexpected server error in /api/summarize:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  }
}
