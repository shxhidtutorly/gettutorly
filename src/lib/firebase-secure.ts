
import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

class FirebaseSecureService {
  private currentUser: any = null;

  constructor() {
    // Universal auth listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        console.log("User authenticated:", user.uid);
      } else {
        this.currentUser = null;
        console.warn("User not authenticated");
      }
    });
  }

  private validateAuth(): boolean {
    if (!this.currentUser || !this.currentUser.uid) {
      console.error("Unauthenticated operation blocked");
      return false;
    }
    return true;
  }

  async secureWrite(path: string, data: any) {
    if (!this.validateAuth()) return null;
    
    try {
      await setDoc(doc(db, path), {
        ...data,
        userId: this.currentUser.uid,
        timestamp: Timestamp.now()
      });
      return true;
    } catch (error: any) {
      console.error("Firestore Write Error:", error.message);
      throw error;
    }
  }

  async secureRead(path: string) {
    if (!this.validateAuth()) return null;
    
    try {
      const docSnap = await getDoc(doc(db, path));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error: any) {
      console.error("Firestore Read Error:", error.message);
      throw error;
    }
  }

  async secureAdd(collectionPath: string, data: any) {
    if (!this.validateAuth()) return null;
    
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        userId: this.currentUser.uid,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error: any) {
      console.error("Firestore Add Error:", error.message);
      throw error;
    }
  }

  async secureQuery(collectionPath: string, conditions: any[] = []) {
    if (!this.validateAuth()) return [];
    
    try {
      let q = query(
        collection(db, collectionPath),
        where("userId", "==", this.currentUser.uid),
        ...conditions
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      console.error("Firestore Query Error:", error.message);
      return [];
    }
  }

  subscribeToUserData(collectionPath: string, callback: (data: any[]) => void) {
    if (!this.validateAuth()) return () => {};
    
    const q = query(
      collection(db, collectionPath),
      where("userId", "==", this.currentUser.uid),
      orderBy("timestamp", "desc")
    );
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export const firebaseSecure = new FirebaseSecureService();
