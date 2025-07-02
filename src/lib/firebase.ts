import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Use your actual config values here
const firebaseConfig = {
  apiKey: "AIzaSyBzVjEtj1jTM7P-MKmoUkEneA121juKOjw",
  authDomain: "studyai-39fb8.firebaseapp.com",
  projectId: "studyai-39fb8",
  storageBucket: "studyai-39fb8.appspot.com",
  messagingSenderId: "167999192726",
  appId: "1:167999192726:web:ec58b6169c7398743dccb7",
  measurementId: "G-VLHJ0SX0GG",
  databaseURL: "https://studyai-39fb8-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
