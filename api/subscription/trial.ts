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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, planName } = req.body;

  if (!userId || !planName) {
    return res.status(400).json({ error: "Missing userId or planName" });
  }

  try {
    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + (4 * 24 * 60 * 60 * 1000)); // 4 days

    const trialSubscription = {
      planId: Object.keys(PLAN_NAMES).find(key => PLAN_NAMES[key] === planName) || 'pri_01jxq0pfrjcd0gkj08cmqv6rb1',
      isActive: true,
      startedAt: trialStart.toISOString(),
      currentPeriodEndsAt: trialEnd.toISOString(),
      manualEntry: true
    };

    await db.collection('manualSubscriptions').doc(userId).set(trialSubscription);

    return res.status(200).json({
      plan_name: planName,
      is_trial: true,
      is_expired: false
    });
  } catch (error) {
    console.error("Trial creation failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}