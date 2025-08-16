import { ref, get, set, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface UserPreferences {
  language: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email: boolean;
    push: boolean;
  };
  aiSettings?: {
    preferredModel: string;
    autoTranslate: boolean;
  };
}

export class FirebaseUserPreferences {
  private static instance: FirebaseUserPreferences;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): FirebaseUserPreferences {
    if (!FirebaseUserPreferences.instance) {
      FirebaseUserPreferences.instance = new FirebaseUserPreferences();
    }
    return FirebaseUserPreferences.instance;
  }

  /**
   * Get user preferences from Firestore
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userDoc = doc(db, 'users', userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.preferences || { language: 'en' };
      }
      
      return { language: 'en' };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { language: 'en' };
    }
  }

  /**
   * Update user preferences in Firestore
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const userDoc = doc(db, 'users', userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedPreferences = {
          ...userData.preferences,
          ...preferences
        };
        
        await setDoc(userDoc, {
          ...userData,
          preferences: updatedPreferences
        }, { merge: true });
      } else {
        // Create new user document with preferences
        await setDoc(userDoc, {
          preferences: { language: 'en', ...preferences }
        });
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Update language preference specifically
   */
  async updateLanguage(userId: string, language: string): Promise<void> {
    await this.updateUserPreferences(userId, { language });
  }

  /**
   * Listen to user preferences changes in real-time
   */
  onUserPreferencesChange(userId: string, callback: (preferences: UserPreferences) => void): () => void {
    const userDoc = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const preferences = userData.preferences || { language: 'en' };
        callback(preferences);
      } else {
        callback({ language: 'en' });
      }
    }, (error) => {
      console.error('Error listening to user preferences:', error);
      callback({ language: 'en' });
    });

    // Store the unsubscribe function
    this.listeners.set(userId, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.listeners.delete(userId);
    };
  }

  /**
   * Clean up all listeners
   */
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      language: 'en',
      theme: 'auto',
      notifications: {
        email: true,
        push: true
      },
      aiSettings: {
        preferredModel: 'gemini',
        autoTranslate: true
      }
    };
  }
}

export const userPreferencesService = FirebaseUserPreferences.getInstance();
