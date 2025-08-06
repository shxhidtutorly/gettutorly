// pages/api/subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "studyai-39fb8",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const PLAN_NAMES = {
  'pri_01jxq0pfrjcd0gkj08cmqv6rb1': 'Tutorly Pro – Monthly Plan',
  'pri_01jxq0wydxwg59kmha33h213ab': 'Tutorly Premium – Quarterly',
  'pri_01jxq11xb6dpkzgqr27fxkejc3': 'Tutorly Max – Annual Plan'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }

  try {
    // Check main subscription in users collection
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    // Check manual subscription
    const manualRef = db.collection('manualSubscriptions').doc(userId);
    const manualDoc = await manualRef.get();

    let subscription = null;

    if (userDoc.exists && userDoc.data()?.subscription?.isActive) {
      const data = userDoc.data()?.subscription;
      subscription = {
        plan_name: PLAN_NAMES[data.paddlePlanId] || 'Unknown Plan',
        is_trial: isWithinTrialPeriod(data.startedAt),
        is_expired: !data.isActive || new Date() > new Date(data.currentPeriodEndsAt)
      };
    } else if (manualDoc.exists && manualDoc.data()?.isActive) {
      const data = manualDoc.data();
      subscription = {
        plan_name: PLAN_NAMES[data.planId] || 'Manual Plan',
        is_trial: false,
        is_expired: !data.isActive || (data.currentPeriodEndsAt && new Date() > new Date(data.currentPeriodEndsAt))
      };
    }

    if (!subscription) {
      return res.status(404).json({ error: "No subscription found" });
    }

    return res.status(200).json(subscription);
  } catch (error) {
    console.error("[API] Subscription fetch failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function isWithinTrialPeriod(startedAt: string): boolean {
  if (!startedAt) return false;
  const trialStart = new Date(startedAt);
  const trialEnd = new Date(trialStart.getTime() + (4 * 24 * 60 * 60 * 1000)); // 4 days
  return new Date() <= trialEnd;
}
