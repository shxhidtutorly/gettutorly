
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
    await signIn(); // This will trigger Google OAuth
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleSignIn}
      disabled={loading}
    >
      <span className="flex items-center gap-2">
        <LogIn size={16} />
        {loading ? "Signing in..." : "Sign in with Google"}
      </span>
    </Button>
  );
};

export default LoginButton;
