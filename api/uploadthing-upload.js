// api/uploadthing-upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadthingApiKey = process.env.UPLOADTHING_API_KEY;
  if (!uploadthingApiKey) {
    return res.status(500).json({ error: 'UploadThing API key not configured' });
  }

  try {
    // Parse FormData (multipart)
    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers });
    let fileBuffer = Buffer.alloc(0);
    let fileName = "";

    bb.on('file', (fieldname, file, info) => {
      fileName = info.filename;
      file.on('data', (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });

    bb.on('finish', async () => {
      // Upload to UploadThing
      const response = await fetch('https://uploadthing.com/api/uploadFiles', {
        method: 'POST',
        headers: {
          'Authorization': uploadthingApiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer
      });

      if (!response.ok) {
        throw new Error('Failed to upload to UploadThing');
      }

      const data = await response.json();
      // Adjust this to fit your actual API's response
      return res.status(200).json({ url: data.fileUrl || data.url });
    });

    req.pipe(bb);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
