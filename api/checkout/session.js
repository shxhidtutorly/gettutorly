// api/checkout/session.js
// FINAL: robust, sanitized, raw HTTP call to Paddle for creating a transaction
// Paste this file replacing your current API route exactly.

import fetch from "node-fetch";

/**
 * ENV VARS you MUST set in Vercel (exact names):
 *  - PADDLE_API_KEY  -> the raw server API key from Paddle (no "Bearer ", no quotes, no newline)
 *  - SITE_URL        -> https://gettutorly.com  (or your public site)
 *  - Optionally PADDLE_ENV -> "sandbox" or "production" (unused for URL here, but keep for clarity)
 */

function sanitizeKey(raw) {
  if (!raw || typeof raw !== "string") return "";
  let k = raw.trim();
  // remove surrounding quotes
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  // remove accidental "Bearer " prefix
  if (k.toLowerCase().startsWith("bearer ")) {
    k = k.split(" ").slice(1).join(" ").trim();
  }
  // remove any accidental "Bearer:" etc
  k = k.replace(/^Bearer:/i, "").trim();
  // strip newlines
  k = k.replace(/\r?\n|\r/g, "").trim();
  return k;
}

function maskKey(key) {
  if (!key) return "<empty>";
  if (key.length <= 8) return key.replace(/.(?=.{2})/g, "*");
  return key.slice(0, 4) + key.slice(4, -4).replace(/./g, "*") + key.slice(-4);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rawKey = process.env.PADDLE_API_KEY || "";
  const key = sanitizeKey(rawKey);
  const SITE_URL = process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://gettutorly.com";

  // quick guard: very explicit and immediate
  if (!key) {
    console.error("[checkout] Missing/empty PADDLE_API_KEY env var (raw masked):", maskKey(rawKey));
    return res.status(500).json({
      error: "missing_api_key",
      message: "PADDLE_API_KEY missing or empty in environment. Set the raw API key (no quotes, no 'Bearer ' prefix)."
    });
  }

  try {
    const body = req.body || {};
    const priceId = body.price_id || body.priceId;
    const email = body.email || "";

    if (!priceId) {
      return res.status(400).json({ error: "missing_field", message: "price_id is required in the POST body" });
    }

    const payload = {
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic",
      checkout: { url: SITE_URL },
      // custom_data optional:
      custom_data: body.user_id ? { firebaseUid: body.user_id } : undefined,
    };

    // Log masked key and payload to server logs for debugging (no secret leak)
    console.info("[checkout] Using maskedKey:", maskKey(key));
    console.info("[checkout] Payload:", JSON.stringify({ items: payload.items, checkout: payload.checkout }));

    // Raw HTTP request to Paddle
    const pRes = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`, // correct format
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // no redirect handling needed
    });

    const text = await pRes.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

    console.info("[checkout] Paddle response status:", pRes.status, "body:", parsed);

    if (!pRes.ok) {
      // helpful, actionable messages for two common cases
      if (pRes.status === 403) {
        return res.status(403).json({
          error: "forbidden_or_auth_malformed",
          message: "Paddle returned an authorization error. Check the raw API key in Vercel (no quotes/no 'Bearer ').",
          paddle: parsed
        });
      }
      if (pRes.status === 400 && parsed && parsed.code === "transaction_default_checkout_url_not_set") {
        return res.status(400).json({
          error: "transaction_default_checkout_url_not_set",
          message: "Paddle requires a Default Payment Link to be set in Dashboard -> Checkout settings.",
          paddle: parsed
        });
      }
      return res.status(pRes.status).json({ error: "paddle_error", paddle: parsed });
    }

    // success path: prefer checkout.url
    const checkoutUrl = parsed?.checkout?.url || null;
    if (checkoutUrl) {
      return res.status(200).json({ checkout_url: checkoutUrl, transaction: parsed });
    }

    // fallback: return transaction id and parsed object (client can use Paddle.Checkout.open with transaction id)
    return res.status(200).json({ transaction_id: parsed?.id || null, transaction: parsed });

  } catch (err) {
    console.error("[checkout] Unexpected server error:", String(err));
    return res.status(500).json({ error: "internal_error", details: String(err) });
  }
}
