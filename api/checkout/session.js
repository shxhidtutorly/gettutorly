// api/checkout/session.js
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

/**
 * REQUIRED ENV VARS (set these in Vercel):
 * - PADDLE_API_KEY        -> the server API key from Paddle (sandbox keys begin with sdbx_ after May 2025)
 * - PADDLE_ENV            -> "sandbox" or "production" (optional; defaults to sandbox)
 * - SITE_URL              -> your public site URL (e.g. https://gettutorly.com) accepted by Paddle
 */

const API_KEY = process.env.PADDLE_API_KEY || process.env.PADDLE_SECRET_KEY || "";
const PADDLE_ENV = (process.env.PADDLE_ENV || "sandbox").toLowerCase();
const SITE_URL = process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

const paddle = new Paddle(API_KEY, {
  environment: PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // quick guard for missing API key (helps surface env var issues)
  if (!API_KEY) {
    console.error("Missing Paddle API key. Set PADDLE_API_KEY in Vercel environment variables.");
    return res.status(500).json({
      error: "server_config",
      message: "Missing Paddle API key. Set PADDLE_API_KEY in your environment.",
    });
  }

  try {
    const { email, price_id: priceId, user_id } = req.body ?? {};

    if (!priceId) {
      return res.status(400).json({ error: "missing_field", message: "price_id is required" });
    }

    // payload to create a transaction that returns a checkout URL
    const txPayload = {
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic",
      checkout: { url: SITE_URL },
      custom_data: user_id ? { firebaseUid: user_id } : undefined,
    };

    const transaction = await paddle.transactions.create(txPayload);

    const checkoutUrl = transaction?.checkout?.url;
    if (!checkoutUrl) {
      // still return transaction id so client can attempt Paddle.Checkout.open({ transaction: ... })
      return res.status(200).json({
        message: "transaction_created_no_checkout_url",
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

    // More granular handling for Paddle API errors (forbidden / invalid token / other)
    const isApiError = err && err.type === "request_error";
    const code = err?.code || null;
    const details = err?.detail || err?.message || String(err);

    if (isApiError && code === "forbidden") {
      // actionable response for forbidden (403)
      return res.status(403).json({
        error: "forbidden",
        message: "Paddle API returned 403 Forbidden. The API key used does not have required permissions or is for the wrong environment.",
        detail: details,
        action: [
          "Check you are using the correct API key (sandbox vs live).",
          "In Paddle Dashboard -> Developer tools -> Authentication ensure the API key has WRITE permissions for `transactions` and `customers`.",
          "Ensure your Paddle account has Checkout enabled and your domain is approved in Checkout settings."
        ]
      });
    }

    // generic fallback
    return res.status(500).json({
      error: "paddle_error",
      message: "Failed to create checkout session",
      details,
    });
  }
}
