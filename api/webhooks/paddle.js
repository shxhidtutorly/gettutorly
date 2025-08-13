// api/webhooks/paddle.js
import { Paddle } from '@paddle/paddle-node-sdk';
import admin from 'firebase-admin';
import getRawBody from 'raw-body';

// Firebase Admin Init
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization failed:", error);
  }
}

const db = admin.firestore();

// IMPORTANT: Use your Paddle **public key** from dashboard here
const paddle = new Paddle({
  publicKey: process.env.PADDLE_PUBLIC_KEY,
  environment: process.env.PADDLE_ENV || 'production', // 'sandbox' or 'production'
});

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 1. Get raw body
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error("❌ Failed to read raw body:", err);
    return res.status(500).send('Internal Server Error');
  }

  // 2. Get Paddle signature header
  const sigHeader = req.headers['paddle-signature'];
  if (!sigHeader) {
    console.error("❌ Missing Paddle signature header");
    return res.status(400).send('Webhook signature missing');
  }

  // 3. Verify & parse event
  let event;
  try {
    event = paddle.webhooks.unmarshal(rawBody.toString('utf8'), { signature: sigHeader });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return res.status(400).send('Invalid signature');
  }

  console.log(`✅ Received Paddle event: ${event.eventType}`, event);

  // 4. Process subscription events
  if (event.eventType === 'subscription.activated' || event.eventType === 'subscription.created') {
    const subscription = event.data;
    const customData = subscription.customData;
    const userId = customData?.firebaseUid || subscription.customerId;

    if (userId) {
      const userRef = db.collection('users').doc(userId);
      const subscriptionRef = userRef.collection('subscription').doc('current');

      await subscriptionRef.set({
        paddleId: subscription.id,
        status: subscription.status,
        priceId: subscription.items?.[0]?.price?.id || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`🔄 Subscription for user ${userId} updated to ${subscription.status}`);
    }
  }

  return res.status(200).send('Webhook processed successfully.');
}
