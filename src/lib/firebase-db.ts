
import { ref, set, get, update, remove, push, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';

// USER OPERATIONS
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await set(userRef, {
      ...userData,
      role: userData.role || "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      role: role,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// STUDY MATERIALS OPERATIONS
export const saveStudyMaterial = async (userId: string, materialData: any) => {
  try {
    const materialsRef = ref(db, `study_materials/${userId}`);
    const newMaterialRef = push(materialsRef);
    
    const material = {
      id: newMaterialRef.key,
      user_id: userId,
      ...materialData,
      created_at: new Date().toISOString(),
    };
    
    await set(newMaterialRef, material);
    
    // Update user stats
    await updateUserStat(userId, 'materials_created', 1);
    
    return newMaterialRef.key;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

export const getUserStudyMaterials = async (userId: string) => {
  try {
    const materialsRef = ref(db, `study_materials/${userId}`);
    const snapshot = await get(materialsRef);
    
    if (!snapshot.exists()) return [];
    
    const materials = snapshot.val();
    return Object.values(materials).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("Error getting user study materials:", error);
    throw error;
  }
};

export const deleteStudyMaterial = async (userId: string, materialId: string) => {
  try {
    const materialRef = ref(db, `study_materials/${userId}/${materialId}`);
    await remove(materialRef);
    return true;
  } catch (error) {
    console.error("Error deleting study material:", error);
    throw error;
  }
};

// NOTES OPERATIONS
export const createNote = async (userId: string, noteData: any) => {
  try {
    const notesRef = ref(db, `notes/${userId}`);
    const newNoteRef = push(notesRef);
    
    const note = {
      id: newNoteRef.key,
      user_id: userId,
      ...noteData,
      created_at: new Date().toISOString(),
    };
    
    await set(newNoteRef, note);
    
    // Update user stats
    await updateUserStat(userId, 'notes_created', 1);
    
    return newNoteRef.key;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getUserNotes = async (userId: string) => {
  try {
    const notesRef = ref(db, `notes/${userId}`);
    const snapshot = await get(notesRef);
    
    if (!snapshot.exists()) return [];
    
    const notes = snapshot.val();
    return Object.values(notes).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("Error getting user notes:", error);
    throw error;
  }
};

export const deleteNote = async (userId: string, noteId: string) => {
  try {
    const noteRef = ref(db, `notes/${userId}/${noteId}`);
    await remove(noteRef);
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// STUDY SESSIONS TRACKING
export const createStudySession = async (userId: string, sessionData: any) => {
  try {
    const sessionsRef = ref(db, `study_sessions/${userId}`);
    const newSessionRef = push(sessionsRef);
    
    const session = {
      id: newSessionRef.key,
      user_id: userId,
      ...sessionData,
      started_at: new Date().toISOString(),
    };
    
    await set(newSessionRef, session);
    return newSessionRef.key;
  } catch (error) {
    console.error("Error creating study session:", error);
    throw error;
  }
};

export const updateStudySession = async (userId: string, sessionId: string, sessionData: any) => {
  try {
    const sessionRef = ref(db, `study_sessions/${userId}/${sessionId}`);
    await update(sessionRef, {
      ...sessionData,
      ended_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating study session:", error);
    throw error;
  }
};

export const getUserStudySessions = async (userId: string) => {
  try {
    const sessionsRef = ref(db, `study_sessions/${userId}`);
    const snapshot = await get(sessionsRef);
    
    if (!snapshot.exists()) return [];
    
    const sessions = snapshot.val();
    return Object.values(sessions).sort((a: any, b: any) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  } catch (error) {
    console.error("Error getting study sessions:", error);
    throw error;
  }
};

// USER STATS OPERATIONS
export const updateUserStat = async (userId: string, statType: string, increment: number = 1) => {
  try {
    const statRef = ref(db, `user_stats/${userId}/${statType}`);
    const snapshot = await get(statRef);
    
    const currentCount = snapshot.exists() ? snapshot.val().count || 0 : 0;
    
    await set(statRef, {
      count: currentCount + increment,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating user stat:", error);
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const statsRef = ref(db, `user_stats/${userId}`);
    const snapshot = await get(statsRef);
    
    if (!snapshot.exists()) {
      // Initialize default stats
      const defaultStats = {
        materials_created: { count: 0, last_updated: new Date().toISOString() },
        notes_created: { count: 0, last_updated: new Date().toISOString() },
        flashcards_created: { count: 0, last_updated: new Date().toISOString() },
        quizzes_created: { count: 0, last_updated: new Date().toISOString() },
        quizzes_taken: { count: 0, last_updated: new Date().toISOString() },
        summaries_created: { count: 0, last_updated: new Date().toISOString() },
        doubts_asked: { count: 0, last_updated: new Date().toISOString() },
        audio_notes_created: { count: 0, last_updated: new Date().toISOString() },
        total_study_time: { count: 0, last_updated: new Date().toISOString() }
      };
      
      await set(statsRef, defaultStats);
      return defaultStats;
    }
    
    return snapshot.val();
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
};

// REAL-TIME LISTENERS
export const subscribeToUserNotes = (userId: string, callback: (notes: any[]) => void) => {
  const notesRef = ref(db, `notes/${userId}`);
  
  const unsubscribe = onValue(notesRef, (snapshot) => {
    if (snapshot.exists()) {
      const notes = snapshot.val();
      const notesArray = Object.values(notes).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      callback(notesArray);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
};

export const subscribeToStudyMaterials = (userId: string, callback: (materials: any[]) => void) => {
  const materialsRef = ref(db, `study_materials/${userId}`);
  
  const unsubscribe = onValue(materialsRef, (snapshot) => {
    if (snapshot.exists()) {
      const materials = snapshot.val();
      const materialsArray = Object.values(materials).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      callback(materialsArray);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
};

export const subscribeToUserStats = (userId: string, callback: (stats: any) => void) => {
  const statsRef = ref(db, `user_stats/${userId}`);
  
  const unsubscribe = onValue(statsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({});
    }
  });
  
  return unsubscribe;
};
