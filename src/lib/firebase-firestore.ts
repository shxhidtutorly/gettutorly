
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
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// USER OPERATIONS
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      role: userData.role || "student",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// STUDY MATERIALS OPERATIONS
export const saveStudyMaterial = async (userId: string, materialData: any) => {
  try {
    const materialsRef = collection(db, 'study_materials');
    const docRef = await addDoc(materialsRef, {
      userId: userId,
      ...materialData,
      created_at: serverTimestamp(),
    });
    
    // Update user stats
    await updateUserStat(userId, 'materials_created', 1);
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

export const getUserStudyMaterials = async (userId: string) => {
  try {
    const materialsRef = collection(db, 'study_materials');
    const q = query(
      materialsRef, 
      where('userId', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const materials = [];
    querySnapshot.forEach((doc) => {
      materials.push({ id: doc.id, ...doc.data() });
    });
    
    return materials;
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
      userId: userId,
      ...noteData,
      created_at: serverTimestamp(),
    });
    
    // Update user stats
    await updateUserStat(userId, 'notes_created', 1);
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const updateNote = async (noteId: string, noteData: any) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...noteData,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const getUserNotes = async (userId: string) => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef, 
      where('userId', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    
    return notes;
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

// STUDY SESSIONS TRACKING
export const createStudySession = async (userId: string, sessionData: any) => {
  try {
    const sessionsRef = collection(db, 'study_sessions');
    const docRef = await addDoc(sessionsRef, {
      userId: userId,
      ...sessionData,
      started_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating study session:", error);
    throw error;
  }
};

export const updateStudySession = async (sessionId: string, sessionData: any) => {
  try {
    const sessionRef = doc(db, 'study_sessions', sessionId);
    await updateDoc(sessionRef, {
      ...sessionData,
      ended_at: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating study session:", error);
    throw error;
  }
};

export const getUserStudySessions = async (userId: string) => {
  try {
    const sessionsRef = collection(db, 'study_sessions');
    const q = query(
      sessionsRef, 
      where('userId', '==', userId),
      orderBy('started_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    return sessions;
  } catch (error) {
    console.error("Error getting study sessions:", error);
    throw error;
  }
};

// USER STATS OPERATIONS
export const updateUserStat = async (userId: string, statType: string, increment: number = 1) => {
  try {
    const statRef = doc(db, 'user_stats', `${userId}_${statType}`);
    const statSnap = await getDoc(statRef);
    
    const currentCount = statSnap.exists() ? statSnap.data().count || 0 : 0;
    
    await updateDoc(statRef, {
      userId: userId,
      statType: statType,
      count: currentCount + increment,
      last_updated: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user stat:", error);
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const statsRef = collection(db, 'user_stats');
    const q = query(statsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const stats = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats[data.statType] = {
        count: data.count || 0,
        last_updated: data.last_updated?.toDate?.() || new Date()
      };
    });
    
    // Initialize default stats if empty
    if (Object.keys(stats).length === 0) {
      const defaultStats = {
        materials_created: { count: 0, last_updated: new Date() },
        notes_created: { count: 0, last_updated: new Date() },
        flashcards_created: { count: 0, last_updated: new Date() },
        quizzes_created: { count: 0, last_updated: new Date() },
        quizzes_taken: { count: 0, last_updated: new Date() },
        summaries_created: { count: 0, last_updated: new Date() },
        doubts_asked: { count: 0, last_updated: new Date() },
        audio_notes_created: { count: 0, last_updated: new Date() },
        total_study_time: { count: 0, last_updated: new Date() }
      };
      
      return defaultStats;
    }
    
    return stats;
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
};

// REAL-TIME LISTENERS
export const subscribeToUserNotes = (userId: string, callback: (notes: any[]) => void) => {
  const notesRef = collection(db, 'notes');
  const q = query(
    notesRef, 
    where('userId', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    callback(notes);
  });
};

export const subscribeToStudyMaterials = (userId: string, callback: (materials: any[]) => void) => {
  const materialsRef = collection(db, 'study_materials');
  const q = query(
    materialsRef, 
    where('userId', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const materials = [];
    querySnapshot.forEach((doc) => {
      materials.push({ id: doc.id, ...doc.data() });
    });
    callback(materials);
  });
};

export const subscribeToUserStats = (userId: string, callback: (stats: any) => void) => {
  const statsRef = collection(db, 'user_stats');
  const q = query(statsRef, where('userId', '==', userId));
  
  return onSnapshot(q, (querySnapshot) => {
    const stats = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats[data.statType] = {
        count: data.count || 0,
        last_updated: data.last_updated?.toDate?.() || new Date()
      };
    });
    callback(stats);
  });
};
