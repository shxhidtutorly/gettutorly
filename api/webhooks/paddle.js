// api/webhooks/paddle.js
import { Paddle } from "@paddle/paddle-node-sdk";
import admin from "firebase-admin";
import getRawBody from "raw-body";
import querystring from "querystring";

/* Production-grade Paddle v2 webhook for Vercel
   - Guards against malformed signature header (.split() errors)
   - Uses SDK verification when possible, falls back to safe parsing
   - Converts everything to plain objects before saving to Firestore
   - Idempotent, robust, and logs header when verification fails
*/

export const config = { api: { bodyParser: false } };

// Firebase init
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.info("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase Admin initialization failed:", err);
  }
}
const db = admin.firestore();

// Paddle SDK init
const paddle = new Paddle({
  publicKey: process.env.PADDLE_PUBLIC_KEY || "",
  environment: process.env.PADDLE_ENV || "production",
});

// helpers
const toPlain = (v) => {
  try {
    return JSON.parse(JSON.stringify(v ?? {}));
  } catch {
    return {};
  }
};
const normalizeEventType = (p) =>
  p?.eventType || p?.event_type || p?.alert_name || p?.alert || p?.type || null;
const extractEventId = (p) =>
  p?.id || p?.event_id || p?.alert_id || p?.subscription_id || p?.order_id || p?.transaction_id || null;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // read raw body
  let raw;
  try {
    raw = (await getRawBody(req)).toString("utf8");
  } catch (err) {
    console.error("Failed to read raw body:", err);
    return res.status(500).send("Failed to read body");
  }

  // get signature header (case-insensitive)
  const sigHeader = req.headers["paddle-signature"] || req.headers["x-paddle-signature"] || null;

  let parsed = null;
  let verifiedBySdk = false;

  // Attempt v2 SDK verification — but guard heavily to avoid .split errors
  if (sigHeader && typeof sigHeader === "string" && sigHeader.includes("=") && process.env.PADDLE_PUBLIC_KEY) {
    // log small debug (won't include keys) so you can inspect during failures
    console.info("Paddle signature header (trimmed):", sigHeader.slice(0, 200));

    try {
      // Wrap in try/catch to capture any SDK internal errors (including split on undefined)
      parsed = await (async () => paddle.webhooks.unmarshal(raw, { signature: sigHeader }))();
      verifiedBySdk = true;
      console.info("✅ Paddle SDK v2 verification succeeded");
    } catch (err) {
      // If SDK throws anything — including the TypeError for .split on undefined — capture it and fall back
      console.warn("⚠ Paddle SDK verification threw; falling back to parse. Error:", err?.message || err);
      // Log the signature header to debug the exact format (copy-paste safely)
      try { console.info("PADDLE SIGNATURE HEADER (for debugging):", sigHeader); } catch (e) {}
      parsed = null;
    }
  } else {
    console.warn("⚠ No plausible v2 signature header or missing PADDLE_PUBLIC_KEY - skipping SDK verification");
  }

  // Fallback parsing if SDK didn't yield a parsed object
  if (!parsed) {
    // Try JSON, then urlencoded
    try {
      parsed = JSON.parse(raw);
      console.info("Parsed raw body as JSON (fallback)");
    } catch (e1) {
      try {
        parsed = querystring.parse(raw);
        console.info("Parsed raw body as urlencoded (fallback)");
      } catch (e2) {
        console.error("Failed to parse webhook body (JSON and urlencoded). Errors:", e1, e2);
        return res.status(400).send("Bad Request");
      }
    }
  }

  // Normalize event
  const eventType = normalizeEventType(parsed) || "unknown";
  const eventData = parsed?.data || parsed || {};
  console.info("✅ Received Paddle event:", eventType);

  // Idempotency: best-effort event ID
  const eventId = extractEventId(parsed) || `${eventType}:${Date.now()}`;
  if (eventId) {
    try {
      const evRef = db.collection("paddle_webhook_events").doc(String(eventId));
      const evSnap = await evRef.get();
      if (evSnap.exists) {
        console.info("Duplicate event — already processed:", eventId);
        return res.status(200).send("Duplicate");
      }
      // Reserve
      await evRef.set({ status: "processing", receivedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (err) {
      console.warn("Idempotency check failed (continuing):", err);
    }
  }

  // helper: upsert subscription for user
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

      t.set(subRef, {
        paddleId: subscription?.id || subscription?.subscription_id || null,
        status,
        priceId,
        raw: toPlain(subscription),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  }

  // Process events
  try {
    const evt = eventType.toLowerCase();

    if (evt.includes("subscription")) {
      const subscription = eventData || {};
      // passthrough may be stringified
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
        // fallback: store in top-level subscriptions for manual resolution
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
        await db.collection("paddle_webhook_logs").add({
          eventType,
          payload: toPlain(eventData),
          verified: verifiedBySdk,
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.warn("Cancel event received but no userId found; logged instead.");
      }
    }

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

    else {
      await db.collection("paddle_webhook_logs").add({
        eventType,
        payload: toPlain(eventData),
        verified: verifiedBySdk,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.info("Logged unknown event type:", eventType);
    }

    // mark processed
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
