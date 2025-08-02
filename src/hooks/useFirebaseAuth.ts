import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Signed in successfully!"
      });
      return { user: result.user, error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      toast({
        title: "Success",
        description: "Account created successfully!"
      });
      return { user: result.user, error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      toast({
        title: "Success",
        description: "Signed in with Google successfully!"
      });
      return { user: result.user, error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset",
        description: "Check your email for password reset instructions"
      });
      return { error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  // New function to update password with re-authentication
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) {
      throw new Error('No user email available');
    }

    try {
      setLoading(true);
      
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      
      // Update password
      await updatePassword(auth.currentUser!, newPassword);
      
      toast({
        title: "Success",
        description: "Password updated successfully!"
      });
      
      return { error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast({
        title: "Password Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // New function to update profile
  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      await updateProfile(auth.currentUser, updates);
      
      // Update local state
      setUser(prev => prev ? {
        ...prev,
        displayName: updates.displayName || prev.displayName,
        photoURL: updates.photoURL || prev.photoURL
      } : null);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      return { error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast({
        title: "Profile Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly error messages
  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to perform this action.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    isAuthenticated: !!user
  };
};
