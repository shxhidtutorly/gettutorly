
import { useFirebaseAuth, AuthUser } from './useFirebaseAuth';

export const useUser = () => {
  const { user, loading, isLoaded } = useFirebaseAuth();

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    loading
  };
};

// For backward compatibility
export const useClerk = () => {
  const { signOut } = useFirebaseAuth();
  
  return {
    signOut
  };
};
