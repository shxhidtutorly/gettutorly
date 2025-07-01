
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

// This hook replaces the Clerk useUser hook with Firebase Auth
export const useUser = () => {
  const [firebaseUser, loading, error] = useAuthState(auth);
  
  return {
    user: firebaseUser ? {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName,
      imageUrl: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified
    } : null,
    isLoaded: !loading,
    isSignedIn: !!firebaseUser,
    loading,
    error
  };
};

// For backward compatibility
export const useClerk = () => {
  const { signOut } = useFirebaseAuth();
  
  return {
    signOut
  };
};

// Import the Firebase auth hook
import { useFirebaseAuth } from './useFirebaseAuth';
