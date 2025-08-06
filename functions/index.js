const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Paddle } = require('@paddle/paddle-node-sdk');

admin.initializeApp();
const db = admin.firestore();

const paddle = new Paddle({
  apiKey: functions.config().paddle.api_key,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

exports.handlePaddleWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['paddle-signature'];

    const isValid = await paddle.webhooks.verify({ rawBody, signature });

    if (!isValid) {
      console.error('❌ Invalid Paddle webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const { event_type, data } = req.body;
    console.log('✅ Paddle webhook received:', event_type);

    switch (event_type) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionEvent(data);
        break;
      case 'transaction.completed':
        await handleTransactionCompleted(data);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data);
        break;
      default:
        console.log('⚠️ Unhandled event type:', event_type);
    }

    return res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('🔥 Error in Paddle webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// 👉 Subscription Event Handler
async function handleSubscriptionEvent(data) {
  const email = data.customer?.email;
  const planName = data.items?.[0]?.price?.product?.name || 'Unknown Plan';
  const userId = data.custom_data?.user_id || email;

  if (!email) {
    console.error('Missing customer email');
    return;
  }

  const userRef = db.collection('users').doc(userId);
  await userRef.set({
    email,
    subscription_status: 'active',
    subscription_plan: planName,
    subscription_id: data.id,
    subscription_start: data.current_billing_period?.starts_at,
    subscription_end: data.current_billing_period?.ends_at,
    updated_at: new Date().toISOString()
  }, { merge: true });

  console.log(`✅ Updated subscription for: ${email}`);
}

// 👉 Transaction Completed Handler
async function handleTransactionCompleted(data) {
  const email = data.customer?.email;
  const userId = data.custom_data?.user_id || email;

  if (data.subscription_id) return; // skip — handled above

  console.log(`🎉 One-time payment completed for: ${email}`);

  const userRef = db.collection('users').doc(userId);
  await userRef.set({
    email,
    one_time_purchase: true,
    purchase_id: data.id,
    purchase_date: data.completed_at,
    updated_at: new Date().toISOString()
  }, { merge: true });
}

// 👉 Subscription Canceled Handler
async function handleSubscriptionCanceled(data) {
  const email = data.customer?.email;
  const userId = data.custom_data?.user_id || email;

  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    subscription_status: 'canceled',
    updated_at: new Date().toISOString()
  });

  console.log(`❌ Subscription canceled for: ${email}`);
}
