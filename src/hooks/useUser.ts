// src/hooks/useUser.ts
import { useFirebaseAuth } from './useFirebaseAuth';

export const useUser = () => {
  const { user, loading, isAuthenticated } = useFirebaseAuth();

  return {
    user,
    isLoaded: !loading,
    isSignedIn: isAuthenticated,
  };
};
