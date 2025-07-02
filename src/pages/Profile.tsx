import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useRealtimeDB } from "@/hooks/useRealtimeDB";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Check, User, Mail, Calendar, Book } from "lucide-react";

const Profile = () => {
  const { user } = useUser();
  const { getUserProfile, updateUserProfile, isLoading } = useRealtimeDB();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setFullName(userProfile?.full_name || user.fullName || "");
        setEmail(userProfile?.email || user.email || "");
      }
    };

    loadProfile();
  }, [user, getUserProfile]);

  const handleUpdateProfile = async () => {
    if (isLoading) return;

    const updateData: any = {};
    if (fullName !== profile?.full_name) {
      updateData.full_name = fullName;
    }
    if (email !== profile?.email) {
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      toast({
        title: "No changes to save",
        description: "Please modify the fields to update your profile.",
      });
      setIsEditing(false);
      return;
    }

    const success = await updateUserProfile(updateData);
    if (success) {
      setProfile({ ...profile, ...updateData });
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow">
              <User className="inline-block mr-2 h-8 w-8" />
              Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account details and preferences
            </p>
          </div>

          {/* Profile Card */}
          <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-2xl font-semibold">
                Account Information
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isEditing ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Full Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    <User className="inline-block mr-2 h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <Mail className="inline-block mr-2 h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Role */}
                <div className="grid gap-2">
                  <Label>
                    <Book className="inline-block mr-2 h-4 w-4" />
                    Role
                  </Label>
                  <Input
                    value={profile?.role || "Student"}
                    disabled
                    className="dark:bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Created At */}
                <div className="grid gap-2">
                  <Label>
                    <Calendar className="inline-block mr-2 h-4 w-4" />
                    Account Created
                  </Label>
                  <Input
                    value={
                      profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "N/A"
                    }
                    disabled
                    className="dark:bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Update Button */}
                {isEditing && (
                  <Button onClick={handleUpdateProfile} disabled={isLoading}>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;
