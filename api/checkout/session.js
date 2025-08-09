// api/checkout/session.js
// Replace your current file with this. Uses raw HTTP to Paddle and sanitizes the API key.

import fetch from "node-fetch";

/**
 * Required env vars:
 * - PADDLE_API_KEY  -> paste the server API key string (no "Bearer " prefix, no quotes, no newline)
 * - PADDLE_ENV      -> optional: "sandbox" or "production" (defaults to sandbox)
 * - SITE_URL        -> optional: your site URL (defaults to https://gettutorly.com)
 */

function sanitizeKey(raw) {
  if (!raw || typeof raw !== "string") return "";
  let k = raw.trim();
  // remove surrounding quotes if someone pasted with quotes
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  // remove leading "Bearer " or "bearer " if accidentally included
  if (k.toLowerCase().startsWith("bearer ")) {
    k = k.split(" ").slice(1).join(" ").trim();
  }
  // final trim
  return k;
}

function maskKey(key) {
  if (!key) return "<empty>";
  if (key.length <= 10) return key.replace(/.(?=.{2})/g, "*");
  return key.slice(0, 4) + key.slice(4, -4).replace(/./g, "*") + key.slice(-4);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rawKey = process.env.PADDLE_API_KEY || process.env.PADDLE_KEY || "";
  const key = sanitizeKey(rawKey);
  const PADDLE_ENV = (process.env.PADDLE_ENV || "sandbox").toLowerCase();
  const SITE_URL = process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://gettutorly.com";

  // quick guard
  if (!key) {
    console.error("[checkout] Missing Paddle API key in environment (raw value masked):", maskKey(rawKey));
    return res.status(500).json({ error: "missing_api_key", message: "Set PADDLE_API_KEY in Vercel env (raw key, no quotes, no 'Bearer ' prefix)." });
  }

  try {
    const { email, price_id: priceId, user_id } = req.body ?? {};
    if (!priceId) return res.status(400).json({ error: "missing_field", message: "price_id is required" });

    // Build raw HTTP request to Paddle (transactions endpoint)
    const payload = {
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic",
      checkout: { url: SITE_URL },
      custom_data: user_id ? { firebaseUid: user_id } : undefined,
    };

    // Log masked key and request payload (no secrets)
    console.info("[checkout] Paddle env:", PADDLE_ENV, "maskedKey:", maskKey(key));
    console.info("[checkout] Posting transaction payload:", JSON.stringify(payload));

    const apiUrl = "https://api.paddle.com/transactions";
    const pRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await pRes.text();
    let body;
    try { body = JSON.parse(text); } catch(e) { body = text; }

    // Log the full response for debugging (will appear in Vercel logs)
    console.info("[checkout] Paddle response status:", pRes.status, "body:", body);

    // If not OK, return the Paddle body with status (so frontend gets actionable JSON)
    if (!pRes.ok) {
      // if 403 or 400, include hint for malformed auth
      if (pRes.status === 403 && typeof body === "object" && body.code === "authentication_malformed") {
        return res.status(403).json({
          error: "authentication_malformed",
          message: "Authentication header malformed. Check that PADDLE_API_KEY env var is the raw server key (no 'Bearer ' prefix, no surrounding quotes/newlines).",
          paddle: body,
        });
      }

      return res.status(pRes.status).json({ error: "paddle_error", paddle: body });
    }

    // success: prefer checkout_url if present
    const checkoutUrl = body?.checkout?.url || null;
    return res.status(200).json({ checkout_url: checkoutUrl, transaction: body });

  } catch (err) {
    console.error("[checkout] Unexpected error:", String(err));
    return res.status(500).json({ error: "internal_error", details: String(err) });
  }
}
