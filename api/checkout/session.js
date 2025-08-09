// api/checkout/session.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // sanitize env var
  const raw = process.env.PADDLE_API_KEY || process.env.PADDLE_KEY || "";
  const sanitize = s => {
    if (!s || typeof s !== "string") return "";
    let k = s.trim();
    if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) k = k.slice(1, -1).trim();
    if (k.toLowerCase().startsWith("bearer ")) k = k.split(" ").slice(1).join(" ").trim();
    k = k.replace(/[\r\n]+/g, "").trim();
    return k;
  };
  const key = sanitize(raw);
  const mask = k => {
    if (!k) return "<empty>";
    if (k.length <= 10) return k.replace(/.(?=.{2})/g, "*");
    return k.slice(0,4) + k.slice(4,-4).replace(/./g,"*") + k.slice(-4);
  };

  if (!key) {
    console.error("[checkout] Missing Paddle API key (raw masked):", mask(raw));
    return res.status(500).json({ error: "missing_api_key", message: "Set PADDLE_API_KEY in environment (raw server key, no 'Bearer ', no quotes)." });
  }

  const { email, price_id: priceId, user_id } = req.body ?? {};
  if (!priceId) return res.status(400).json({ error: "missing_field", message: "price_id is required" });

  // SITE_URL: prefer explicit env var; fallback to gettutorly.com — ensure scheme
  let SITE_URL = (process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://gettutorly.com").trim();
  if (!SITE_URL.match(/^https?:\/\//)) SITE_URL = "https://" + SITE_URL;

  const payload = {
    items: [{ price_id: priceId, quantity: 1 }],
    collection_mode: "automatic",
    checkout: { url: SITE_URL },
    custom_data: user_id ? { firebaseUid: user_id } : undefined,
  };

  try {
    console.info("[checkout] Using maskedKey:", mask(key));
    console.info("[checkout] Payload:", JSON.stringify(payload));

    const pRes = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await pRes.text();
    let body;
    try { body = JSON.parse(rawBody); } catch(e) { body = rawBody; }

    // try to extract Paddle meta.request_id if present
    const requestId = body?.meta?.request_id || body?.request_id || null;
    console.info("[checkout] Paddle response status:", pRes.status, "request_id:", requestId, "body:", body);

    if (!pRes.ok) {
      // Most common actionable causes:
      //  - 403 forbidden => permission / env mismatch / price id wrong account
      //  - 400 transaction_default_checkout_url_not_set => default link not set
      return res.status(pRes.status).json({ error: "paddle_error", status: pRes.status, request_id: requestId, paddle: body });
    }

    const checkoutUrl = body?.checkout?.url || null;
    if (checkoutUrl) return res.status(200).json({ checkout_url: checkoutUrl, transaction: body });
    return res.status(200).json({ message: "transaction_created_no_checkout_url", transaction: body });
  } catch (err) {
    console.error("[checkout] Unexpected error:", String(err));
    return res.status(500).json({ error: "internal_error", details: String(err) });
  }
}
