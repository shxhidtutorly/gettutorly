const { signature } = require('@paddle/paddle-node');
const admin = require('firebase-admin');
const getRawBody = require('raw-body');

// The main handler function, which contains all the webhook logic.
const paddleWebhook = async (req, res) => {
  // Initialize Firebase Admin SDK if it hasn't been already.
  // This must be inside the function to work reliably in a serverless environment.
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

  // Only process POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const db = admin.firestore();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  // Get raw body for signature verification.
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error('Failed to get raw body:', err);
    return res.status(500).send('Internal Server Error');
  }
  
  const sig = req.headers['x-paddle-signature'];
  if (!sig) {
    return res.status(400).send('Webhook signature missing');
  }

  try {
    const event = signature.verify(rawBody, webhookSecret, sig);
    const { event_type, data } = event;

    console.log(`Received Paddle event: ${event_type}`, { event });

    if (event_type === 'subscription.activated' || event_type === 'subscription.created') {
      const subscription = data;
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

    return res.status(200).send('Webhook received and processed.');

  } catch (err) {
    console.error('Webhook verification failed', err);
    return res.status(400).send('Invalid signature');
  }
};

// Export the function using CommonJS syntax
module.exports = paddleWebhook;
