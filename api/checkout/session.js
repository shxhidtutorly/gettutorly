// api/checkout/session.js
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

/**
 * Required env vars:
 * - PADDLE_API_KEY (or PADDLE_SECRET_KEY) -> your Paddle secret API key (sandbox or live)
 * - VITE_PUBLIC_SITE_URL or NEXT_PUBLIC_SITE_URL or BASE_URL -> your public site domain (approved in Paddle)
 * - PADDLE_ENV or VITE_PADDLE_ENV or NEXT_PUBLIC_PADDLE_ENV -> "sandbox" or "production" (optional; defaults to sandbox)
 */

const API_KEY = process.env.PADDLE_API_KEY || process.env.PADDLE_SECRET_KEY;
const SITE_URL =
  process.env.VITE_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BASE_URL ||
  "https://localhost:3000";
const PADDLE_ENV =
  process.env.PADDLE_ENV || process.env.VITE_PADDLE_ENV || process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";

if (!API_KEY) {
  // Throw now so Vercel build logs show the missing key (safer than failing later)
  // Note: in production you might prefer a softer failure or feature-flag.
  console.error("Missing Paddle API key (set PADDLE_API_KEY or PADDLE_SECRET_KEY)");
}

const paddle = new Paddle(API_KEY || "", {
  environment: PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
});

/**
 * POST body expected:
 * {
 *   email: "buyer@example.com",      // optional for automatic checkout, but helpful
 *   price_id: "pri_....",            // required
 *   user_id: "your-uid"              // optional, saved in custom_data
 * }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, price_id: priceId, user_id } = req.body ?? {};

    if (!priceId) {
      return res.status(400).json({ error: "Missing required field: price_id" });
    }

    // Build the transaction payload. We request automatic collection (checkout)
    // and pass the approved site URL so Paddle will return a checkout URL on that domain.
    const txPayload = {
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic", // automatic -> checkout (self-serve)
      // ask Paddle to build a checkout link for our approved domain:
      checkout: { url: SITE_URL },
      // optional: attach your own custom data to find user later in webhooks
      custom_data: user_id ? { firebaseUid: user_id } : undefined,
    };

    // If you want to supply a prefill email to speed checkout, use customer creation flow:
    // But for now we rely on the default checkout which will prefill if client passes email via Paddle.js.
    const transaction = await paddle.transactions.create(txPayload);

    // transaction.checkout may be null in some rare cases, so guard it
    const checkoutUrl = transaction?.checkout?.url;

    if (!checkoutUrl) {
      // In case Paddle didn't return checkout.url, we can at least return the transaction id.
      // Clients can open checkout using Paddle.Checkout.open({ transaction: transaction.id })
      return res.status(200).json({
        message: "Transaction created, but no checkout URL returned.",
        transaction_id: transaction?.id,
        transaction,
      });
    }

    return res.status(200).json({
      checkout_url: checkoutUrl,
      transaction_id: transaction.id,
    });
  } catch (err) {
    console.error("Paddle checkout error:", err);
    // Ensure we return JSON (your front-end is JSON.parse-ing the response)
    return res.status(500).json({
      error: "Failed to create checkout session",
      details: err?.message ?? String(err),
    });
  }
}
