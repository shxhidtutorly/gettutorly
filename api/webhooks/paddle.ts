// api/webhooks/paddle.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { signature, EventType } from '@paddle/paddle-node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (if not already done)
// Use environment variables for security.
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You can add other configurations here if needed
  });
}

const db = admin.firestore();

// ⚠️ WARNING: Your webhook secret should be a Vercel Environment Variable.
const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

export default async function paddleWebhook(req: VercelRequest, res: VercelResponse) {
  // Only process POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Get raw body for signature verification
  const rawBody = req.body;

  // Verify the webhook signature
  const sig = req.headers['x-paddle-signature'] as string;
  if (!sig || !rawBody) {
    return res.status(400).send('Webhook signature missing or body is empty');
  }

  try {
    const event = signature.verify(rawBody, webhookSecret, sig) as EventType;
    const { event_type, data } = event;

    console.log(`Received Paddle event: ${event_type}`, { event });

    // Handle the subscription activation event
    if (event_type === 'subscription.activated' || event_type === 'subscription.created') {
      const subscription = data as any;
      const customData = subscription.custom_data;
      const userId = customData?.firebaseUid || subscription.customer_id; // Use your user ID field

      if (userId) {
        const userRef = db.collection('users').doc(userId);
        const subscriptionRef = userRef.collection('subscription').doc('current');

        await subscriptionRef.set({
          paddleId: subscription.id,
          status: subscription.status,
          priceId: subscription.items[0]?.price?.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Add other relevant info like renewal date
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
