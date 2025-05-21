
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<any | null>;
  signIn: (email?: string, password?: string) => Promise<any | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile?: (userData: { name?: string; avatar_url?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create a dummy authentication state that's always "authenticated"
  const [loading, setLoading] = useState(false);
  
  // Dummy auth methods that don't actually authenticate
  const dummyAuth = {
    currentUser: { id: 'temp-user-id', email: 'temp@example.com' } as User,
    loading: false,
    signUp: async () => null,
    signIn: async () => {
      // Just return a successful result without actual authentication
      return { id: 'temp-user-id', email: 'temp@example.com' } as User;
    },
    signOut: async () => {
      // Do nothing for now
    },
    resetPassword: async () => true,
    updateUserProfile: async () => true
  };

  return <AuthContext.Provider value={dummyAuth}>{children}</AuthContext.Provider>;
};
