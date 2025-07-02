import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestore CRUD operations
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
