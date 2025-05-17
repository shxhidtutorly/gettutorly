
import { 
  get, 
  set, 
  ref, 
  push, 
  remove, 
  update, 
  onValue, 
  off, 
  query, 
  orderByChild, 
  equalTo, 
  DatabaseReference,
  DataSnapshot
} from "firebase/database";
import { rtdb } from "./firebase";

// User profiles in Realtime Database
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await set(ref(rtdb, `users/${userId}`), {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile in RTDB:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    await update(ref(rtdb, `users/${userId}`), {
      ...userData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile in RTDB:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const snapshot = await get(ref(rtdb, `users/${userId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting user profile from RTDB:", error);
    throw error;
  }
};

// Study progress tracking in Realtime Database
export const updateStudyProgress = async (userId: string, courseId: string, progressData: any) => {
  try {
    await set(ref(rtdb, `progress/${userId}/${courseId}`), {
      ...progressData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating study progress:", error);
    throw error;
  }
};

export const getStudyProgress = async (userId: string, courseId?: string) => {
  try {
    const path = courseId ? `progress/${userId}/${courseId}` : `progress/${userId}`;
    const snapshot = await get(ref(rtdb, path));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting study progress:", error);
    throw error;
  }
};

// Real-time data subscription
export const subscribeToData = (path: string, callback: (data: any) => void) => {
  const dataRef = ref(rtdb, path);
  onValue(dataRef, (snapshot) => {
    callback(snapshot.val());
  });
  
  // Return function to unsubscribe
  return () => off(dataRef);
};

// Notes management in Realtime Database
export const createNote = async (userId: string, noteData: any) => {
  try {
    const newNoteRef = push(ref(rtdb, `notes/${userId}`));
    await set(newNoteRef, {
      ...noteData,
      id: newNoteRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return newNoteRef.key;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const updateNote = async (userId: string, noteId: string, noteData: any) => {
  try {
    await update(ref(rtdb, `notes/${userId}/${noteId}`), {
      ...noteData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const deleteNote = async (userId: string, noteId: string) => {
  try {
    await remove(ref(rtdb, `notes/${userId}/${noteId}`));
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

export const getNotes = async (userId: string) => {
  try {
    const snapshot = await get(ref(rtdb, `notes/${userId}`));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
};

// Data backup utilities
export const backupUserData = async (userId: string) => {
  try {
    // Get all user data
    const userProfile = await get(ref(rtdb, `users/${userId}`));
    const userNotes = await get(ref(rtdb, `notes/${userId}`));
    const userProgress = await get(ref(rtdb, `progress/${userId}`));
    
    // Create backup entry
    const backupData = {
      profile: userProfile.val(),
      notes: userNotes.val(),
      progress: userProgress.val(),
      backupDate: new Date().toISOString()
    };
    
    // Store backup
    const backupRef = push(ref(rtdb, `backups/${userId}`));
    await set(backupRef, backupData);
    
    return {
      backupId: backupRef.key,
      backupDate: backupData.backupDate
    };
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
};

export const restoreFromBackup = async (userId: string, backupId: string) => {
  try {
    // Get backup data
    const backupSnapshot = await get(ref(rtdb, `backups/${userId}/${backupId}`));
    
    if (!backupSnapshot.exists()) {
      throw new Error("Backup not found");
    }
    
    const backupData = backupSnapshot.val();
    
    // Restore data
    if (backupData.profile) {
      await set(ref(rtdb, `users/${userId}`), backupData.profile);
    }
    
    if (backupData.notes) {
      await set(ref(rtdb, `notes/${userId}`), backupData.notes);
    }
    
    if (backupData.progress) {
      await set(ref(rtdb, `progress/${userId}`), backupData.progress);
    }
    
    return true;
  } catch (error) {
    console.error("Error restoring from backup:", error);
    throw error;
  }
};

export { rtdb };
