import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extracts video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Calls AI API to generate summary
 * @param {string} transcript - Full transcript text
 * @returns {Promise<string>} - AI generated summary
 */
async function generateSummary(transcript) {
  const userPrompt = `You are a study assistant. Provide a student-friendly summary in bullet points from this transcript:\n${transcript}`;
  
  try {
    const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: userPrompt, 
        model: 'groq' 
      })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI API Error:', error);
    throw new Error('Failed to generate summary from AI service');
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL format' });
    }

    console.log(`Processing video ID: ${videoId}`);

    let transcriptData;
    try {
      transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (transcriptError) {
      console.error('Transcript fetch error:', transcriptError);
      return res.status(404).json({ 
        error: '⚠️ Transcript not available for this video. Try a different one.' 
      });
    }

    if (!transcriptData || transcriptData.length === 0) {
      return res.status(404).json({ 
        error: '⚠️ Transcript not available for this video. Try a different one.' 
      });
    }

    const fullTranscript = transcriptData
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!fullTranscript) {
      return res.status(404).json({ 
        error: '⚠️ Transcript not available for this video. Try a different one.' 
      });
    }

    console.log(`Transcript length: ${fullTranscript.length} characters`);

    let summary;
    try {
      summary = await generateSummary(fullTranscript);
    } catch (aiError) {
      console.error('AI Summary Error:', aiError);
      return res.status(200).json({
        transcript: fullTranscript,
        summary: 'Summary generation failed, but transcript is available above.',
        warning: 'Could not generate AI summary'
      });
    }

    res.status(200).json({
      summary,
      transcript: fullTranscript,
      videoId
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error occurred while processing the request' 
    });
  }
}
