import { Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY!,
  environment:
    process.env.VITE_PADDLE_ENV === "production" ? "production" : "sandbox",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, price_id, user_id } = req.body;
    if (!email || !price_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const baseUrl =
      process.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173";

    const session = await paddle.checkout.sessions.create({
      customer: { email },
      items: [{ price_id, quantity: 1 }],
      return_url: `${baseUrl}/dashboard?sub=success`,
      cancel_url: `${baseUrl}/pricing?sub=cancel`,
      custom_data: { firebaseUid: user_id },
    });

    return res.status(200).json({
      checkout_url: session.data.checkout_url,
      session_id: session.data.id,
    });
  } catch (error) {
    console.error("Paddle checkout error:", error);
    return res.status(500).json({
      error: "Failed to create checkout session",
      details: error.message,
    });
  }
}
