// lib/firebaseSecure.js (or wherever you define this service)
import { auth, db } from '@/lib/firebase'; // Ensure this path is correct
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
      console.error("Unauthenticated operation blocked: User not logged in.");
      return false;
    }
    return true;
  }

  /**
   * Securely writes data to a specific document path.
   * Automatically adds userId and timestamp.
   * @param path The document path (e.g., 'users/userId/profile').
   * @param data The data to set.
   * @returns Promise<boolean> True if successful, false otherwise.
   */
  async secureWrite(path: string, data: any): Promise<boolean> {
    if (!this.validateAuth()) return false;

    try {
      // FIX: Use spread segments to ensure even segments for Firestore doc references
      const segments = path.split('/');
      const docRef = doc(db, segments[0], segments[1], ...(segments.slice(2) as [string, ...string[]]));
      await setDoc(docRef, {
        ...data,
        userId: this.currentUser.uid,
        timestamp: Timestamp.now()
      });
      console.log(`Document written to: ${path}`);
      return true;
    } catch (error: any) {
      console.error("Firestore Write Error:", error.message);
      throw error; // Re-throw to allow calling code to handle it
    }
  }

  /**
   * Securely reads a single document from a specific path.
   * @param path The document path (e.g., 'users/userId/profile').
   * @returns Promise<any | null> The document data with its ID, or null if not found/unauthenticated.
   */
  async secureRead(path: string): Promise<any | null> {
    if (!this.validateAuth()) return null;

    try {
      // FIX: Use spread segments to ensure even segments for Firestore doc references
      const segments = path.split('/');
      const docRef = doc(db, segments[0], segments[1], ...(segments.slice(2) as [string, ...string[]]));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`Document read from: ${path}`);
        return { id: docSnap.id, ...docSnap.data() };
      }
      console.log(`Document not found at: ${path}`);
      return null;
    } catch (error: any) {
      console.error("Firestore Read Error:", error.message);
      throw error; // Re-throw to allow calling code to handle it
    }
  }

  /**
   * Securely adds a new document to a collection.
   * Automatically adds userId and timestamp.
   * @param collectionPath The collection path (e.g., 'notes').
   * @param data The data for the new document.
   * @returns Promise<string | null> The ID of the new document, or null if unauthenticated.
   */
  async secureAdd(collectionPath: string, data: any): Promise<string | null> {
    if (!this.validateAuth()) return null;

    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        userId: this.currentUser.uid,
        timestamp: Timestamp.now()
      });
      console.log(`Document added to collection ${collectionPath} with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error: any) {
      console.error("Firestore Add Error:", error.message);
      throw error; // Re-throw to allow calling code to handle it
    }
  }

  /**
   * Securely queries a collection for documents belonging to the current user.
   * @param collectionPath The collection path.
   * @param conditions Optional array of query conditions (e.g., where(), orderBy()).
   * @returns Promise<any[]> An array of documents (with IDs), or an empty array if unauthenticated/error.
   */
  async secureQuery(collectionPath: string, conditions: any[] = []): Promise<any[]> {
    if (!this.validateAuth()) return [];

    try {
      const q = query(
        collection(db, collectionPath),
        where("userId", "==", this.currentUser.uid),
        ...conditions
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`Query successful for ${collectionPath}. Found ${data.length} documents.`);
      return data;
    } catch (error: any) {
      console.error("Firestore Query Error:", error.message);
      return []; // Return empty array on error for queries
    }
  }

  /**
   * Subscribes to real-time updates for user-specific data in a collection.
   * @param collectionPath The collection path.
   * @param callback A function to be called with the updated data.
   * @returns A function to unsubscribe from the listener.
   */
  subscribeToUserData(collectionPath: string, callback: (data: any[]) => void): () => void {
    if (!this.validateAuth()) {
      console.warn("Unauthenticated: Cannot subscribe to user data.");
      return () => {}; // Return a no-op unsubscribe function
    }

    const q = query(
      collection(db, collectionPath),
      where("userId", "==", this.currentUser.uid),
      orderBy("timestamp", "desc")
    );

    console.log(`Subscribing to real-time updates for ${collectionPath}.`);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error("Firestore Subscription Error:", error.message);
    });
  }

  /**
   * Returns the current authenticated user object.
   * @returns The Firebase User object, or null if not authenticated.
   */
  getCurrentUser(): any | null {
    return this.currentUser;
  }
}

export const firebaseSecure = new FirebaseSecureService();
