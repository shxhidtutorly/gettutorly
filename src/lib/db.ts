
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  Timestamp, 
  DocumentData,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";

// User profile operations
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      role: userData.role || "student", // Default role
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: role,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Admin-specific functions
export const isUserAdmin = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() && userDoc.data()?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Summary operations
export const saveSummary = async (userId: string, summaryData: any) => {
  try {
    const summaryRef = await addDoc(collection(db, "summaries"), {
      userId,
      ...summaryData,
      createdAt: serverTimestamp(),
    });
    return summaryRef.id;
  } catch (error) {
    console.error("Error saving summary:", error);
    throw error;
  }
};

export const getUserSummaries = async (userId: string) => {
  try {
    const q = query(collection(db, "summaries"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user summaries:", error);
    throw error;
  }
};

export const deleteSummary = async (summaryId: string) => {
  try {
    await deleteDoc(doc(db, "summaries", summaryId));
    return true;
  } catch (error) {
    console.error("Error deleting summary:", error);
    throw error;
  }
};

// Study resources operations
export const addStudyResource = async (resourceData: any) => {
  try {
    const resourceRef = await addDoc(collection(db, "resources"), {
      ...resourceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return resourceRef.id;
  } catch (error) {
    console.error("Error adding study resource:", error);
    throw error;
  }
};

export const getStudyResources = async (constraints: QueryConstraint[] = []) => {
  try {
    const resourcesQuery = query(collection(db, "resources"), ...constraints);
    const querySnapshot = await getDocs(resourcesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting study resources:", error);
    throw error;
  }
};

export const subscribeToCollection = (collectionPath: string, callback: (data: DocumentData[]) => void, ...queryConstraints: QueryConstraint[]) => {
  const q = query(collection(db, collectionPath), ...queryConstraints);
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

export { db };
