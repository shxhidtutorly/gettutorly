// src/hooks/useUser.ts
import { useFirebaseAuth } from './useFirebaseAuth';

export const useUser = () => {
  const { user, loading } = useFirebaseAuth();

  return {
    user, // may be null
    isLoaded: !loading,
    isSignedIn: !!user,
    loading
  };
};
