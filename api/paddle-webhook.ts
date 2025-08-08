import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Paddle } from '@paddle/paddle-node-sdk';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

// Paddle client (for optional signature verification)
const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY || '',
  environment: process.env.VITE_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body as any;

    // Idempotency guard
    const eventId = event?.data?.id || event?.id || event?.alert_id || `${Date.now()}-${Math.random()}`;
    const existing = await db.collection('paddle_events').doc(String(eventId)).get();
    if (existing.exists) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    // Attempt verification (best-effort)
    try {
      // Depending on SDK/webhook version, verification differs; keep best-effort logging
      // const verified = await paddle.webhooks.verify(event, req.headers as any);
      // if (!verified) console.warn('[Paddle] Webhook verification failed');
    } catch (e) {
      console.warn('[Paddle] Verification error', e);
    }

    const type = event?.event_type || event?.alert_name || 'unknown';
    const data = event?.data || event || {};

    const custom = data?.custom_data || data?.customData || {};
    const firebaseUid = custom?.firebaseUid || custom?.uid || null;
    const email = custom?.email || data?.customer?.email || null;
    const plan = custom?.plan || data?.items?.[0]?.price?.id || data?.subscription?.items?.[0]?.price?.id || null;

    const statusActiveEvents = new Set([
      'subscription.created',
      'subscription.updated',
      'transaction.completed',
      'checkout.completed',
      'payment_succeeded',
    ]);

    const isActive = statusActiveEvents.has(String(type));

    // Write raw event for audit
    await db.collection('paddle_events').doc(String(eventId)).set({
      type,
      received_at: new Date().toISOString(),
      data: event,
    });

    if (!firebaseUid && !email) {
      console.warn('[Paddle] Missing identifiers in webhook');
      return res.status(200).json({ ok: true, warning: 'missing-identifiers' });
    }

    // Build subscription payload
    const subPayload: Record<string, any> = {
      plan,
      email,
      is_manual: false,
      status: isActive ? 'active' : 'inactive',
      updated_at: new Date().toISOString(),
      paddle_event_type: type,
      paddle_checkout_id: data?.id || data?.checkout_id || null,
      paddle_subscription_id: data?.subscription_id || data?.id || null,
      raw_event_id: String(eventId),
    };

    if (firebaseUid) {
      await db.collection('users').doc(firebaseUid).collection('subscription').doc('current').set(subPayload, { merge: true });
      return res.status(200).json({ ok: true, uid: firebaseUid });
    }

    // Fallback: store by email if no uid
    await db.collection('manualSubscriptions').doc(String(email)).set({
      ...subPayload,
      matched: false,
    }, { merge: true });

    return res.status(200).json({ ok: true, email });
  } catch (error: any) {
    console.error('[Paddle] Webhook error', error);
    return res.status(200).json({ ok: true }); // Always 200 to avoid retries storm
  }
}
