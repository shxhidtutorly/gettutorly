// api/webhooks/paddle.js
import { Paddle } from "@paddle/paddle-node-sdk";
import admin from "firebase-admin";
import getRawBody from "raw-body";
import querystring from "querystring";



// Disable automatic body parsing so we can validate signature
export const config = { api: { bodyParser: false } };

// ---------- Firebase init ----------
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
    // If initialization fails, we still export handler but firestore ops will error.
  }
}
const db = admin.firestore();

// ---------- Paddle SDK init ----------
const paddle = new Paddle({
  publicKey: process.env.PADDLE_PUBLIC_KEY || "", // required for v2 verification
  environment: process.env.PADDLE_ENV || "production",
});

// ---------- Small helpers ----------
const toPlain = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj ?? {}));
  } catch {
    return {};
  }
};
const normalizeEventType = (o) =>
  o?.eventType || o?.event_type || o?.alert_name || o?.alert || o?.type || o?.event || null;
const extractEventId = (o) =>
  o?.id || o?.event_id || o?.alert_id || o?.subscription_id || o?.order_id || o?.transaction_id || o?.checkout_id || null;

// ---------- Handler ----------
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // 1) Read raw body (needed for signature verification)
  let raw;
  try {
    raw = (await getRawBody(req)).toString("utf8");
  } catch (err) {
    console.error("Failed to read raw body:", err);
    return res.status(500).send("Failed to read body");
  }

  // 2) Obtain signature header (Paddle uses lowercase headers on many platforms)
  const sigHeader = (req.headers["paddle-signature"] || req.headers["x-paddle-signature"] || null);

  // 3) Try v2 SDK verification only when we have a plausible header and public key
  let parsed = null;
  let verifiedBySdk = false;
  if (sigHeader && typeof sigHeader === "string" && sigHeader.includes("=") && process.env.PADDLE_PUBLIC_KEY) {
    try {
      // SDK accepts (rawString, { signature: headerString })
      parsed = paddle.webhooks.unmarshal(raw, { signature: sigHeader });
      verifiedBySdk = true;
      console.info("✅ Paddle SDK v2 verification succeeded");
    } catch (err) {
      // Verification failed — log & fall back to parsing
      console.warn("⚠ Paddle SDK v2 verification failed (falling back).", err?.message || err);
      parsed = null;
    }
  } else {
    console.warn("⚠ No valid v2 signature header or missing PADDLE_PUBLIC_KEY — skipping SDK verification.");
  }

  // 4) If SDK didn't parse the payload, fall back to JSON or urlencoded parsing
  if (!parsed) {
    try {
      parsed = JSON.parse(raw);
      console.info("Parsed raw body as JSON (fallback)");
    } catch {
      try {
        parsed = querystring.parse(raw);
        console.info("Parsed raw body as urlencoded (fallback)");
      } catch (err) {
        console.error("Failed to parse webhook body:", err);
        return res.status(400).send("Bad Request");
      }
    }
  }

  // 5) Normalize event and data
  const eventType = normalizeEventType(parsed) || "unknown";
  const eventData = parsed?.data || parsed || null;
  console.info("✅ Received Paddle event:", eventType);

  // 6) Idempotency - derive an eventId (best-effort)
  const eventId = extractEventId(parsed) || `${eventType}:${Date.now()}`;
  if (eventId) {
    try {
      const evRef = db.collection("paddle_webhook_events").doc(String(eventId));
      const evSnap = await evRef.get();
      if (evSnap.exists) {
        console.info("Duplicate event — already processed:", eventId);
        return res.status(200).send("Duplicate");
      }
      // Reserve the id (reduce race)
      await evRef.set({ status: "processing", receivedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (err) {
      console.warn("Idempotency reservation failed, continuing:", err);
    }
  }

  // Helper: upsert subscription to users/{userId}/subscription/current
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

  // 7) Process events: subscription, cancel, transaction, other
  try {
    const evt = eventType.toLowerCase();

    // SUBSCRIPTION events
    if (evt.includes("subscription")) {
      const subscription = eventData || {};
      // passthrough / custom_data could be stringified
      const passthroughRaw = subscription?.passthrough || subscription?.custom_data || subscription?.customData || null;
      let passthrough = null;
      if (passthroughRaw) {
        try {
          passthrough = typeof passthroughRaw === "string" ? JSON.parse(passthroughRaw) : passthroughRaw;
        } catch {
          passthrough = passthroughRaw;
        }
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
        // fallback - save subscription under top-level collection for manual resolution
        await db.collection("subscriptions").doc(String(subscription?.id || eventId)).set({
          raw: toPlain(subscription),
          eventType,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.info("Saved subscription to fallback collection (no userId)");
      } else {
        await upsertSubscriptionForUser(userId, subscription);
        console.info("Saved subscription for user:", userId);
      }
    }

    // CANCELLATION
    else if (evt.includes("cancel")) {
      const subscription = eventData || {};
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
          raw: toPlain(subscription),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.info("Marked subscription canceled for user:", userId);
      } else {
        console.warn("Cancel event received but no userId found; saved to logs");
        await db.collection("paddle_webhook_logs").add({
          eventType,
          payload: toPlain(eventData),
          verified: verifiedBySdk,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // TRANSACTIONS / PAYMENTS
    else if (evt.includes("transaction") || evt.includes("payment")) {
      const tx = eventData || {};
      const id = tx?.order_id || tx?.orderId || tx?.transaction_id || eventId;
      await db.collection("transactions").doc(String(id)).set({
        raw: toPlain(tx),
        eventType,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.info("Saved transaction:", id);
    }

    // OTHER / UNKNOWN
    else {
      await db.collection("paddle_webhook_logs").add({
        eventType,
        payload: toPlain(eventData),
        verified: verifiedBySdk,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.info("Logged unknown event type:", eventType);
    }

    // 8) Mark event processed (idempotency)
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
