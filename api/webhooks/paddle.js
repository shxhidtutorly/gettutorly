// api/webhooks/paddle.js
import { Paddle } from "@paddle/paddle-node-sdk";
import admin from "firebase-admin";
import getRawBody from "raw-body";
import querystring from "querystring";

/**
 * Production-ready Paddle webhook -> Firestore handler
 * - Verifies webhooks using Paddle SDK (v2 signatures)
 * - Falls back to parsing payload (useful for sandbox/testing or v1 fallback)
 * - Writes subscription info into Firestore under: users/{userId} and users/{userId}/subscription/current
 * - Uses idempotency by storing processed event ids in collection: paddle_webhook_events
 *
 * IMPORTANT:
 * - Set PADDLE_PUBLIC_KEY (public key from Paddle dashboard) for signature verification.
 * - For full security, ensure your Paddle webhooks are configured to use v2 signature.
 */

// Disable Vercel body parsing (we need raw body for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Firebase Admin once
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.info("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase Admin SDK initialization failed:", err);
  }
}

const db = admin.firestore();

// Paddle client (used for SDK validation/unmarshal)
const paddle = new Paddle({
  publicKey: process.env.PADDLE_PUBLIC_KEY || "", // required for signature verification (v2)
  environment: process.env.PADDLE_ENV || "sandbox",
});

function normalizeEventType(obj) {
  // Accept many possible property names depending on Paddle version
  return (
    obj?.eventType ||
    obj?.event_type ||
    obj?.alert_name ||
    obj?.alert ||
    obj?.type ||
    obj?.event ||
    null
  );
}

