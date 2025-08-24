import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
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
  Camera,
  LogOut,
  Globe,
  CircleCheck,
} from "lucide-react";

// Assuming you have a ThemeContext to get/set the theme
import { useTheme } from "@/contexts/ThemeContext";

// Utility function to map language codes to flag emojis
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Supported languages with flag country codes
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: getFlagEmoji('us') },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: getFlagEmoji('es') },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: getFlagEmoji('fr') },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: getFlagEmoji('de') },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: getFlagEmoji('pt') },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: getFlagEmoji('it') },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: getFlagEmoji('ru') },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: getFlagEmoji('jp') },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: getFlagEmoji('sa') },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: getFlagEmoji('in') },
];

// --- Interfaces ---
interface UserProfile {
  name: string;
  email: string;
  photoURL: string | null;
  gender: 'male' | 'female' | 'other';
  role: string;
  createdAt: Timestamp;
}

// --- Main Profile and Settings Component ---
const ProfileAndSettings = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // State Management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: "", gender: "other" as UserProfile['gender'] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (authLoading || subLoading) return;

    const loadData = async () => {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userProfileData: UserProfile;

        if (userDocSnap.exists()) {
          userProfileData = userDocSnap.data() as UserProfile;
        } else {
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
        console.error('Error loading data:', error);
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, subLoading, toast]);

  // --- Handlers for Profile Updates ---
  const handleSave = async () => {
    if (!user || !profile) return;
    setUpdating(true);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = { name: formData.name.trim(), gender: formData.gender };
      await setDoc(userDocRef, updatedData, { merge: true });

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
        
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        
        await updateProfile(user, { photoURL });
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
  if (authLoading || subLoading || loading) {
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
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">No user profile found.</div>;
  }
  
  const neonColors = {
    pink: 'border-pink-500 text-pink-500 shadow-[4px_4px_0px_#ec4899]',
    yellow: 'border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#facc15]',
    cyan: 'border-cyan-400 text-cyan-400 shadow-[4px_4px_0px_#00e6c4]',
  };
  
  const formatDate = (date: string | Date) => {
    try {
        return new Date(date).toLocaleDateString();
    } catch (e) {
        return "N/A";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-mono">
      <Navbar />
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <Settings className="h-10 w-10 text-pink-500" />
              Account Settings
            </h1>
            <p className="text-gray-400">Manage your profile, subscription, and preferences.</p>
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* --- Left Column: Profile & Subscription --- */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Details Card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className={`bg-gray-900 border-2 rounded-none p-6 ${neonColors.pink}`}>
                  <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-2"><User className="h-6 w-6" /> Account Information</CardTitle>
                    <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={updating} className={`bg-pink-500 text-black border-2 border-pink-400 hover:bg-pink-400 rounded-none font-black transition-all duration-200 shadow-[4px_4px_0px_#ec4899] h-10 px-4`}>
                      {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? <Check className="h-5 w-5" /> : <Edit className="h-5 w-5" />)}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-28 w-28 border-4 border-gray-700">
                          <AvatarImage src={profile.photoURL || ''} alt={profile.name} />
                          <AvatarFallback className="bg-gray-800 text-pink-500 text-4xl font-black">{profile.name?.[0]?.toUpperCase()}</AvatarFallback>
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
                        <Input id="member-since" value={profile.createdAt?.toDate().toLocaleDateString() || 'N/A'} disabled className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg text-gray-500"/>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subscription Card */}
              <AnimatePresence mode="wait">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className={`bg-gray-900 border-2 rounded-none p-6 ${subscription?.status === 'active' ? neonColors.cyan : neonColors.yellow}`}>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-2xl font-black text-white flex items-center gap-2"><Crown className="h-6 w-6" /> Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      {subscription && subscription.status === 'active' ? (
                        <>
                          <p className="text-sm text-gray-400">Your current plan is active and ready to use.</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-bold text-gray-400">Plan</Label>
                              <p className="text-xl font-bold text-white">{subscription.plan}</p>
                            </div>
                            <div>
                              <Label className="font-bold text-gray-400">Next Billing Date</Label>
                              <p className="text-xl font-bold text-white">{formatDate(subscription.endDate)}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button className="bg-cyan-500 text-black border-2 border-cyan-400 hover:bg-cyan-400 rounded-none font-black h-12 text-lg transition-all shadow-[4px_4px_0px_#00e6c4]">
                              Manage Subscription
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-400">You currently do not have an active subscription.</p>
                          <Button className="w-full mt-4 bg-yellow-400 text-black border-2 border-yellow-300 hover:bg-yellow-300 rounded-none font-black h-12 text-lg shadow-[4px_4px_0px_#facc15]">
                            Upgrade to Pro
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* --- Right Column: Preferences & Actions --- */}
            <div className="space-y-8">
              {/* Preferences Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className={`bg-gray-900 border-2 rounded-none p-6 ${neonColors.cyan}`}>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-2"><Globe className="h-6 w-6" /> Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <Label htmlFor="language" className="font-bold text-gray-400">Language</Label>
                      <Select>
                        <SelectTrigger className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg focus:border-pink-500">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-2 border-gray-600 rounded-none text-white font-mono">
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{lang.flag}</span>
                                <span className="text-sm">{lang.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="theme" className="font-bold text-gray-400">Theme</Label>
                      <Select value={theme} onValueChange={toggleTheme}>
                        <SelectTrigger className="bg-black border-2 border-gray-600 rounded-none mt-1 h-12 text-lg focus:border-pink-500">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-2 border-gray-600 rounded-none text-white font-mono">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Actions Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-gray-900 border-2 border-gray-700 rounded-none p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-2"><Shield className="h-6 w-6"/> Security & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <Button onClick={handlePasswordReset} variant="outline" className="w-full bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 hover:border-gray-500 rounded-none font-bold h-12 transition-all">
                      <Shield className="mr-2 h-4 w-4" /> Reset Password
                    </Button>
                    <Button onClick={signOut} variant="outline" className="w-full bg-transparent text-white border-2 border-gray-600 hover:bg-gray-800 hover:border-gray-500 rounded-none font-bold h-12 transition-all">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;
