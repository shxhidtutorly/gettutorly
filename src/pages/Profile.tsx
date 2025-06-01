
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    location: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const { toast } = useToast();

  // Get user display name safely
  const getUserDisplayName = () => {
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return '';
  };

  // Get user avatar URL safely
  const getUserAvatarUrl = () => {
    return currentUser?.user_metadata?.avatar_url || '';
  };

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: getUserDisplayName(),
        email: currentUser.email || '',
        phone_number: '',
        location: ''
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile(profile);
      
      // Log the activity
      await supabase.rpc('log_user_activity', {
        action_type: 'profile_updated',
        activity_details: { updated_fields: Object.keys(profile) }
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_user_activity', {
        action_type: 'password_changed',
        activity_details: {}
      });

      setPasswords({ current: '', new: '', confirm: '' });
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Update last login timestamp
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', currentUser?.id);

      // Log the activity
      await supabase.rpc('log_user_activity', {
        action_type: 'user_signed_out',
        activity_details: {}
      });

      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <User className="h-7 w-7 text-spark-primary" />
              Profile Settings
            </h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
          
          {/* Profile Information */}
          <Card className="mb-6 dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getUserAvatarUrl()} />
                  <AvatarFallback>
                    {(getUserDisplayName() || currentUser.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{getUserDisplayName() || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone_number}
                    onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    placeholder="Enter your location"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleUpdateProfile} 
                disabled={loading}
                className="animated-button"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Password Change */}
          <Card className="mb-6 dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
              
              <Button 
                onClick={handlePasswordChange} 
                disabled={passwordLoading || !passwords.new || !passwords.confirm}
                className="animated-button"
              >
                <Lock className="h-4 w-4 mr-2" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Account Actions */}
          <Card className="dark:bg-card">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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
