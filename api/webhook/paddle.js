
import { Paddle } from '@paddle/paddle-node-sdk';
import { supabase } from '../../src/integrations/supabase/client.js';

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['paddle-signature'];

    // Verify webhook signature
    const isValid = await paddle.webhooks.verify({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.error('Invalid Paddle webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event_type, data } = req.body;
    console.log('Paddle webhook received:', event_type);

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
        console.log('Unhandled webhook event:', event_type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSubscriptionEvent(data) {
  try {
    const customerEmail = data.customer?.email;
    const planName = data.items?.[0]?.price?.product?.name || 'Unknown Plan';
    const customData = data.custom_data || {};
    const userId = customData.user_id || customerEmail;

    if (!customerEmail) {
      console.error('No customer email in subscription event');
      return;
    }

    // Update user subscription in Supabase
    const { error } = await supabase
      .from('users')
      .upsert({
        clerk_user_id: userId,
        email: customerEmail,
        subscription_status: 'active',
        subscription_plan: planName,
        subscription_id: data.id,
        subscription_start_date: data.current_billing_period?.starts_at,
        subscription_end_date: data.current_billing_period?.ends_at,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_user_id'
      });

    if (error) {
      console.error('Supabase update error:', error);
    } else {
      console.log('Subscription updated for user:', customerEmail);
    }
  } catch (error) {
    console.error('Error handling subscription event:', error);
  }
}

async function handleTransactionCompleted(data) {
  try {
    const customerEmail = data.customer?.email;
    const customData = data.custom_data || {};
    const userId = customData.user_id || customerEmail;

    if (data.subscription_id) {
      // This is a subscription payment - already handled by subscription events
      return;
    }

    // Handle one-time payments if needed
    console.log('One-time payment completed for:', customerEmail);
  } catch (error) {
    console.error('Error handling transaction completed:', error);
  }
}

async function handleSubscriptionCanceled(data) {
  try {
    const customerEmail = data.customer?.email;
    const customData = data.custom_data || {};
    const userId = customData.user_id || customerEmail;

    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId);

    if (error) {
      console.error('Supabase cancellation update error:', error);
    } else {
      console.log('Subscription canceled for user:', customerEmail);
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
}
