
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, User, Mail, Lock, Phone, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    phoneNumber: "",
    verificationCode: ""
  });
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, emailSignIn, phoneAuth, forgotPassword, loading } = useAuth();

  // Setup recaptcha when component mounts
  const recaptchaContainerId = "recaptcha-container";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signIn();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (authMethod === "email") {
      try {
        if (isSignUp) {
          if (!formData.displayName) {
            setError("Please enter your name");
            return;
          }
          await signUp(formData.email, formData.password, formData.displayName);
        } else {
          await emailSignIn(formData.email, formData.password);
        }
      } catch (error) {
        // Error is handled by the hook
      }
    } else if (authMethod === "phone") {
      if (!verificationSent) {
        try {
          // Initialize recaptcha if needed
          phoneAuth.setupRecaptcha(recaptchaContainerId);
          
          // Send verification code
          await phoneAuth.sendVerificationCode(formData.phoneNumber);
          setVerificationSent(true);
        } catch (error) {
          // Error is handled by the hook
        }
      } else {
        try {
          // Verify code
          await phoneAuth.verifyCode(formData.verificationCode);
        } catch (error) {
          // Error is handled by the hook
        }
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }
    
    try {
      await forgotPassword(formData.email);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
        <CardDescription>
          {isSignUp 
            ? "Create a new account to get started" 
            : "Sign in to access your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignIn} 
            disabled={loading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        name="displayName"
                        placeholder="John Doe"
                        className="pl-8"
                        value={formData.displayName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-8"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-xs" 
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-8"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="phone">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!verificationSent ? (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="+1 (555) 555-5555"
                        className="pl-8"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your phone number with country code (e.g. +1 for US)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      name="verificationCode"
                      placeholder="123456"
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to your phone
                    </p>
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading 
                    ? 'Processing...' 
                    : !verificationSent 
                      ? 'Send Verification Code' 
                      : 'Verify & Sign In'
                  }
                </Button>
                
                {verificationSent && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setVerificationSent(false)}
                  >
                    Change Phone Number
                  </Button>
                )}
                
                {/* Recaptcha container */}
                <div id={recaptchaContainerId}></div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-center text-muted-foreground">
          {isSignUp 
            ? "Already have an account?" 
            : "Don't have an account?"
          }
          <Button 
            variant="link" 
            className="pl-1 h-auto p-0" 
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
