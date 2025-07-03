
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { firebaseSecure } from "@/lib/firebase-secure";
import { 
  updatePassword,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  updateEmail
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Check, 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Settings,
  CreditCard,
  Shield,
  Trash2
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  gender: string;
  role: string;
  created_at: any;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

const Profile = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "other",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        let userProfile = await firebaseSecure.secureRead(`users/${user.uid}`);
        
        if (!userProfile) {
          // Create default profile
          userProfile = {
            name: user.displayName || user.email?.split('@')[0] || '',
            email: user.email || '',
            gender: 'other',
            role: 'student',
            created_at: new Date(),
          };
          await firebaseSecure.secureWrite(`users/${user.uid}`, userProfile);
        }

        // Load subscription data
        const subscription = await firebaseSecure.secureRead(`subscriptions/${user.uid}`);
        if (subscription) {
          userProfile.subscription = subscription;
        }

        setProfile(userProfile);
        setFormData({
          name: userProfile.name,
          gender: userProfile.gender,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setUpdating(true);
    try {
      await firebaseSecure.secureWrite(`users/${user.uid}`, {
        ...profile,
        name: formData.name,
        gender: formData.gender,
        updated_at: new Date(),
      });

      // Update Firebase Auth profile
      if (user && formData.name !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.name
        });
      }

      setProfile({
        ...profile,
        name: formData.name,
        gender: formData.gender,
      });

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Sent",
        description: "Check your email for password reset instructions"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAvatarIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '📚';
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      'free': 'bg-gray-600',
      'pro': 'bg-blue-600',
      'premium': 'bg-purple-600'
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <User className="h-8 w-8 text-purple-400" />
              Your Profile
            </h1>
            <p className="text-gray-400">Manage your account details and preferences</p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card className="bg-[#121212] border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={updating}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                    ) : isEditing ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24 border-2 border-purple-500">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="bg-purple-600 text-white text-2xl">
                        {getAvatarIcon(profile?.gender || 'other')}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-[#1A1A1A] border-slate-600 text-white disabled:opacity-70"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email Address</Label>
                    <Input
                      value={profile?.email || ''}
                      disabled
                      className="bg-[#1A1A1A] border-slate-600 text-gray-400"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-[#1A1A1A] border-slate-600 text-white disabled:opacity-70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-slate-600">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Role</Label>
                    <Input
                      value={profile?.role || 'Student'}
                      disabled
                      className="bg-[#1A1A1A] border-slate-600 text-gray-400"
                    />
                  </div>

                  {/* Created Date */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Member Since</Label>
                    <Input
                      value={profile?.created_at ? new Date(profile.created_at.toDate ? profile.created_at.toDate() : profile.created_at).toLocaleDateString() : 'N/A'}
                      disabled
                      className="bg-[#1A1A1A] border-slate-600 text-gray-400"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription & Actions */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <Card className="bg-[#121212] border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.subscription ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Plan</span>
                        <Badge className={`${getPlanBadge(profile.subscription.plan)} text-white`}>
                          {profile.subscription.plan.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Status</span>
                        <Badge variant={profile.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {profile.subscription.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Expires: {new Date(profile.subscription.endDate).toLocaleDateString()}</p>
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">No active subscription</p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="bg-[#121212] border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-white border-slate-600 hover:bg-slate-800"
                    onClick={handlePasswordReset}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Reset Password
                  </Button>
                </CardContent>
              </Card>
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
