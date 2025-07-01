
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzVjEtj1jTM7P-MKmoUkEneA121juKOjw",
  authDomain: "studyai-39fb8.firebaseapp.com",
  databaseURL: "https://studyai-39fb8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studyai-39fb8",
  storageBucket: "studyai-39fb8.firebasestorage.app",
  messagingSenderId: "167999192726",
  appId: "1:167999192726:web:ec58b6169c7398743dccb7",
  measurementId: "G-VLHJ0SX0GG"
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

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

export { analytics };
export default app;
