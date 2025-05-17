
import React, { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any;
  loading: boolean;
  authError: string | null;
  signIn: () => Promise<User | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<User | null>;
  emailSignIn: (email: string, password: string) => Promise<User | null>;
  phoneAuth: {
    setupRecaptcha: (elementId: string) => any;
    sendVerificationCode: (phoneNumber: string) => Promise<any>;
    verifyCode: (code: string) => Promise<User | null>;
  };
  forgotPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useFirebaseAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
