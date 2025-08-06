// pages/api/subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin"; // Make sure you have this set up
import { doc, getDoc } from "firebase-admin/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }

  try {
    const docRef = doc(db, "subscriptions", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "No subscription found" });
    }

    const data = docSnap.data();

    return res.status(200).json({
      plan_name: data.plan_name,
      is_trial: data.is_trial,
      is_expired: data.is_expired,
    });
  } catch (error) {
    console.error("[API] Subscription fetch failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
