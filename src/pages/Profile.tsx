import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase"; // Assuming you export db from firebase config
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '@/lib/firebase';
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
  const { toast } = useToast();
  
  // State Management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: "", gender: "other" as UserProfile['gender'] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      // Optionally navigate to sign-in page
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        // Correctly reference the user's document in the 'users' collection
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
        await updateProfile(user, { displayName: formData.name.trim() });
      }

      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Update Failed", variant: "destructive" });
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
        await updateProfile(user, { photoURL });

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
      await sendPasswordResetEmail(auth, user.email);
      toast({ title: "Password Reset Sent", description: "Check your email for instructions." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  if (!user || !profile) {
    // This can be a redirect to a login page or a proper message
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">No user profile found.</div>;
  }
  
  const neonColors = {
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <User className="h-10 w-10 text-pink-500" />
              Profile Settings
            </h1>
            <p className="text-gray-400">Manage your account details and preferences.</p>
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* --- Profile Details Card (Left) --- */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <Card className={`bg-gray-900 border-2 rounded-none p-6 ${neonColors.pink}`}>
                <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
                  <CardTitle className="text-2xl font-black text-white">Account Information</CardTitle>
                  <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={updating} className={`bg-pink-500 text-black border-2 border-pink-400 hover:bg-pink-400 rounded-none font-black transition-all duration-200 shadow-[4px_4px_0px_#ec4899] h-10 px-4`}>
                    {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />)}
                  </Button>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-4 border-gray-700">
                        <AvatarImage src={profile.photoURL || ''} alt={profile.name} />
                        <AvatarFallback className="bg-gray-800 text-pink-500 text-4xl font-black">
                          {profile.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 h-8 w-8 p-0 bg-white text-black rounded-none border-2 border-black hover:bg-gray-200">
                          <Camera size={16}/>
                        </Button>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                    </div>
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <Label htmlFor="name" className="font-bold text-gray-400">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} disabled={!isEditing} className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg focus:border-pink-500"/>
                        </div>
                        <div>
                            <Label htmlFor="email" className="font-bold text-gray-400">Email</Label>
                            <Input id="email" value={profile.email} disabled className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg text-gray-500"/>
                        </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="gender" className="font-bold text-gray-400">Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({ ...p, gender: v as any }))} disabled={!isEditing}>
                            <SelectTrigger className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg focus:border-pink-500"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-black border-2 border-gray-600 rounded-none text-white font-mono"><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="member-since" className="font-bold text-gray-400">Member Since</Label>
                        {/* THE FIX IS HERE */}
                        <Input id="member-since" value={profile.createdAt?.toDate().toLocaleDateString() || 'N/A'} disabled className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg text-gray-500"/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* --- Subscription & Actions (Right) --- */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
              <Card className={`bg-gray-900 border-2 rounded-none p-6 ${neonColors.yellow}`}>
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl font-black text-white flex items-center gap-2"><Crown className="text-yellow-400"/> Subscription</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-center text-gray-400">No active subscription.</div>
                    <Button className="w-full mt-4 bg-yellow-400 text-black border-2 border-yellow-300 hover:bg-yellow-300 rounded-none font-black h-12 text-lg">Upgrade to Pro</Button>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-2 border-gray-700 rounded-none p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl font-black text-white flex items-center gap-2"><Settings/> Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Button onClick={handlePasswordReset} variant="outline" className="w-full bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 hover:border-gray-500 rounded-none font-bold h-12">
                      <Shield className="mr-2 h-4 w-4" /> Reset Password
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;
