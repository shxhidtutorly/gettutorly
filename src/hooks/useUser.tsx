
import { useFirebaseAuth } from './useFirebaseAuth';

// This hook replaces the Clerk useUser hook
export const useUser = () => {
  const { user, loading } = useFirebaseAuth();
  
  return {
    user: user ? {
      id: user.uid,
      email: user.email,
      fullName: user.displayName,
      imageUrl: user.photoURL,
      emailVerified: user.emailVerified
    } : null,
    isLoaded: !loading,
    isSignedIn: !!user
  };
};

// For backward compatibility with existing code that uses useClerk
export const useClerk = () => {
  const { signOut } = useFirebaseAuth();
  
  return {
    signOut
  };
};
