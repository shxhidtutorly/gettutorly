
// api/transcribe.js - AssemblyAI transcription API endpoint
export default async function handler(req, res) {
  console.log('🎙️ Transcribe API called:', req.method);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
        headers: { 'authorization': assemblyAIKey }
      });

      transcript = await statusResponse.json();

      if (transcript.status === 'completed') {
        break;
      } else if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcript || transcript.status !== 'completed') {
      throw new Error('Transcription timed out');
    }

    console.log('✅ Transcription completed:', transcript.text.length, 'characters');

    return res.status(200).json({
      text: transcript.text,
      duration: transcript.audio_duration,
      provider: 'AssemblyAI'
    });

  } catch (error) {
    console.error('🔥 Error in transcribe API:', error);
    return res.status(500).json({ 
      error: 'Failed to transcribe audio',
      message: error.message 
    });
  }
}