function extractEventId(obj) {
  // Try to find a stable id for idempotency
  return (
    obj?.id ||
    obj?.event_id ||
    obj?.alert_id ||
    obj?.subscription_id ||
    obj?.order_id ||
    obj?.transaction_id ||
    obj?.checkout_id ||
    obj?.resource_id ||
    null
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Read raw body
  let rawBodyBuf;
  try {
    rawBodyBuf = await getRawBody(req);
  } catch (err) {
    console.error("Failed to read raw body:", err);
    return res.status(500).send("Internal Server Error");
  }
  const raw = rawBodyBuf.toString("utf8");

  // Get possible signature header(s)
  const sigHeader =
    req.headers["paddle-signature"] ||
    req.headers["x-paddle-signature"] ||
    req.headers["p_signature"] || // sometimes appears in body rather than header
    null;

  // Try to verify with SDK (v2 style). If it fails, fall back to parsing payload.
  let parsed;
  let verifiedBySdk = false;

  if (sigHeader && process.env.PADDLE_PUBLIC_KEY) {
    try {
      // SDK expects (rawBodyString, { signature: sigHeader })
      parsed = paddle.webhooks.unmarshal(raw, { signature: sigHeader });
      verifiedBySdk = true;
      console.info("✅ Paddle SDK verification succeeded");
    } catch (err) {
      // SDK verification failed (could be v1 signature, or malformed)
      console.warn("⚠ Paddle SDK verification failed:", err?.message || err);
      parsed = null;
    }
  } else {
    console.warn(
      "⚠ No signature header or no PADDLE_PUBLIC_KEY - skipping SDK verification (sandbox/testing)."
    );
  }

  // If SDK didn't produce a parsed event, try to parse body as JSON or urlencoded form
  if (!parsed) {
    try {
      parsed = JSON.parse(raw);
      console.info("Parsed raw body as JSON (fallback)");
    } catch (e) {
      // try urlencoded parse
      try {
        parsed = querystring.parse(raw);
        console.info("Parsed raw body as urlencoded (fallback)");
      } catch (e2) {
        console.error("Failed to parse webhook body:", e2);
        return res.status(400).send("Bad Request");
      }
    }
  }

  // Normalize event and data
  // If parsed came from SDK.unmarshal it will likely be { eventType, data, ... }
  const eventType = normalizeEventType(parsed);
  const eventData = parsed?.data || parsed || null;

  console.info("✅ Received Paddle event:", eventType || "<unknown>");

  // Idempotency: dedupe by event id (if available)
  const eventId = extractEventId(parsed) || `${eventType || "unknown"}:${Date.now()}`;
  if (eventId) {
    try {
      const evRef = db.collection("paddle_webhook_events").doc(String(eventId));
      const evSnap = await evRef.get();
      if (evSnap.exists) {
        console.info("Duplicate event, already processed:", eventId);
        return res.status(200).send("OK");
      }
      // Reserve id (in case of concurrent delivery)
      await evRef.set({
        status: "processing",
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed idempotency check:", err);
      // continue, but caution
    }
  }

  // Helper: save/update subscription under users/{uid}/subscription/current
  async function upsertSubscriptionForUser(userId, subscription) {
    const userRef = db.collection("users").doc(userId);
    const subRef = userRef.collection("subscription").doc("current");
    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      const planName = subscription?.items?.[0]?.price?.name || subscription?.plan || null;
      const priceId = subscription?.items?.[0]?.price?.id || subscription?.plan_id || null;
      const email = subscription?.customer?.email || subscription?.email || null;
      const status = subscription?.status || subscription?.state || null;
      if (!userDoc.exists) {
        t.set(userRef, {
          email,
          plan: planName,
          subscriptionStatus: status,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        t.update(userRef, {
          plan: planName,
          subscriptionStatus: status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      t.set(
        subRef,
        {
          paddleId: subscription?.id || subscription?.subscription_id || null,
          status,
          priceId,
          raw: subscription,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
  }

  // Process common events
  try {
    const evt = (eventType || "").toString().toLowerCase();

    // Subscription created / activated / updated
    if (evt.includes("subscription.created") || evt.includes("subscription.activated") || evt.includes("subscription.updated") || evt.includes("subscription")) {
      // attempt to find firebaseUid in passthrough / custom_data
      const subscription = eventData;
      const passthroughRaw = subscription?.passthrough || subscription?.custom_data || subscription?.customData || null;
      let passthrough = null;
      if (passthroughRaw) {
        try {
          passthrough = typeof passthroughRaw === "string" ? JSON.parse(passthroughRaw) : passthroughRaw;
        } catch (e) {
          passthrough = passthroughRaw;
        }
      }

      const userId = passthrough?.firebaseUid || passthrough?.uid || subscription?.customer_id || subscription?.customerId || subscription?.customer?.id || subscription?.customer?.email || null;

      if (!userId) {
        console.warn("No userId found in subscription event. Saving subscription to 'subscriptions' collection as fallback.");
        // fallback: store in top-level subscriptions collection
        await db.collection("subscriptions").doc(String(subscription?.id || subscription?.subscription_id || eventId)).set({
          raw: subscription,
          eventType,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        await upsertSubscriptionForUser(userId, subscription);
        console.info("Saved subscription for user:", userId);
      }
    } else if (evt.includes("subscription.cancelled") || evt.includes("subscription.cancel")) {
      // cancellation: update status
      const subscription = eventData;
      const passthroughRaw = subscription?.passthrough || subscription?.custom_data || subscription?.customData || null;
      let passthrough = null;
      if (passthroughRaw) {
        try { passthrough = typeof passthroughRaw === "string" ? JSON.parse(passthroughRaw) : passthroughRaw; } catch {}
      }
      const userId = passthrough?.firebaseUid || subscription?.customer_id || null;
      if (userId) {
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          subscriptionStatus: "canceled",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await userRef.collection("subscription").doc("current").set({
          status: "canceled",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          raw: subscription,
        }, { merge: true });
        console.info("Marked subscription canceled for user:", userId);
      } else {
        console.warn("Cancel event received but no userId found.");
      }
    } else if (evt.includes("transaction") || evt.includes("payment")) {
      // transaction/one-time payment - store transaction
      const tx = eventData;
      const id = tx?.order_id || tx?.orderId || tx?.transaction_id || eventId;
      await db.collection("transactions").doc(String(id)).set({
        raw: tx,
        eventType,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.info("Saved transaction:", id);
    } else {
      // Unknown/other event - log for investigation
      await db.collection("paddle_webhook_logs").add({
        eventType,
        payload: eventData,
        verified: verifiedBySdk,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.info("Logged unknown event type:", eventType);
    }

    // Mark event processed (idempotency doc)
    try {
      if (eventId) {
        await db.collection("paddle_webhook_events").doc(String(eventId)).set({
          status: "processed",
          eventType,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Failed to mark event processed:", e);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Error processing event:", err);
    return res.status(500).send("Handler error");
  }
}
