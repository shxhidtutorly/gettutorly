
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoginButton = ({ variant = "default", size = "default" }: LoginButtonProps) => {
  const { signIn, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleSignIn}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
          Signing in...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LogIn size={16} />
          Sign in with Google
        </span>
      )}
    </Button>
  );
};

export default LoginButton;
