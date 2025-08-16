console.log('📦 Loading aiProviders.js...');

class AIProviderManager {
  constructor() {
    console.log('🔧 Initializing AI Provider Manager...');
    this.providerOrder = ['together', 'gemini', 'groq', 'claude', 'openrouter', 'huggingface'];
    this.apiKeys = {
      gemini: this.getKeysFromEnv('GEMINI_API_KEY'),
      groq: this.getKeysFromEnv('GROQ_API_KEY'),
      claude: this.getKeysFromEnv('CLAUDE_API_KEY'),
      openrouter: this.getKeysFromEnv('OPENROUTER_API_KEY'),
      huggingface: this.getKeysFromEnv('HUGGINGFACE_API_KEY'),
      together: this.getKeysFromEnv('TOGETHER_API_KEY'),
    };

    Object.entries(this.apiKeys).forEach(([provider, keys]) => {
      console.log(`🔑 ${provider}: ${keys.length} keys available`);
    });
  }

  getKeysFromEnv(envVar) {
    const keys = process.env[envVar];
    if (!keys) {
      console.log(`⚠️ No keys found for ${envVar}`);
      return [];
    }
    return keys.split(',').map(key => key.trim()).filter(Boolean);
  }

  /**
   * Removes common Markdown formatting from a given text string.
   * Ensures the input is treated as a string.
   * @param {string} text - The input text, potentially with Markdown.
   * @returns {string} The text with Markdown formatting removed.
   */
  removeMarkdownFormatting(text) {
    // Ensure text is a string before processing
    if (typeof text !== 'string') {
      return String(text); // Convert to string if it's not already
    }

    // Remove bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '$1$2');

    // Remove italics (*text* or _text_)
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '$1$2');

    // Remove headings (# Heading)
    text = text.replace(/^#+\s*(.*)$/gm, '$1');

    // Remove code blocks (```code```)
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove inline code (`code`)
    text = text.replace(/`(.*?)`/g, '$1');

    // Remove bullet points/list markers (* item, - item, + item) - keep the text
    text = text.replace(/^[\*\-\+]\s*(.*)$/gm, '$1');

    // Remove numbered lists (1. item, 2. item) - keep the text
    text = text.replace(/^\d+\.\s*(.*)$/gm, '$1');

    // Remove blockquotes (> quote) - keep the text
    text = text.replace(/^>\s*(.*)$/gm, '$1');

    // Remove horizontal rules (---, ***, ___)
    text = text.replace(/^[-\*\_]{3,}\s*$/gm, '');

    // Trim leading/trailing whitespace from each line
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Replace multiple consecutive newlines with a maximum of two newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text;
  }

  /**
   * Fetches an AI response from the specified model, with fallback logic
   * to other providers and keys if the initial attempt fails.
   * @param {string|object} prompt - The input prompt. Can be a string or an object
   * like { text: "...", files: [...] } for multimodal models.
   * @param {string} model - The preferred model to use (e.g., 'gemini', 'llama-3.1-8b-instant').
   * @returns {Promise<object>} An object containing the message, provider, and model used.
   * @throws {Error} If all API keys fail for all available providers.
   */
  async getAIResponse(prompt, model) {
    const requestedProvider = this.getProviderForModel(model);
    // Create a fallback order: requested provider first, then others.
    const fallbackProviders = [requestedProvider, ...this.providerOrder.filter(p => p !== requestedProvider)];

    for (const provider of fallbackProviders) {
      const keys = this.apiKeys[provider];
      if (!keys || keys.length === 0) {
        console.log(`ℹ️ Skipping ${provider}: No API keys available.`);
        continue;
      }

      for (let i = 0; i < keys.length; i++) {
        try {
          console.log(`Attempting to call ${provider} with key ${i + 1}...`);
          const response = await this.callProvider(provider, prompt, keys[i], model);
          console.log(`✅ Successfully received response from ${provider}.`);
          return { message: response, provider, model };
        } catch (error) {
          console.log(`❌ Failed with ${provider} key ${i + 1}: ${error.message}`);
        }
      }
    }

    throw new Error(`All API keys failed for all providers. Please check your API keys and network connection.`);
  }

