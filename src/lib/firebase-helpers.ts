
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  DocumentReference,
  CollectionReference,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Remove undefined fields from objects before writing to Firestore
export function removeUndefined<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Get a reference to a user's document
export function getUserDoc<T = any>(uid: string, path: string): DocumentReference<T> {
  return doc(db, `users/${uid}/${path}`) as DocumentReference<T>;
}

// Get a reference to a user's collection
export function getUserCollection<T = any>(uid: string, collectionPath: string): CollectionReference<T> {
  return collection(db, `users/${uid}/${collectionPath}`) as CollectionReference<T>;
}

// Safely set a document with undefined field removal
export async function safeSetDoc<T extends Record<string, any>>(
  ref: DocumentReference<T>, 
  data: Partial<T>,
  options?: { merge?: boolean }
): Promise<void> {
  const cleanData = removeUndefined({
    ...data,
    updatedAt: Timestamp.now()
  });
  return setDoc(ref, cleanData as Partial<T>, options || { merge: true });
}

// Safely add a document with undefined field removal
export async function safeAddDoc<T extends Record<string, any>>(
  ref: CollectionReference<T>, 
  data: T
): Promise<string> {
  const cleanData = removeUndefined({
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  const docRef = await addDoc(ref, cleanData as T);
  return docRef.id;
}

// Safely update a document with undefined field removal
export async function safeUpdateDoc<T extends Record<string, any>>(
  ref: DocumentReference<T>, 
  data: Partial<T>
): Promise<void> {
  const cleanData = removeUndefined({
    ...data,
    updatedAt: Timestamp.now()
  });
  return updateDoc(ref, cleanData);
}

// Get user's documents from a collection with proper authentication check
export async function getUserDocs<T = any>(
  uid: string, 
  collectionPath: string,
  conditions: any[] = []
): Promise<T[]> {
  try {
    const q = query(
      getUserCollection<T>(uid, collectionPath),
      ...conditions
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  } catch (error) {
    console.error(`Error fetching user docs from ${collectionPath}:`, error);
    return [];
  }
}

// Subscribe to user's documents with proper authentication
export function subscribeToUserDocs<T = any>(
  uid: string,
  collectionPath: string,
  callback: (docs: T[]) => void,
  conditions: any[] = []
): () => void {
  try {
    const q = query(
      getUserCollection<T>(uid, collectionPath),
      orderBy('createdAt', 'desc'),
      ...conditions
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(docs);
    }, (error) => {
      console.error(`Error subscribing to ${collectionPath}:`, error);
      callback([]);
    });
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionPath}:`, error);
    return () => {};
  }
}
