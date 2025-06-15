
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the webhook signature from headers
    const signature = req.headers['paddle-signature'];
    const rawBody = JSON.stringify(req.body);

    // Log the incoming webhook for debugging
    console.log('Paddle webhook received:', {
      eventType: req.body.event_type,
      timestamp: new Date().toISOString(),
      signature: signature ? 'present' : 'missing'
    });

    const { event_type, data } = req.body;

    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
      
      case 'transaction.completed':
        await handlePaymentSucceeded(data);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data);
        break;
      
      case 'subscription.paused':
        await handleSubscriptionPaused(data);
        break;
      
      case 'subscription.resumed':
        await handleSubscriptionResumed(data);
        break;
      
      default:
        console.log('Unhandled webhook event:', event_type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error.message 
    });
  }
}

async function handleSubscriptionCreated(data) {
  try {
    console.log('Subscription Created:', {
      subscriptionId: data.id,
      customerId: data.customer_id,
      status: data.status,
      priceId: data.items?.[0]?.price?.id,
      customerEmail: data.customer?.email
    });

    const customerEmail = data.customer?.email;
    const customData = data.custom_data || {};
    const userId = customData.userId;
    const planName = customData.planName;

    // Here you would typically update your database
    // For now, we'll just log the important information
    console.log('User subscription activated:', {
      userId,
      email: customerEmail,
      plan: planName,
      subscriptionId: data.id,
      status: 'active',
      startDate: data.current_billing_period?.starts_at,
      nextBilling: data.current_billing_period?.ends_at
    });

    // TODO: Update user in your database with subscription details
    // await updateUserSubscription({
    //   userId,
    //   email: customerEmail,
    //   subscriptionId: data.id,
    //   status: 'active',
    //   plan: planName,
    //   startDate: data.current_billing_period?.starts_at,
    //   nextBilling: data.current_billing_period?.ends_at
    // });

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(data) {
  try {
    console.log('Subscription Updated:', {
      subscriptionId: data.id,
      status: data.status,
      customerEmail: data.customer?.email
    });

    // TODO: Update subscription in your database
    
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handlePaymentSucceeded(data) {
  try {
    console.log('Payment Succeeded:', {
      transactionId: data.id,
      customerId: data.customer_id,
      amount: data.details?.totals?.grand_total?.amount,
      currency: data.details?.totals?.grand_total?.currency_code,
      customerEmail: data.customer?.email,
      subscriptionId: data.subscription_id
    });

    // TODO: Handle successful payment (e.g., send confirmation email)
    
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handleSubscriptionCanceled(data) {
  try {
    console.log('Subscription Canceled:', {
      subscriptionId: data.id,
      customerEmail: data.customer?.email,
      canceledAt: data.canceled_at
    });

    // TODO: Update subscription status to canceled in your database
    
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
}

async function handleSubscriptionPaused(data) {
  try {
    console.log('Subscription Paused:', {
      subscriptionId: data.id,
      customerEmail: data.customer?.email
    });

    // TODO: Handle subscription pause
    
  } catch (error) {
    console.error('Error handling subscription paused:', error);
  }
}

async function handleSubscriptionResumed(data) {
  try {
    console.log('Subscription Resumed:', {
      subscriptionId: data.id,
      customerEmail: data.customer?.email
    });

    // TODO: Handle subscription resume
    
  } catch (error) {
    console.error('Error handling subscription resumed:', error);
  }
}
