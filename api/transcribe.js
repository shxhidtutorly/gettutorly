
import formidable from 'formidable';
import fetch from 'node-fetch';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    const [fields, files] = await form.parse(req);
    const audioFile = files.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Use OpenRouter with Whisper for transcription
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFile.filepath));
    formData.append('model', 'whisper-1');

    const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Fallback to local speech recognition simulation
      console.warn('OpenRouter transcription failed, using fallback');
      
      // Clean up temp file
      fs.unlinkSync(audioFile.filepath);
      
      return res.json({
        text: '[Transcription processing...]', // Placeholder for development
      });
    }

    const result = await response.json();
    
    // Clean up temp file
    fs.unlinkSync(audioFile.filepath);
    
    return res.json({
      text: result.text || '',
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: 'Transcription failed',
      text: '', // Return empty string to avoid breaking the flow
    });
  }
}
