// pages/api/subscription.ts (Next.js or Vercel)
export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  // TODO: Lookup subscription in DB (replace with real logic)
  return res.status(200).json({
    plan_name: "Pro",
    is_trial: true,
    is_expired: false,
  });
}
