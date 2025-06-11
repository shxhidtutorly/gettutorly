import { SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoginButton = ({ variant = "default", size = "default" }: LoginButtonProps) => {
  return (
    <SignInButton mode="modal">
      <Button
        variant={variant}
        size={size}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors duration-200"
      >
        <LogIn size={16} />
        <span>Sign in to GetTutorly</span>
      </Button>
    </SignInButton>
  );
};

export default LoginButton;
