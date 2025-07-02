
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  setDoc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

// USER OPERATIONS
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      role: userData.role || "student",
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// STUDY MATERIALS OPERATIONS
export const saveStudyMaterial = async (userId: string, materialData: any) => {
  try {
    const materialsRef = collection(db, 'study_materials');
    const docRef = await addDoc(materialsRef, {
      userId,
      ...materialData,
      created_at: Timestamp.now(),
    });
    
    // Update user stats
    await updateUserStats(userId, 'materials_created', 1);
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

export const getUserStudyMaterials = async (userId: string) => {
  try {
    const materialsRef = collection(db, 'study_materials');
    const q = query(materialsRef, where("userId", "==", userId), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user study materials:", error);
    throw error;
  }
};

export const deleteStudyMaterial = async (materialId: string) => {
  try {
    const materialRef = doc(db, 'study_materials', materialId);
    await deleteDoc(materialRef);
    return true;
  } catch (error) {
    console.error("Error deleting study material:", error);
    throw error;
  }
};

// NOTES OPERATIONS
export const createNote = async (userId: string, noteData: any) => {
  try {
    const notesRef = collection(db, 'notes');
    const docRef = await addDoc(notesRef, {
      userId,
      ...noteData,
      created_at: Timestamp.now(),
    });
    
    // Update user stats
    await updateUserStats(userId, 'notes_created', 1);
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getUserNotes = async (userId: string) => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where("userId", "==", userId), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting user notes:", error);
    throw error;
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// USER STATS OPERATIONS
export const getUserStats = async (userId: string) => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    const docSnap = await getDoc(statsRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Initialize empty stats
      const initialStats = {
        materials_created: 0,
        notes_created: 0,
        quizzes_taken: 0,
        flashcards_created: 0,
        summaries_created: 0,
        total_study_time: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };
      await setDoc(statsRef, initialStats);
      return initialStats;
    }
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
};

export const updateUserStats = async (userId: string, statType: string, increment: number) => {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    const docSnap = await getDoc(statsRef);
    
    let currentStats = {};
    if (docSnap.exists()) {
      currentStats = docSnap.data();
    }
    
    const updatedStats = {
      ...currentStats,
      [statType]: (currentStats[statType] || 0) + increment,
      updated_at: Timestamp.now(),
    };
    
    await setDoc(statsRef, updatedStats, { merge: true });
    return updatedStats;
  } catch (error) {
    console.error("Error updating user stats:", error);
    throw error;
  }
};

// STUDY SESSIONS
export const getUserStudySessions = async (userId: string) => {
  try {
    const sessionsRef = collection(db, 'study_sessions');
    const q = query(sessionsRef, where("userId", "==", userId), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting study sessions:", error);
    throw error;
  }
};

// REAL-TIME SUBSCRIPTIONS
export const subscribeToUserStats = (userId: string, callback: (stats: any) => void) => {
  const statsRef = doc(db, 'user_stats', userId);
  return onSnapshot(statsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const subscribeToStudyMaterials = (userId: string, callback: (materials: any[]) => void) => {
  const materialsRef = collection(db, 'study_materials');
  const q = query(materialsRef, where("userId", "==", userId), orderBy("created_at", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(materials);
  });
};
