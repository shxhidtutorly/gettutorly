// api/uploadthing-upload.js
// This endpoint uploads a file to UploadThing using your API key from Vercel env vars

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadthingApiKey = process.env.UPLOADTHING_API_KEY;
  if (!uploadthingApiKey) {
    return res.status(500).json({ error: 'UploadThing API key not configured' });
  }

  try {
    // Expecting a file URL in the body (adjust as needed for your frontend)
    const { audioUrl } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }

    // Download file from audioUrl
    const fileResponse = await fetch(audioUrl);
    if (!fileResponse.ok) throw new Error('Could not fetch the audio file.');
    const fileBuffer = await fileResponse.arrayBuffer();

    // Upload to UploadThing
    const response = await fetch('https://uploadthing.com/api/uploadFiles', {
      method: 'POST',
      headers: {
        'Authorization': uploadthingApiKey,
        // Adjust Content-Type if UploadThing requires something specific
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer
    });

    if (!response.ok) {
      throw new Error('Failed to upload to UploadThing');
    }

    const data = await response.json();
    return res.status(200).json({ uploadthingResult: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
