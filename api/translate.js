import crypto from 'crypto';

// Mock Firestore functions for caching (replace with actual Firebase Admin SDK)
const mockCache = new Map();

const generateHash = (text, targetLang) => {
  return crypto.createHash('sha256').update(text + ':' + targetLang).digest('hex');
};

const MODELS = [
  'google/gemini-2.5-pro-exp-03-25',
  'qwen/qwen3-coder:free', 
  'mistralai/mistral-small-3.2-24b-instruct:free',
  'google/gemma-3n-e2b-it:free',
  'mistralai/mistral-7b-instruct:free'
];

const selectModel = (textLength) => {
  if (textLength > 600000) return MODELS[0];
  if (textLength > 150000) return MODELS[1];
  if (textLength > 40000) return MODELS[2];
  if (textLength > 8000) return MODELS[3];
  return MODELS[4];
};

const splitIntoChunks = (text, maxChunkSize = 100000) => {
  const chunks = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // Check if this paragraph contains code fences
    const hasCodeFences = paragraph.includes('```');
    
    if (hasCodeFences || (currentChunk + paragraph).length <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Single paragraph is too large, but we need to keep it intact
        chunks.push(paragraph);
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

const translateWithOpenRouter = async (text, targetLang, sourceLang, model) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const prompt = `You are an expert translator. Translate the following text to ${targetLang}.
Requirements:
- Preserve formatting: headings, bullet lists, numbered lists, tables, and code blocks (\`\`\`).
- Keep special markers (e.g., "<<ANSWER: A>>") unchanged.
- Preserve inline code, variable names, and file names exactly.
- Do NOT add commentary or explain translations — output only the translated text.
Source language: ${sourceLang}
-----
${text}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0,
      max_tokens: Math.min(8000, Math.floor(text.length * 1.5))
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenRouter API');
  }

  return data.choices[0].message.content.trim();
};

const translateChunk = async (chunk, targetLang, sourceLang, modelList) => {
  for (let i = 0; i < modelList.length; i++) {
    const model = modelList[i];
    
    try {
      const translatedText = await translateWithOpenRouter(chunk, targetLang, sourceLang, model);
      
      if (translatedText && translatedText.length > 0) {
        return { translatedText, modelUsed: model };
      }
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
      
      // If this is the last model, return original text
      if (i === modelList.length - 1) {
        return { translatedText: chunk, modelUsed: 'none' };
      }
    }
  }
  
  return { translatedText: chunk, modelUsed: 'none' };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLang, sourceLang = 'auto', contextType = 'general' } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields: text, targetLang' });
    }

    // If target language is same as source or English, return original
    if (targetLang === 'en' || targetLang === sourceLang) {
      return res.json({
        translatedText: text,
        cached: false,
        modelUsed: 'none'
      });
    }

    // Check cache
    const hash = generateHash(text, targetLang);
    
    // Mock cache check (replace with actual Firestore query)
    if (mockCache.has(hash)) {
      const cached = mockCache.get(hash);
      return res.json({
        translatedText: cached.translatedText,
        cached: true,
        modelUsed: cached.modelUsed
      });
    }

    // Split text into chunks
    const chunks = splitIntoChunks(text);
    console.log(`Translating ${chunks.length} chunks to ${targetLang}`);
    
    // Select model based on total text length
    const initialModel = selectModel(text.length);
    const modelIndex = MODELS.indexOf(initialModel);
    const availableModels = MODELS.slice(modelIndex);
    
    // Translate each chunk
    const translatedChunks = [];
    let finalModelUsed = 'none';
    
    for (const chunk of chunks) {
      const result = await translateChunk(chunk, targetLang, sourceLang, availableModels);
      translatedChunks.push(result.translatedText);
      
      if (result.modelUsed !== 'none') {
        finalModelUsed = result.modelUsed;
      }
    }
    
    const finalTranslation = translatedChunks.join('\n\n');
    
    // Cache the result (mock - replace with actual Firestore)
    mockCache.set(hash, {
      translatedText: finalTranslation,
      modelUsed: finalModelUsed,
      createdAt: new Date().toISOString()
    });
    
    return res.json({
      translatedText: finalTranslation,
      cached: false,
      modelUsed: finalModelUsed
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: 'Translation failed',
      details: error.message 
    });
  }
}
