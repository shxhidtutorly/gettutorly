import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Edit,
  Check,
  User,
  Crown,
  Settings,
  Shield,
  Loader2,
  Camera
} from "lucide-react";

// --- Interfaces ---
interface UserProfile {
  name: string;
  email: string;
  photoURL: string | null;
  gender: 'male' | 'female' | 'other';
  role: string;
  createdAt: Timestamp;
  subscription?: {
    plan: string;
    status: string;
    endDate: string;
  };
}

// --- Main Profile Component ---
const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { updateUserPassword, updateUserProfile } = useFirebaseAuth();
  const { toast } = useToast();
  
  // State Management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: "", gender: "other" as UserProfile['gender'] });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userProfileData: UserProfile;

        if (userDocSnap.exists()) {
          userProfileData = userDocSnap.data() as UserProfile;
        } else {
          // If no profile exists, create a default one
          userProfileData = {
            name: user.displayName || user.email?.split('@')[0] || 'New User',
            email: user.email || '',
            photoURL: user.photoURL || null,
            gender: 'other',
            role: 'student',
            createdAt: Timestamp.now(),
          };
          await setDoc(userDocRef, userProfileData);
        }
        
        setProfile(userProfileData);
        setFormData({
          name: userProfileData.name,
          gender: userProfileData.gender,
        });

      } catch (error) {
        console.error('Error loading profile:', error);
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
        
        // Set fallback profile data
        const fallbackProfile: UserProfile = {
          name: user.displayName || user.email?.split('@')[0] || 'New User',
          email: user.email || '',
          photoURL: user.photoURL || null,
          gender: 'other',
          role: 'student',
          createdAt: Timestamp.now(),
        };
        setProfile(fallbackProfile);
        setFormData({
          name: fallbackProfile.name,
          gender: fallbackProfile.gender,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading, toast]);

  // --- Handlers for Profile Updates ---
  const handleSave = async () => {
    if (!user || !profile) return;
    setUpdating(true);
    
    try {
      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = { name: formData.name.trim(), gender: formData.gender };
      await setDoc(userDocRef, updatedData, { merge: true });

      // Update Firebase Auth profile if name changed
      if (formData.name.trim() !== user.displayName) {
        await updateUserProfile({ displayName: formData.name.trim() });
      }

      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Update Failed", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File", description: "Please select an image.", variant: "destructive" });
        return;
    }
    setUpdating(true);

    try {
        const storage = getStorage();
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        
        // Upload file
        await uploadBytes(storageRef, file);
        
        // Get download URL
        const photoURL = await getDownloadURL(storageRef);
        
        // Update Auth profile
        await updateUserProfile({ photoURL });

        // Update Firestore document
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { photoURL }, { merge: true });

        setProfile(prev => prev ? { ...prev, photoURL } : null);
        toast({ title: "Profile Picture Updated!" });

    } catch (error) {
        console.error("Image upload error:", error);
        toast({ title: "Upload Failed", description: "Could not update profile picture.", variant: "destructive" });
    } finally {
        setUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(user.email);
      toast({ title: "Password Reset Sent", description: "Check your email for instructions." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // New password update handler
  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: "Error", description: "Please fill in all password fields", variant: "destructive" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long", variant: "destructive" });
      return;
    }

    setUpdating(true);
    try {
      const result = await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      if (!result.error) {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      }
    } catch (error) {
      console.error('Password update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  // --- UI and Loading States ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center font-mono">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-400">Unable to load profile data.</p>
        </div>
      </div>
    );
  }
  
  const neonColors = {
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
    cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00f7ff]',
    green: 'border-green-400 text-green-400 shadow-[4px_4px_0px_#22c55e]',
    purple: 'border-purple-500 text-purple-500 shadow-[4px_4px_0px_#a855f7]',
    blue: 'border-blue-500 text-blue-500 shadow-[4px_4px_0px_#3b82f6]'
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <Card className={`${neonColors.pink} bg-black border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto mb-4">
                      <AvatarImage src={profile.photoURL || undefined} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-500 to-purple-500">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updating}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                      variant="outline"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Click the camera icon to update your profile picture
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className={`${neonColors.cyan} bg-black border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing || updating}
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: UserProfile['gender']) => 
                          setFormData(prev => ({ ...prev, gender: value }))
                        }
                        disabled={!isEditing || updating}
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-800 border-gray-600 text-gray-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: profile.name,
                              gender: profile.gender,
                            });
                          }}
                          variant="outline"
                          disabled={updating}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Password Management */}
              <Card className={`${neonColors.yellow} bg-black border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Password Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showPasswordForm ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          disabled={updating}
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          disabled={updating}
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          disabled={updating}
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePasswordUpdate}
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Update Password
                        </Button>
                        <Button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          }}
                          variant="outline"
                          disabled={updating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-400 text-sm">
                        Keep your account secure by regularly updating your password.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowPasswordForm(true)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Change Password
                        </Button>
                        <Button
                          onClick={handlePasswordReset}
                          variant="outline"
                        >
                          Reset Password
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className={`${neonColors.purple} bg-black border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Role</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="capitalize">{profile.role}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <div className="mt-1 text-gray-400">
                        {profile.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {profile.subscription && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Subscription</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Plan:</span>
                          <span className="ml-2 capitalize">{profile.subscription.plan}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className={`ml-2 capitalize ${
                            profile.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {profile.subscription.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expires:</span>
                          <span className="ml-2">{profile.subscription.endDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;
