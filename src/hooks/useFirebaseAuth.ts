import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { doc, getDoc } from 'firebase/firestore';

// IMPORTANT: Assuming you have a separate file for Firebase initialization
// and export the auth and db instances from there.
import { auth, db } from '@/lib/firebase';
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
  const navigate = useNavigate();

  // New async function to check for a subscription in Firestore
  const checkSubscriptionStatus = async (uid: string) => {
    if (!db) return false;
    try {
      const subscriptionDocRef = doc(db, 'subscriptions', uid);
      const docSnap = await getDoc(subscriptionDocRef);
      // A subscription exists if the document exists and the status is active
      return docSnap.exists() && docSnap.data()?.status === 'active';
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  };

  // Helper function to handle redirection based on subscription status
  const handleRedirect = async (currentUser: User) => {
    if (!currentUser) return;
    const hasSubscription = await checkSubscriptionStatus(currentUser.uid);
    if (hasSubscription) {
      navigate("/dashboard");
    } else {
      navigate("/pricing");
    }
  };

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
        // Check subscription status and redirect for existing users on load
        void handleRedirect(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Signed in successfully!"
      });
      // Handle redirect after successful sign-in
      await handleRedirect(result.user);
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
      // Handle redirect after successful sign-up
      await handleRedirect(result.user);
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
      // Handle redirect after successful sign-in
      await handleRedirect(result.user);
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
      navigate('/login'); // Redirect to login page after sign out
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

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) {
      throw new Error('No user email available');
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
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

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      await updateProfile(auth.currentUser, updates);

      setUser(prev => prev ? {
        ...prev,
        displayName: updates.displayName || prev.displayName,
        photoURL: updates.photoURL || prev.photoURL,
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

export default useFirebaseAuth;
