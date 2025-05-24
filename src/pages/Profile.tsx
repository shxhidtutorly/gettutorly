
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  Moon, 
  Sun, 
  Camera, 
  Eye, 
  EyeOff,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Palette,
  Volume2,
  Globe,
  Lock
} from "lucide-react";

const Profile = () => {
  const [activeSection, setActiveSection] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Auto-detect system theme
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate learner and tech enthusiast",
    notifications: {
      studyReminders: true,
      weeklyDigest: true,
      emailNotifications: false,
      pushNotifications: true,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      dataSharing: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Mock notifications data
  const notifications = [
    { id: 1, title: "Study Reminder", message: "Time for your JavaScript lesson!", time: "2 min ago", unread: true },
    { id: 2, title: "Achievement Unlocked", message: "You've completed 5 lessons this week!", time: "1 hour ago", unread: true },
    { id: 3, title: "Weekly Digest", message: "Your learning progress summary is ready", time: "1 day ago", unread: false },
    { id: 4, title: "New Course Available", message: "Advanced React Concepts is now live", time: "2 days ago", unread: false }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleToggleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.current) {
      errors.current = "Current password is required";
    }
    
    if (!passwordData.new) {
      errors.new = "New password is required";
    } else if (passwordData.new.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }
    
    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (validatePassword()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setPasswordData({ current: "", new: "", confirm: "" });
        alert("Password updated successfully!");
      }, 1000);
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      alert("Signing out... (In a real app, this would redirect to login)");
    }
  };

  const sidebarItems = [
    { id: "account", icon: User, label: "Account", badge: null },
    { id: "notifications", icon: Bell, label: "Notifications", badge: "4" },
    { id: "privacy", icon: Shield, label: "Privacy", badge: null },
    { id: "preferences", icon: Settings, label: "Preferences", badge: null }
  ];

  const isDark = theme === 'dark';

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-black' 
        : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Profile Settings
            </h1>
            <p className={`transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage your account settings and preferences
            </p>
          </div>
          
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className={`mb-6 shadow-lg transition-all duration-300 border-2 ${
              isDark 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 group">
                    <Avatar className="h-24 w-24 border-4 border-blue-500 shadow-lg">
                      <AvatarImage src={avatarPreview || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                        {formData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label="Change avatar"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <h2 className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formData.name}
                  </h2>
                  <p className={`text-sm mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formData.email}
                  </p>
                  <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
                    Pro Member
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className={`shadow-lg transition-all duration-300 border-2 ${
              isDark 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? isDark 
                              ? 'bg-blue-900/50 text-blue-300 border-2 border-blue-700' 
                              : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : isDark
                              ? 'text-gray-300 hover:bg-gray-800 hover:text-white border-2 border-transparent'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-2 border-transparent'
                        }`}
                        aria-label={`Navigate to ${item.label}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Notifications Toggle */}
                  <div className={`pt-4 border-t-2 transition-colors duration-300 ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border-2 border-transparent ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      aria-label="Toggle notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="font-medium">View Notifications</span>
                      {notifications.filter(n => n.unread).length > 0 && (
                        <Badge className="bg-red-500 text-white text-xs ml-auto">
                          {notifications.filter(n => n.unread).length}
                        </Badge>
                      )}
                    </button>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start bg-red-600 hover:bg-red-700 text-white border-none"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Notifications Panel */}
              {showNotifications && (
                <Card className={`shadow-lg transition-all duration-300 border-2 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Bell className="h-5 w-5" />
                        Recent Notifications
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNotifications(false)}
                        className={`transition-colors duration-300 ${
                          isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg transition-all duration-200 border-2 ${
                            notification.unread
                              ? isDark
                                ? 'bg-blue-900/20 border-blue-800'
                                : 'bg-blue-50 border-blue-200'
                              : isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium mb-1 transition-colors duration-300 ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mb-2 transition-colors duration-300 ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {notification.message}
                              </p>
                              <span className={`text-xs transition-colors duration-300 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {notification.time}
                              </span>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account Section */}
              {activeSection === "account" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <Card className={`shadow-lg transition-all duration-300 border-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Shield className="h-5 w-5" />
                        Privacy Settings
                      </CardTitle>
                      <CardDescription className={`transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Control your privacy and data sharing preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(formData.privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label className={`font-medium transition-colors duration-300 ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                            <p className={`text-sm transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {key === 'profileVisibility' && 'Control who can see your profile'}
                              {key === 'showEmail' && 'Display email on your public profile'}
                              {key === 'showPhone' && 'Display phone number on your profile'}
                              {key === 'dataSharing' && 'Allow data sharing for analytics'}
                            </p>
                          </div>
                          {key === 'profileVisibility' ? (
                            <select
                              value={value}
                              onChange={(e) => handleToggleChange('privacy', key, e.target.value)}
                              className={`px-3 py-2 rounded-md border-2 transition-all duration-200 ${
                                isDark 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="public">Public</option>
                              <option value="private">Private</option>
                              <option value="friends">Friends Only</option>
                            </select>
                          ) : (
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => handleToggleChange('privacy', key, checked)}
                            />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === "preferences" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <Card className={`shadow-lg transition-all duration-300 border-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Settings className="h-5 w-5" />
                        App Preferences
                      </CardTitle>
                      <CardDescription className={`transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Customize your app experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className={`font-medium transition-colors duration-300 ${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            <Palette className="inline h-4 w-4 mr-2" />
                            Theme
                          </Label>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Choose your preferred theme
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setTheme(isDark ? 'light' : 'dark')}
                          className={`transition-all duration-300 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
                              : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {isDark ? (
                            <>
                              <Sun className="h-4 w-4 mr-2" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="h-4 w-4 mr-2" />
                              Dark Mode
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className={`font-medium transition-colors duration-300 ${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            <Volume2 className="inline h-4 w-4 mr-2" />
                            Sound Effects
                          </Label>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Enable or disable app sounds
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className={`font-medium transition-colors duration-300 ${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            <Globe className="inline h-4 w-4 mr-2" />
                            Language
                          </Label>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Select your preferred language
                          </p>
                        </div>
                        <select
                          className={`px-3 py-2 rounded-md border-2 transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <User className="h-5 w-5" />
                        Account Information
                      </CardTitle>
                      <CardDescription className={`transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className={`transition-colors duration-300 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Full Name
                        </Label>
                        <Input 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className={`transition-colors duration-300 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 ${
                              isDark 
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className={`transition-colors duration-300 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                          <Input 
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 ${
                              isDark 
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className={`transition-colors duration-300 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Location
                        </Label>
                        <div className="relative">
                          <MapPin className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                          <Input 
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 ${
                              isDark 
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-white border-none"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Password Section */}
                  <Card className={`shadow-lg transition-all duration-300 border-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Lock className="h-5 w-5" />
                        Change Password
                      </CardTitle>
                      <CardDescription className={`transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handlePasswordChange}>
                      <CardContent className="space-y-4">
                        {["current", "new", "confirm"].map((field) => (
                          <div key={field} className="space-y-2">
                            <Label htmlFor={`${field}-password`} className={`transition-colors duration-300 ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {field === "current" ? "Current Password" : 
                               field === "new" ? "New Password" : "Confirm New Password"}
                            </Label>
                            <div className="relative">
                              <Input 
                                id={`${field}-password`}
                                name={field}
                                type={showPassword[field] ? "text" : "password"}
                                value={passwordData[field]}
                                onChange={(e) => setPasswordData(prev => ({
                                  ...prev,
                                  [field]: e.target.value
                                }))}
                                className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 ${
                                  isDark 
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                } ${passwordErrors[field] ? 'border-red-500' : ''}`}
                                placeholder={`Enter ${field === "current" ? "current" : field === "new" ? "new" : "confirm"} password`}
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(field)}
                                className={`absolute right-3 top-3 transition-colors duration-300 ${
                                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {passwordErrors[field] && (
                              <span className="text-red-500 text-sm">{passwordErrors[field]}</span>
                            )}
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit"
                          disabled={isLoading}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-white border-none"
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <Card className={`shadow-lg transition-all duration-300 border-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Bell className="h-5 w-5" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription className={`transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Choose what notifications you want to receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(formData.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label className={`font-medium transition-colors duration-300 ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                            <p className={`text-sm transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {key === 'studyReminders' && 'Get reminded about your study sessions'}
                              {key === 'weeklyDigest' && 'Receive weekly progress summaries'}
                              {key === 'emailNotifications' && 'Get notifications via email'}
                              {key === 'pushNotifications' && 'Receive push notifications'}
                              {key === 'marketingEmails' && 'Receive promotional emails'}
                            </p>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => handleToggleChange('notifications', key, checked)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Privacy Section */}
              {activeSection === "privacy" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy Settings
                      </CardTitle>
                      <CardDescription>
                        Control your privacy and data sharing preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(formData.privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div>
                            <p className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {key === 'profileVisibility' && "Control who can see your profile information"}
                              {key === 'showEmail' && "Display your email address on your public profile"}
                              {key === 'showPhone' && "Display your phone number on your public profile"}
                              {key === 'dataSharing' && "Allow sharing anonymized data for platform improvements"}
                            </p>
                          </div>
                          <Switch 
                            checked={typeof value === 'boolean' ? value : value === 'public'} 
                            onCheckedChange={(checked) => handleToggleChange('privacy', key, checked)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleSaveChanges}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Save Privacy Settings
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === "preferences" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Display Preferences
                      </CardTitle>
                      <CardDescription>
                        Customize your learning environment and interface
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? (
                            <Moon className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Sun className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
                          </div>
                        </div>
                        <Switch 
                          checked={theme === 'dark'}
                          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 w-80 max-h-96 bg-white rounded-lg shadow-2xl border z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-b hover:bg-gray-50 transition-colors duration-200 ${
                  notification.unread ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full text-sm">
              View All Notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;