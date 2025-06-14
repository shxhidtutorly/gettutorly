
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Settings,
  Crown,
  Shield,
  Award,
} from "lucide-react";

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.fullName || "",
        email: currentUser.primaryEmailAddress?.emailAddress || "",
        phone: currentUser.primaryPhoneNumber?.phoneNumber || "",
        location: "",
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      // Here you would typically update the user profile in your database
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-4 tracking-tight text-white drop-shadow">
              👤 <User className="h-10 w-10 text-spark-primary" />
              Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none animate-fade-in-up">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={currentUser.imageUrl || ""} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold mb-2">
                    {currentUser.fullName || "User"}
                  </h2>
                  
                  <div className="flex justify-center mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Student
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Learning Streak: 7 days</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span>Premium Member</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                          // Reset form data
                          setFormData({
                            name: currentUser.fullName || "",
                            email: currentUser.primaryEmailAddress?.emailAddress || "",
                            phone: currentUser.primaryPhoneNumber?.phoneNumber || "",
                            location: "",
                          });
                        } else {
                          setIsEditing(true);
                        }
                      }}
                    >
                      {isEditing ? (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      ) : (
                        <p className="p-2 bg-muted/50 rounded-md">
                          {formData.name || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      ) : (
                        <p className="p-2 bg-muted/50 rounded-md">
                          {formData.email || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      ) : (
                        <p className="p-2 bg-muted/50 rounded-md">
                          {formData.phone || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      ) : (
                        <p className="p-2 bg-muted/50 rounded-md">
                          {formData.location || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <Button onClick={handleSave} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none mt-6 animate-fade-in-up">
                <CardHeader>
                  <CardTitle>Account Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">142</p>
                      <p className="text-sm text-muted-foreground">Study Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">89</p>
                      <p className="text-sm text-muted-foreground">Hours Studied</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">67</p>
                      <p className="text-sm text-muted-foreground">Materials</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">234</p>
                      <p className="text-sm text-muted-foreground">Quiz Scores</p>
                    </div>
                  </div>
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
