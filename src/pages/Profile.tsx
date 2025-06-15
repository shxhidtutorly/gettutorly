
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  School,
  BookOpen,
  Award,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  Globe,
  ArrowLeft
} from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: "",
    location: "",
    school: "",
    grade: "",
    subjects: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Initialize profile data with user information
    setProfileData({
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || "",
      bio: user.user_metadata?.bio || "",
      location: user.user_metadata?.location || "",
      school: user.user_metadata?.school || "",
      grade: user.user_metadata?.grade || "",
      subjects: user.user_metadata?.subjects || []
    });
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user?.user_metadata,
          ...profileData
        }
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-6 mb-2 px-4 animate-fade-in">
        <Button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21253a] hover:bg-[#262a42] transition font-semibold shadow border border-[#21253a] text-white"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-[#21253a] border-[#35357a] overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="relative -mt-16">
                    <Avatar className="w-24 h-24 border-4 border-[#21253a]">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl">
                        {getInitials(profileData.displayName || user.email?.split('@')[0] || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                          {profileData.displayName || user.email?.split('@')[0]}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            ✓ Verified
                          </Badge>
                          <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                            Student
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "outline" : "default"}
                        className={isEditing ? "border-[#35357a] text-gray-300" : "bg-purple-600 hover:bg-purple-700"}
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-[#21253a] border-[#35357a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5 text-purple-400" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                          disabled={!isEditing}
                          className="bg-[#2a2a3e] border-[#35357a] text-white disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input
                          id="email"
                          value={user.email || ""}
                          disabled
                          className="bg-[#2a2a3e] border-[#35357a] text-white opacity-70"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        className="bg-[#2a2a3e] border-[#35357a] text-white disabled:opacity-70 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location" className="text-gray-300">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          disabled={!isEditing}
                          placeholder="City, Country"
                          className="bg-[#2a2a3e] border-[#35357a] text-white disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <Label htmlFor="school" className="text-gray-300">School</Label>
                        <Input
                          id="school"
                          value={profileData.school}
                          onChange={(e) => setProfileData({...profileData, school: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Your school name"
                          className="bg-[#2a2a3e] border-[#35357a] text-white disabled:opacity-70"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSave}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="border-[#35357a] text-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Account Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-[#21253a] border-[#35357a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#2a2a3e] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Security</p>
                          <p className="text-sm text-gray-400">Manage password and 2FA</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#35357a] text-gray-300">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-[#2a2a3e] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-white font-medium">Notifications</p>
                          <p className="text-sm text-gray-400">Email and push preferences</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#35357a] text-gray-300">
                        Manage
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-[#2a2a3e] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Privacy</p>
                          <p className="text-sm text-gray-400">Control who sees your data</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#35357a] text-gray-300">
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Study Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-[#21253a] border-[#35357a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      Study Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">247</div>
                      <div className="text-sm text-gray-400">Hours Studied</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-white">45</div>
                        <div className="text-xs text-gray-400">Notes Created</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">23</div>
                        <div className="text-xs text-gray-400">Quizzes Taken</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-[#21253a] border-[#35357a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-[#2a2a3e] rounded-lg">
                      <div className="text-xl">🏆</div>
                      <div>
                        <p className="text-sm font-medium text-white">Quiz Master</p>
                        <p className="text-xs text-gray-400">Completed 10 quizzes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#2a2a3e] rounded-lg">
                      <div className="text-xl">📚</div>
                      <div>
                        <p className="text-sm font-medium text-white">Note Taker</p>
                        <p className="text-xs text-gray-400">Created 50 notes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#2a2a3e] rounded-lg">
                      <div className="text-xl">🔥</div>
                      <div>
                        <p className="text-sm font-medium text-white">Study Streak</p>
                        <p className="text-xs text-gray-400">7 days in a row</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sign Out */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Sign Out
                </Button>
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
