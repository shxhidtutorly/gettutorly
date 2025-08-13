// api/webhooks/paddle.js
import { Paddle } from '@paddle/paddle-node-sdk';
import admin from 'firebase-admin';
import getRawBody from 'raw-body';

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

// Create Paddle client
const paddle = new Paddle({
  publicKey: webhookSecret, // For webhooks, this is the *public key*, not the API key
  environment: 'production', // or 'sandbox'
});

// Disable default body parser (needed for raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function paddleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Get raw body for signature verification
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error('Failed to get raw body:', err);
    return res.status(500).send('Internal Server Error');
  }

  const sig = req.headers['paddle-signature'];
  if (!sig) {
    return res.status(400).send('Webhook signature missing');
  }

  try {
    const event = paddle.webhooks.unmarshal(rawBody, sig);
    const { eventType, data } = event;

    console.log(`✅ Received Paddle event: ${eventType}`, event);

    if (eventType === 'subscription.activated' || eventType === 'subscription.created') {
      const subscription = data;
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

    return res.status(200).send('Webhook received and processed.');

  } catch (err) {
    console.error('❌ Webhook verification failed', err);
    return res.status(400).send('Invalid signature');
  }
}
