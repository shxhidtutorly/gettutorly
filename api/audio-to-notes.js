
// api/audio-to-notes.js - Audio transcription and AI notes generation
export default async function handler(req, res) {
  console.log(`🎙️ Audio to Notes API called: ${req.method}`);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Check for AssemblyAI API key
    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) {
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured' 
      });
    }

    let audioUrl;
    let transcriptText;

    // Handle FormData (new upload) or JSON (regenerate)
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // For now, return a mock response since we can't handle file uploads in this API format
      // In a real implementation, you'd upload to UploadThing first
      return res.status(400).json({ 
        error: 'File upload not implemented in this demo. Please use a proper file upload service.' 
      });
    } else {
      // Handle JSON request (regenerate with existing audio URL)
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      audioUrl = body.audioUrl;

      if (!audioUrl) {
        return res.status(400).json({ error: 'Audio URL is required' });
      }
    }

    console.log(`🎵 Processing audio from URL: ${audioUrl}`);

    // Step 1: Transcribe audio using AssemblyAI
    console.log('🔄 Starting transcription with AssemblyAI...');
    
    // Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': assemblyAIKey,
      },
      body: await fetch(audioUrl).then(r => r.arrayBuffer())
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI');
    }

    const { upload_url } = await uploadResponse.json();

    // Request transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyAIKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        auto_chapters: true,
        speaker_labels: true,
      })
    });

    if (!transcriptResponse.ok) {
      throw new Error('Failed to request transcription');
    }

    const { id: transcriptId } = await transcriptResponse.json();

    // Poll for completion
    let transcript;
    let attempts = 0;
    const maxAttempts = 160; // 15 minutes max

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': assemblyAIKey }
      });

      transcript = await statusResponse.json();

      if (transcript.status === 'completed') {
        transcriptText = transcript.text;
        break;
      } else if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcriptText) {
      throw new Error('Transcription timed out');
    }

    console.log(`✅ Transcription completed: ${transcriptText.length} characters`);

    // Step 2: Generate AI notes and summary
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
    const aiContent = aiData.response || aiData.message || '';

    // Split into summary and notes (simple heuristic)
    const sections = aiContent.split(/(?:^|\n)(?:##?\s*(?:Summary|Notes|Detailed))/i);
    const summary = sections[1]?.trim() || aiContent.substring(0, 500) + '...';
    const notes = sections[2]?.trim() || aiContent;

    console.log('✅ AI notes generated successfully');

    return res.status(200).json({
      notes: notes || aiContent,
      summary: summary || 'Summary generated from lecture transcription.',
      audioUrl: audioUrl,
      transcription: transcriptText,
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
      message: error.message 
    });
  }
}
