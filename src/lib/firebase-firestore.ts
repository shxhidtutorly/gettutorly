// src/lib/firebase-firestore.ts

import { db } from './firebase'; // Adjust path if needed
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  Timestamp // Import Firestore Timestamp
} from 'firebase/firestore';
export { db };

// --- NEW HELPER FUNCTION ---
/**
 * Fetches all documents from a user's sub-collection.
 * Used by the stats recalculation logic.
 * @param userId The ID of the user.
 * @param collectionName The name of the sub-collection (e.g., 'notes_history').
 * @returns An array of document data objects.
 */
export const getUserDocs = async (userId: string, collectionName: string) => {
  const collectionRef = collection(db, 'users', userId, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map(doc => doc.data());
};


// --- USER STATS FUNCTIONS (FIXED & VERIFIED) ---

// Defines the default structure for a user's stats document.
const defaultStats = {
  total_study_time: 0,
  materials_created: 0,
  notes_created: 0,
  quizzes_taken: 0,
  flashcards_created: 0,
  average_quiz_score: 0,
  sessions_this_month: 0,
  learning_milestones: 0,
  lastUpdated: Timestamp.now()
};

/**
 * Subscribes to the user's stats summary document for real-time updates.
 * If the document doesn't exist, it creates it with default values.
 * @param userId The ID of the user.
 * @param callback The function to call with the stats data.
 * @returns The unsubscribe function for the listener.
 */
export const subscribeToUserStats = (userId: string, callback: (stats: any) => void) => {
  const statsDocRef = doc(db, 'users', userId, 'stats', 'summary');
  return onSnapshot(statsDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      // Document doesn't exist, so create it with defaults.
      // The listener will automatically fire again with the new data.
      console.log("User stats document not found. Creating with default values.");
      setDoc(statsDocRef, defaultStats).then(() => {
        callback(defaultStats);
      }).catch(error => console.error("Error creating default stats doc:", error));
    }
  });
};

/**
 * Fetches the user's stats summary document once.
 * If the document doesn't exist, it creates it with default values.
 * @param userId The ID of the user.
 * @returns The user's stats data.
 */
export const getUserStats = async (userId: string) => {
  const statsDocRef = doc(db, 'users', userId, 'stats', 'summary');
  const docSnap = await getDoc(statsDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Document doesn't exist, create it and return defaults.
    await setDoc(statsDocRef, defaultStats);
    return defaultStats;
  }
};

/**
 * Updates the user's stats summary document.
 * Uses setDoc with merge to create or update the document.
 * @param userId The ID of the user.
 * @param statsData The partial or full stats object to update.
 */
export const updateUserStats = async (userId: string, statsData: any) => {
  const statsDocRef = doc(db, 'users', userId, 'stats', 'summary');
  // Always set a fresh 'lastUpdated' timestamp with every update.
  await setDoc(statsDocRef, {
    ...statsData,
    lastUpdated: Timestamp.now()
  }, { merge: true });
};


// --- OTHER EXISTING FUNCTIONS (from your original file) ---

export const createUserProfile = async (userId: string, profileData: any) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, profileData, { merge: true });
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, profileData);
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};

export const createNote = async (userId: string, noteData: any): Promise<string> => {
  const notesCollection = collection(db, 'users', userId, 'notes');
  const docRef = await addDoc(notesCollection, noteData);
  return docRef.id;
};

export const updateNote = async (userId: string, noteId: string, noteData: any) => {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, noteData);
};

export const deleteNote = async (userId: string, noteId: string) => {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
};

export const getUserNotes = async (userId: string) => {
  const notesCollection = collection(db, 'users', userId, 'notes');
  const querySnapshot = await getDocs(notesCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserStudyMaterials = async (userId: string) => {
  const materialsCollection = collection(db, 'users', userId, 'studyMaterials');
  const querySnapshot = await getDocs(materialsCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToStudyMaterials = (userId: string, callback: (materials: any[]) => void) => {
  const materialsCollection = collection(db, 'users', userId, 'studyMaterials');
  return onSnapshot(materialsCollection, (snapshot) => {
    const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(materials);
  });
};

export const getUserStudySessions = async (userId: string) => {
  const sessionsCollection = collection(db, 'users', userId, 'studySessions');
  const querySnapshot = await getDocs(sessionsCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
