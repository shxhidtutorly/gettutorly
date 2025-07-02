// api/uploadthing-upload.js

export const config = {
  api: {
    bodyParser: false, // Important for file uploads!
    sizeLimit: "20mb", // Increase as needed
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadthingApiKey = process.env.UPLOADTHING_API_KEY;
  if (!uploadthingApiKey) {
    return res.status(500).json({ error: "UploadThing API key not configured" });
  }

  try {
    const busboy = require("busboy");
    const bb = busboy({ headers: req.headers });
    let fileBuffer = Buffer.alloc(0);
    let fileName = "";
    let mimeType = "";

    bb.on("file", (fieldname, file, info) => {
      fileName = info.filename;
      mimeType = info.mimeType;
      file.on("data", (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });

    bb.on("finish", async () => {
      // Upload to UploadThing
      try {
        const response = await fetch("https://uploadthing.com/api/uploadFiles", {
          method: "POST",
          headers: {
            Authorization: uploadthingApiKey,
            "Content-Type": "application/octet-stream",
            "X-Filename": fileName,
            "X-MimeType": mimeType,
          },
          body: fileBuffer,
        });

        if (!response.ok) {
          const errText = await response.text();
          return res.status(500).json({ error: "Failed to upload to UploadThing", details: errText });
        }

        const data = await response.json();
        // Use the correct key based on UploadThing's response
        return res.status(200).json({ url: data.fileUrl || data.url });
      } catch (e) {
        return res.status(500).json({ error: "UploadThing upload failed", details: e.message });
      }
    });

    req.pipe(bb);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
