// src/server/firebaseAdmin.ts
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let dbInstance: FirebaseFirestore.Firestore | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  if (!getApps().length) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;
    if (sa) {
      initializeApp({ credential: cert(sa) });
    } else {
      // Fallback to application default (e.g., if using Google credentials)
      initializeApp({ credential: applicationDefault() as any });
    }
  }
  dbInstance = getFirestore();
  return dbInstance;
}
