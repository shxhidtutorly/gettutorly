
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
      <Button variant={variant} size={size}>
        <span className="flex items-center gap-2">
          <LogIn size={16} />
          Sign in with Clerk
        </span>
      </Button>
    </SignInButton>
  );
};

export default LoginButton;
