
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoginButton = ({ variant = "default", size = "default" }: LoginButtonProps) => {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    // Temporarily redirect directly to dashboard instead of triggering Google auth
    navigate("/dashboard");
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleSignIn}
    >
      <span className="flex items-center gap-2">
        <LogIn size={16} />
        Sign in with Google
      </span>
    </Button>
  );
};

export default LoginButton;
