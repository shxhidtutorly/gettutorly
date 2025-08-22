import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { filename, filetype } = req.body;
  const key = `audionotes/${Date.now()}-${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: filetype,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Construct the public URL here on the server
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({ signedUrl, publicUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ message: 'Error generating upload URL', details: error.message });
  }
}
