
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrrePl9YgXRHzoGrvNhxW--LGwCIqAYy4",
  authDomain: "tutorly-76b09.firebaseapp.com",
  projectId: "tutorly-76b09",
  storageBucket: "tutorly-76b09.firebasestorage.app",
  messagingSenderId: "139893500065",
  appId: "1:139893500065:web:2d65b5fcd830eb86ea68e0",
  measurementId: "G-PGJX4C1P5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectDatabaseEmulator(db, "localhost", 9000);
  // connectStorageEmulator(storage, "localhost", 9199);
}

export { analytics };
export default app;
