
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

// FIXED: Use proper document path with even segments
export const subscribeToUserStats = (userId: string, callback: (stats: any) => void) => {
  const statsDoc = doc(db, 'users', userId, 'stats', 'summary');
  return onSnapshot(statsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      // Initialize default stats if document doesn't exist
      const defaultStats = {
        total_study_time: 0,
        materials_created: 0,
        notes_created: 0,
        quizzes_taken: 0,
        flashcards_created: 0,
        average_quiz_score: 0,
        sessions_this_month: 0,
        learning_milestones: 0,
        lastUpdated: new Date()
      };
      setDoc(statsDoc, defaultStats, { merge: true });
      callback(defaultStats);
    }
  });
};

export const getUserStudySessions = async (userId: string) => {
  const sessionsCollection = collection(db, 'users', userId, 'studySessions');
  const querySnapshot = await getDocs(sessionsCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// FIXED: Add function to get user stats with proper document path
export const getUserStats = async (userId: string) => {
  const statsDoc = doc(db, 'users', userId, 'stats', 'summary');
  const docSnap = await getDoc(statsDoc);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Initialize default stats
    const defaultStats = {
      total_study_time: 0,
      materials_created: 0,
      notes_created: 0,
      quizzes_taken: 0,
      flashcards_created: 0,
      average_quiz_score: 0,
      sessions_this_month: 0,
      learning_milestones: 0,
      lastUpdated: new Date()
    };
    await setDoc(statsDoc, defaultStats, { merge: true });
    return defaultStats;
  }
};

// FIXED: Add function to update user stats
export const updateUserStats = async (userId: string, statsData: any) => {
  const statsDoc = doc(db, 'users', userId, 'stats', 'summary');
  await setDoc(statsDoc, {
    ...statsData,
    lastUpdated: new Date()
  }, { merge: true });
};
