
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// AUTHENTICATION HELPERS
export const signUpWithEmail = async (email: string, password: string, userData?: any) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    if (userData || user) {
      await createUserProfile(user.uid, {
        email: user.email,
        ...userData
      });
    }
    
    return { user };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  return auth.currentUser;
};

export const updateUserPassword = async (password: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await firebaseUpdatePassword(user, password);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// USER PROFILE HELPERS
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      role: userData.role || "student",
      created_at: new Date(),
      updated_at: new Date(),
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
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    // Return a default profile if none exists
    const defaultProfile = {
      id: userId,
      role: "student",
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return defaultProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
