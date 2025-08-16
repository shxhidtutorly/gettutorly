
// api/audio-to-notes.js - Audio transcription and AI notes generation
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

/**
 * Get user language preference from Firestore
 */
async function getUserLanguage(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.preferences?.language || 'en';
    }
    return 'en';
  } catch (error) {
    console.error('Error fetching user language:', error);
    return 'en';
  }
}

/**
 * Translate text using the translation API
 */
async function translateText(text, targetLang, sourceLang = 'en') {
  if (targetLang === 'en' || targetLang === sourceLang) {
    return text;
  }

  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang,
        contextType: 'notes'
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

export default async function handler(req, res) {
  console.log(`🎙️ Audio to Notes API called: ${req.method}`);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify authentication
  let user;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid Firebase ID token'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    user = decodedToken;
    console.log('✅ Authenticated user:', user.uid);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }

  try {
    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) {
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured' 
      });
    }

    const { audio_url } = req.body;
    if (!audio_url) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }

    // Get user language preference
    const userLanguage = await getUserLanguage(user.uid);
    console.log('🌍 User language preference:', userLanguage);

    console.log('🎵 Processing audio from URL:', audio_url);

    // Step 1: Request transcription from AssemblyAI
    console.log('🔄 Starting transcription with AssemblyAI...');
    
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyAIKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audio_url,
        auto_chapters: true,
        speaker_labels: true,
      })
    });

    if (!transcriptResponse.ok) {
      throw new Error('Failed to request transcription');
    }

    const { id: transcriptId } = await transcriptResponse.json();

    // Step 2: Poll for completion
    let transcript;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'authorization': assemblyAIKey,
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check transcription status');
      }

      transcript = await statusResponse.json();

      if (transcript.status === 'completed') {
        break;
      } else if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }

    if (!transcript || transcript.status !== 'completed') {
      throw new Error('Transcription timed out');
    }

    const transcriptText = transcript.text;
    console.log(`✅ Transcription completed: ${transcriptText.length} characters`);

    // Step 3: Generate AI notes and summary
    console.log('🤖 Generating AI notes and summary...');
    
    const notesPrompt = `You are an expert note-taker and study assistant. Based on this lecture transcription, create comprehensive study notes and a concise summary.

TRANSCRIPTION:
${transcriptText}

Please provide:
1. A concise summary (2-3 paragraphs) highlighting the main points
2. Detailed structured notes with key concepts, definitions, and important details

Format the notes with clear headings and bullet points for easy studying.`;

    // Use existing AI infrastructure
    const aiResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http://localhost:3000' : 'https://' + req.headers.host}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: notesPrompt, 
        model: 'together' 
      })
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate AI notes');
    }

    const aiData = await aiResponse.json();
    const originalContent = aiData.response || aiData.message || '';

    // Split into summary and notes (simple heuristic)
    const sections = originalContent.split(/(?:^|\n)(?:##?\s*(?:Summary|Notes|Detailed))/i);
    const originalSummary = sections[1]?.trim() || originalContent.substring(0, 500) + '...';
    const originalNotes = sections[2]?.trim() || originalContent;

    // Translate content if user language is not English
    let finalSummary = originalSummary;
    let finalNotes = originalNotes;
    let wasTranslated = false;

    if (userLanguage !== 'en') {
      console.log('🌐 Translating notes and summary to:', userLanguage);
      try {
        const [translatedSummary, translatedNotes] = await Promise.all([
          translateText(originalSummary, userLanguage, 'en'),
          translateText(originalNotes, userLanguage, 'en')
        ]);
        
        finalSummary = translatedSummary;
        finalNotes = translatedNotes;
        wasTranslated = true;
        console.log('✅ Translation completed');
      } catch (error) {
        console.error('❌ Translation failed:', error);
        // Keep original content if translation fails
        finalSummary = originalSummary;
        finalNotes = originalNotes;
      }
    }

    console.log('✅ AI notes generated successfully');

    return res.status(200).json({
      notes: finalNotes,
      summary: finalSummary,
      originalNotes: originalNotes,
      originalSummary: originalSummary,
      audioUrl: audio_url,
      transcription: transcriptText,
      userLanguage,
      wasTranslated,
      translationInfo: wasTranslated ? {
        targetLanguage: userLanguage,
        sourceLanguage: 'en'
      } : null,
      metadata: {
        provider: 'AssemblyAI + Together AI',
        duration: transcript?.audio_duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('🔥 Error in audio-to-notes API:', error);
    return res.status(500).json({ 
      error: 'Failed to process audio',
      details: error.message 
    });
  }
}
