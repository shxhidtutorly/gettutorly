
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Trophy, BookOpen, Target } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || {
        id: user?.id,
        email: user?.email,
        full_name: user?.user_metadata?.full_name || '',
        role: 'student'
      });
      
      setFormData({
        full_name: data?.full_name || user?.user_metadata?.full_name || '',
        email: data?.email || user?.email || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user?.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      setEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Could not sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl text-white">
                {profile?.full_name || 'User'}
              </CardTitle>
              <p className="text-white/70">{profile?.email}</p>
              <Badge variant="outline" className="text-purple-400 border-purple-400 w-fit mx-auto">
                <Trophy className="w-4 h-4 mr-1" />
                {profile?.role || 'Student'}
              </Badge>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Full Name
                    </label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Email
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      disabled
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-white/90">
                    <User className="w-4 h-4 mr-3 text-purple-400" />
                    <span>{profile?.full_name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Mail className="w-4 h-4 mr-3 text-purple-400" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Calendar className="w-4 h-4 mr-3 text-purple-400" />
                    <span>Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <Button 
                    onClick={() => setEditing(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h3 className="font-semibold text-white">Study Materials</h3>
                <p className="text-2xl font-bold text-purple-400">0</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-semibold text-white">Quizzes Taken</h3>
                <p className="text-2xl font-bold text-blue-400">0</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-semibold text-white">Study Hours</h3>
                <p className="text-2xl font-bold text-green-400">0</p>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSignOut}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
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
