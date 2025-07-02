
import { db } from './firebase'; // Adjust path if needed
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, setDoc, onSnapshot } from 'firebase/firestore';
export { db };
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

// New functions needed by useRealTimeData
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

export const subscribeToUserStats = (userId: string, callback: (stats: any) => void) => {
  const statsDoc = doc(db, 'users', userId, 'stats', 'summary');
  return onSnapshot(statsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
};

export const getUserStudySessions = async (userId: string) => {
  const sessionsCollection = collection(db, 'users', userId, 'studySessions');
  const querySnapshot = await getDocs(sessionsCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