  /**
   * Determines the primary provider for a given model.
   * @param {string} model - The model name.
   * @returns {string} The provider name associated with the model.
   */
  getProviderForModel(model) {
    const modelProviderMap = {
      // Direct mapping for common models to their primary providers
      'gemini': 'gemini',
      'gemini-2.5-flash': 'gemini',
      'llama-3.1-8b-instant': 'groq',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free': 'together',
      'claude-3-5-sonnet-20241022': 'claude',
      'deepseek/deepseek-r1-0528-qwen3-8b:free': 'openrouter',
      'microsoft/DialoGPT-medium': 'huggingface',
      // Add more specific model-to-provider mappings as needed
    };
    // If a specific model is mapped, return its provider. Otherwise, assume the model name is the provider name.
    return modelProviderMap[model] || model;
  }

  /**
   * Calls the appropriate AI provider based on the provider name.
   * Handles prompt formatting for different APIs.
   * @param {string} provider - The name of the AI provider.
   * @param {string|object} prompt - The input prompt. Can be a string or an object { text: "...", files: [...] }.
   * @param {string} apiKey - The API key for the provider.
   * @param {string} model - The specific model to use (relevant for OpenRouter).
   * @returns {Promise<string>} The AI's response text.
   * @throws {Error} If the provider is unsupported or API call fails.
   */
  async callProvider(provider, prompt, apiKey, model) {
    let finalPromptForAPI = prompt; // Default to original prompt

    // Process prompt based on provider expectations
    if (typeof prompt === 'object' && prompt !== null) {
      if (provider !== 'gemini') {
        // For non-Gemini models, if prompt is an object, extract its 'text' property.
        if (prompt.text !== undefined) {
          finalPromptForAPI = prompt.text;
        } else {
          // If it's an object but doesn't have a 'text' property, log a warning
          // and attempt to stringify the object. This might not always yield
          // a meaningful prompt for the LLM, but prevents a type error.
          console.warn(`⚠️ Unexpected object prompt format for ${provider}. Attempting to convert to string.`);
          finalPromptForAPI = JSON.stringify(prompt);
        }
      }
      // If provider is 'gemini', finalPromptForAPI remains the original object (with text/files).
    } else if (typeof prompt !== 'string') {
      // If it's not a string and not an object, convert to string.
      console.warn(`⚠️ Non-string/non-object prompt (${typeof prompt}) provided to ${provider}. Attempting to convert.`);
      finalPromptForAPI = String(prompt);
    }
    // If prompt is already a string, finalPromptForAPI remains the original string.

    switch (provider) {
      case 'gemini':
        // Gemini's callGemini expects an object { text, files } or just { text }.
        // If finalPromptForAPI is a string, convert it to the expected object format.
        if (typeof finalPromptForAPI === 'string') {
          return await this.callGemini({ text: finalPromptForAPI }, apiKey);
        }
        return await this.callGemini(finalPromptForAPI, apiKey);
      case 'groq':
        return await this.callGroq(finalPromptForAPI, apiKey);
      case 'claude':
        return await this.callClaude(finalPromptForAPI, apiKey);
      case 'openrouter':
        return await this.callOpenRouter(finalPromptForAPI, apiKey, model);
      case 'huggingface':
        return await this.callHuggingFace(finalPromptForAPI, apiKey);
      case 'together':
        return await this.callTogether(finalPromptForAPI, apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Calls the Gemini API to generate content.
   * @param {object} prompt - An object containing text and optionally files ({ text: string, files?: Array<object> }).
   * @param {string} apiKey - The Gemini API key.
   * @returns {Promise<string>} The generated text response.
   * @throws {Error} If the API call fails or returns an error.
   */
  async callGemini(prompt, apiKey) {
    const parts = [];

    if (prompt.text) parts.push({ text: prompt.text });

    if (prompt.files) {
      for (const file of prompt.files) {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.base64
          }
        });
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1800
        }
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`, data);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let geminiTextResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!geminiTextResponse) {
      console.warn('⚠️ Gemini returned no text content. Full response data:', JSON.stringify(data, null, 2));
      if (data.promptFeedback?.blockReason) {
        console.warn(`Gemini blocked response due to: ${data.promptFeedback.blockReason}`);
      }
      if (data.candidates?.[0]?.finishReason) {
        console.warn(`Gemini finished with reason: ${data.candidates[0].finishReason}`);
      }
      return 'No response from Gemini (see server logs for details).';
    }

    // Apply markdown removal for Gemini's response
    geminiTextResponse = this.removeMarkdownFormatting(geminiTextResponse);

    return geminiTextResponse;
  }

  /**
   * Calls the Groq API to generate chat completions.
   * @param {string} prompt - The input prompt string.
   * @param {string} apiKey - The Groq API key.
   * @returns {Promise<string>} The generated text response.
   * @throws {Error} If the API call fails or returns an error.
   */
  async callGroq(prompt, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let groqResponse = data.choices?.[0]?.message?.content || 'No response from Groq';
    // Apply markdown removal for Groq's response
    groqResponse = this.removeMarkdownFormatting(groqResponse);
    return groqResponse;
  }

  /**
   * Calls the Claude API to generate messages.
   * @param {string} prompt - The input prompt string.
   * @param {string} apiKey - The Claude API key.
   * @returns {Promise<string>} The generated text response.
   * @throws {Error} If the API call fails or returns an error.
   */
  async callClaude(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let claudeResponse = data.content?.[0]?.text || 'No response from Claude';
    // Apply markdown removal for Claude's response
    claudeResponse = this.removeMarkdownFormatting(claudeResponse);
    return claudeResponse;
  }

  /**
   * Calls the OpenRouter API to generate chat completions.
   * @param {string} prompt - The input prompt string.
   * @param {string} apiKey - The OpenRouter API key.
   * @param {string} model - The specific model to use on OpenRouter.
   * @returns {Promise<string>} The generated text response.
   * @throws {Error} If the API call fails or returns an error.
   */
  async callOpenRouter(prompt, apiKey, model) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gettutorly.com', 
        'X-Title': 'AI Provider Manager'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free', // Using the model specified in your original code
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 6000,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let openRouterResponse = data.choices?.[0]?.message?.content || 'No response from OpenRouter';
    // Apply markdown removal for OpenRouter's response
    openRouterResponse = this.removeMarkdownFormatting(openRouterResponse);
    return openRouterResponse;
  }

  /**
   * Calls the Hugging Face Inference API.
   * Note: Hugging Face models can vary greatly in their input/output formats.
   * This implementation assumes a simple text-to-text model like DialoGPT.
   * @param {string} prompt - The input prompt string.
   * @param {string} apiKey - The Hugging Face API key.
   * @returns {Promise<string>} The generated text response.
   * @throws {Error} If the API call fails or returns an error.
   */
  async callHuggingFace(prompt, apiKey) {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 900,
          temperature: 0.3
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    let huggingFaceResponse = Array.isArray(data) ? data[0]?.generated_text || 'No response from Hugging Face' : data.generated_text || 'No response from Hugging Face';
    // Apply markdown removal for Hugging Face's response
    huggingFaceResponse = this.removeMarkdownFormatting(huggingFaceResponse);
    return huggingFaceResponse;
  }

  /**
   * Calls the Together.ai API to generate chat completions.
   * @param {string} prompt - The input prompt string.
   * @param {string} apiKey - The Together.ai API key.
   * @returns {Promise<string>} The generated text response.
   * @throws {Error} If the API call fails or returns an error.
   */
  async callTogether(prompt, apiKey) {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', // Using the model specified in your original code
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 5006,
        temperature: 0.3
      })
    });

    const data = await response.json();

    console.log('📥 Together API full response:', JSON.stringify(data, null, 2));
    let message = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason || 'unknown';
    console.log(`📌 Together finish reason: ${finishReason}`);

    if (!message || message.length < 20) {
      console.warn('⚠️ Short or missing response from Together:', message);
    }

    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${data.error?.message || ''}`);
    }

    // Apply markdown removal for Together's response
    message = this.removeMarkdownFormatting(message || ''); // Ensure it's a string, even if null/undefined
    return message;
  }
}

export { AIProviderManager };
console.log('✅ AIProviderManager exported successfully');
