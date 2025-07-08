
import { 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  DocumentReference, 
  CollectionReference,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Global variables for Canvas environment
const getAppId = () => {
  return typeof window !== 'undefined' && (window as any).__app_id 
    ? (window as any).__app_id 
    : 'default-app-id';
};

// Helper to get user document reference
export function getUserDoc<T = any>(userId: string, path: string): DocumentReference<T> {
  const appId = getAppId();
  return doc(db, `artifacts/${appId}/users/${userId}/${path}`) as DocumentReference<T>;
}

// Helper to get user collection reference  
export function getUserCollection<T = any>(userId: string, collectionName: string): CollectionReference<T> {
  const appId = getAppId();
  return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`) as CollectionReference<T>;
}

// Helper to get app-level collection (for shared data)
export function getAppCollection<T = any>(collectionName: string): CollectionReference<T> {
  const appId = getAppId();
  return collection(db, `artifacts/${appId}/${collectionName}`) as CollectionReference<T>;
}

// Helper to remove undefined fields from objects
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value;
    }
  }
  return cleaned;
}

// Safe setDoc that removes undefined fields
export async function safeSetDoc<T>(
  ref: DocumentReference<T>, 
  data: Partial<T>, 
  options?: { merge?: boolean }
) {
  const cleanData = removeUndefined(data);
  return setDoc(ref, cleanData as T, options);
}

// Safe addDoc that removes undefined fields
export async function safeAddDoc<T>(
  ref: CollectionReference<T>, 
  data: T
) {
  const cleanData = removeUndefined(data as Record<string, any>);
  return addDoc(ref, cleanData as T);
}

// Safe updateDoc that removes undefined fields
export async function safeUpdateDoc<T>(
  ref: DocumentReference<T>, 
  data: Partial<T>
) {
  const cleanData = removeUndefined(data);
  return updateDoc(ref, cleanData);
}

// Export Timestamp for convenience
export { Timestamp };
