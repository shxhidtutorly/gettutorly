
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  logOut, 
  getCurrentUser, 
  setupPhoneAuth,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  resetPassword,
  getAuthErrorMessage
} from "@/lib/auth";
import { createUserProfile, getUserProfile } from "@/lib/db";

export const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        // If user exists, fetch their profile
        if (user) {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Google Sign In
  const signIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const user = await signInWithGoogle();
      setCurrentUser(user);
      
      // Create/update user profile in Firestore
      if (user) {
        await createUserProfile(user.uid, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date().toISOString()
        });
        
        // Fetch the user profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
      
      toast({
        title: "Welcome!",
        description: `Signed in as ${user?.displayName || user?.email}`,
      });
      
      return user;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign in with Google";
      setAuthError(errorMessage);
      toast({
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      const user = await signUpWithEmail(email, password, displayName);
      setCurrentUser(user);
      
      // Create user profile in Firestore
      if (user) {
        await createUserProfile(user.uid, {
          displayName,
          email: user.email,
          role: "student",
          createdAt: new Date().toISOString()
        });
        
        // Fetch the user profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to Tutorly!",
      });
      
      return user;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign In
  const emailSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      const user = await signInWithEmail(email, password);
      setCurrentUser(user);
      
      // Update user profile in Firestore
      if (user) {
        await createUserProfile(user.uid, {
          lastLogin: new Date().toISOString()
        });
        
        // Fetch the user profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
      
      toast({
        title: "Welcome back!",
        description: `Signed in as ${user?.email}`,
      });
      
      return user;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Phone authentication
  const phoneAuth = {
    setupRecaptcha: (elementId: string) => {
      try {
        return setupPhoneAuth(elementId);
      } catch (error: any) {
        setAuthError(error.message);
        toast({
          title: "Setup failed",
          description: "Could not setup phone authentication.",
          variant: "destructive",
        });
        throw error;
      }
    },
    
    sendVerificationCode: async (phoneNumber: string) => {
      try {
        setLoading(true);
        setAuthError(null);
        const confirmationResult = await sendPhoneVerificationCode(phoneNumber);
        toast({
          title: "Verification code sent",
          description: "Please enter the code sent to your phone.",
        });
        return confirmationResult;
      } catch (error: any) {
        const errorMessage = getAuthErrorMessage(error);
        setAuthError(errorMessage);
        toast({
          title: "Verification failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    
    verifyCode: async (code: string) => {
      try {
        setLoading(true);
        setAuthError(null);
        const user = await verifyPhoneCode(code);
        setCurrentUser(user);
        
        // Create/update user profile
        if (user) {
          await createUserProfile(user.uid, {
            phoneNumber: user.phoneNumber,
            lastLogin: new Date().toISOString()
          });
          
          // Fetch the user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        }
        
        toast({
          title: "Phone verification successful",
          description: "You are now signed in.",
        });
        
        return user;
      } catch (error: any) {
        const errorMessage = getAuthErrorMessage(error);
        setAuthError(errorMessage);
        toast({
          title: "Verification failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };

  // Password reset
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      await resetPassword(email);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions.",
      });
      return true;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await logOut();
      setCurrentUser(null);
      setUserProfile(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign out";
      setAuthError(errorMessage);
      toast({
        title: "Sign out failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    userProfile,
    loading,
    authError,
    signIn,
    signUp,
    emailSignIn,
    phoneAuth,
    forgotPassword,
    signOut
  };
};
