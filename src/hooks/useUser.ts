// src/hooks/useUser.ts
import { useAuth } from '@/contexts/AuthContext';

export const useUser = () => {
  const { user, loading, isLoaded } = useAuth();

  return {
    user, // AuthUser | null
    isLoaded, // boolean
    isSignedIn: !!user,
    loading
  };
};
