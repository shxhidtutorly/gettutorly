
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { User, Settings, Bell, Shield, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Profile = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    notifications: true,
    weeklyDigest: true
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleToggleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully."
      });
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Sidebar */}
            <div className="md:col-span-1">
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-spark-primary text-white text-xl">AJ</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{formData.name}</h2>
                    <p className="text-sm text-muted-foreground mb-2">{formData.email}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Avatar
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <nav className="space-y-1">
                    <ProfileNavItem 
                      icon={<User className="h-4 w-4" />} 
                      label="Account" 
                      active={true} 
                    />
                    <ProfileNavItem 
                      icon={<Bell className="h-4 w-4" />} 
                      label="Notifications" 
                      active={false} 
                    />
                    <ProfileNavItem 
                      icon={<Shield className="h-4 w-4" />} 
                      label="Privacy" 
                      active={false} 
                    />
                    <ProfileNavItem 
                      icon={<Settings className="h-4 w-4" />} 
                      label="Preferences" 
                      active={false} 
                    />
                    <div className="pt-4">
                      <Button variant="destructive" className="w-full justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Update your password
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">Change Password</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Study Reminders</p>
                          <p className="text-sm text-muted-foreground">Get reminders for scheduled study sessions</p>
                        </div>
                        <Switch 
                          checked={formData.notifications} 
                          onCheckedChange={(checked) => handleToggleChange('notifications', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Weekly Digest</p>
                          <p className="text-sm text-muted-foreground">Receive a summary of your weekly progress</p>
                        </div>
                        <Switch 
                          checked={formData.weeklyDigest} 
                          onCheckedChange={(checked) => handleToggleChange('weeklyDigest', checked)} 
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Preferences</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="preferences" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Display Preferences</CardTitle>
                      <CardDescription>
                        Customize how SparkLearn looks and feels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {theme === 'dark' ? (
                            <Moon className="h-5 w-5 text-spark-primary" />
                          ) : (
                            <Sun className="h-5 w-5 text-spark-primary" />
                          )}
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                          </div>
                        </div>
                        <Switch 
                          checked={theme === 'dark'}
                          onCheckedChange={toggleTheme}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

const ProfileNavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${active ? 'bg-spark-light text-spark-primary' : 'text-muted-foreground hover:bg-spark-light'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default Profile;
