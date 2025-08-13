// api/webhooks/paddle.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { signature, EventType } from '@paddle/paddle-node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

const db = admin.firestore();

const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

// Vercel config to enable raw body parsing for signature verification
export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
  },
};

export default async function paddleWebhook(req: VercelRequest, res: VercelResponse) {
  // Only process POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Retrieve the raw body and signature
  const rawBody = await getRawBody(req);
  const sig = req.headers['x-paddle-signature'] as string;

  if (!sig || !rawBody) {
    return res.status(400).send('Webhook signature missing or body is empty');
  }

  try {
    // signature.verify requires a string and the secret key
    const event = signature.verify(rawBody, webhookSecret, sig) as EventType;
    const { event_type, data } = event;

    console.log(`Received Paddle event: ${event_type}`, { event });

    // Handle subscription events
    if (event_type === 'subscription.activated' || event_type === 'subscription.created') {
      const subscription = data as any;
      const customData = subscription.custom_data;
      const userId = customData?.firebaseUid || subscription.customer_id;

      if (userId) {
        const userRef = db.collection('users').doc(userId);
        const subscriptionRef = userRef.collection('subscription').doc('current');

        await subscriptionRef.set({
          paddleId: subscription.id,
          status: subscription.status,
          priceId: subscription.items[0]?.price?.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log(`Subscription for user ${userId} updated to ${subscription.status}`);
      }
    }

    // You can add more logic here for other events like `subscription.canceled`

    return res.status(200).send('Webhook received and processed.');

  } catch (err) {
    console.error('Webhook verification failed', err);
    return res.status(400).send('Invalid signature');
  }
}

// Helper function to get the raw body from the request stream
async function getRawBody(req: VercelRequest): Promise<string | Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
