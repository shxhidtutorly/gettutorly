// api/webhooks/paddle.js
import { Paddle } from "@paddle/paddle-node-sdk";
import admin from "firebase-admin";
import getRawBody from "raw-body";
import querystring from "querystring";

// Disable body parsing (needed for Paddle v2 signature verification)
export const config = {
  api: { bodyParser: false },
};

// --- Initialize Firebase Admin ---
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

// --- Initialize Paddle SDK ---
const paddle = new Paddle({
  publicKey: process.env.PADDLE_PUBLIC_KEY || "",
  environment: process.env.PADDLE_ENV || "production", // "production" or "sandbox"
});

// --- Helpers ---
function normalizeEventType(obj) {
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

function toPlain(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

// --- Main Handler ---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Get raw request body
  let raw;
  try {
    raw = (await getRawBody(req)).toString("utf8");
  } catch (err) {
    console.error("❌ Failed to read raw body:", err);
    return res.status(500).send("Internal Server Error");
  }

  // Get v2 signature header
  const sigHeader =
    req.headers["paddle-signature"] ||
    req.headers["x-paddle-signature"] ||
    null;

  let parsed = null;
  let verifiedBySdk = false;

  // Try Paddle v2 SDK verification
  if (sigHeader && typeof sigHeader === "string" && process.env.PADDLE_PUBLIC_KEY) {
    try {
      parsed = paddle.webhooks.unmarshal(raw, { signature: sigHeader });
      verifiedBySdk = true;
      console.info("✅ Paddle SDK v2 verification succeeded");
    } catch (err) {
      console.warn("⚠ Paddle SDK verification failed:", err?.message || err);
      parsed = null;
    }
  } else {
    console.warn("⚠ No valid v2 signature header — skipping SDK verification.");
  }

  // Fallback: parse as JSON or URL-encoded
  if (!parsed) {
    try {
      parsed = JSON.parse(raw);
      console.info("Parsed raw body as JSON (fallback)");
    } catch {
      try {
        parsed = querystring.parse(raw);
        console.info("Parsed raw body as urlencoded (fallback)");
      } catch (e2) {
        console.error("❌ Failed to parse webhook body:", e2);
        return res.status(400).send("Bad Request");
      }
    }
  }

  const eventType = normalizeEventType(parsed);
  const eventData = parsed?.data || parsed || null;
  console.info("✅ Received Paddle event:", eventType || "<unknown>");

  // Idempotency check
  const eventId = extractEventId(parsed) || `${eventType || "unknown"}:${Date.now()}`;
  if (eventId) {
    try {
      const evRef = db.collection("paddle_webhook_events").doc(String(eventId));
      const evSnap = await evRef.get();
      if (evSnap.exists) {
        console.info("Duplicate event, already processed:", eventId);
        return res.status(200).send("OK");
      }
      await evRef.set({
        status: "processing",
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("Idempotency check failed:", err);
    }
  }

  // Save/update subscription for user
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
          raw: toPlain(subscription),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
  }

  try {
    const evt = (eventType || "").toString().toLowerCase();

    if (evt.includes("subscription.created") || evt.includes("subscription.activated") || evt.includes("subscription.updated") || evt.includes("subscription")) {
      const subscription = eventData;
      const passthroughRaw = subscription?.passthrough || subscription?.custom_data || subscription?.customData || null;
      let passthrough = null;
      if (passthroughRaw) {
        try { passthrough = typeof passthroughRaw === "string" ? JSON.parse(passthroughRaw) : passthroughRaw; } catch {}
      }

      const userId =
        passthrough?.firebaseUid ||
        passthrough?.uid ||
        subscription?.customer_id ||
        subscription?.customerId ||
        subscription?.customer?.id ||
        subscription?.customer?.email ||
        null;

      if (!userId) {
        console.warn("No userId in subscription event. Saving to 'subscriptions' collection.");
        await db.collection("subscriptions").doc(String(subscription?.id || eventId)).set({
          raw: toPlain(subscription),
          eventType,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        await upsertSubscriptionForUser(userId, subscription);
        console.info("✅ Saved subscription for user:", userId);
      }
    }

    else if (evt.includes("subscription.cancelled") || evt.includes("subscription.cancel")) {
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
          raw: toPlain(subscription),
        }, { merge: true });
        console.info("✅ Canceled subscription for user:", userId);
      }
    }

    else if (evt.includes("transaction") || evt.includes("payment")) {
      const tx = eventData;
      const id = tx?.order_id || tx?.orderId || tx?.transaction_id || eventId;
      await db.collection("transactions").doc(String(id)).set({
        raw: toPlain(tx),
        eventType,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.info("✅ Saved transaction:", id);
    }

    else {
      await db.collection("paddle_webhook_logs").add({
        eventType,
        payload: toPlain(eventData),
        verified: verifiedBySdk,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.info("ℹ Logged unknown event:", eventType);
    }

    // Mark event processed
    if (eventId) {
      await db.collection("paddle_webhook_events").doc(String(eventId)).set({
        status: "processed",
        eventType,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error processing event:", err);
    return res.status(500).send("Handler error");
  }
}
