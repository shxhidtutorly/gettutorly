// src/hooks/useUser.ts
import { useFirebaseAuth } from './useFirebaseAuth';

export const useUser = () => {
  const { user } = useFirebaseAuth();

  return {
    user, // may be null
  };
};
