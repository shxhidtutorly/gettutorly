
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoginButton = ({ variant = "default", size = "default" }: LoginButtonProps) => {
  return (
    <Link to="/signin">
      <Button
        variant={variant}
        size={size}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200"
      >
        <LogIn size={16} className="stroke-white" />
        <span>Sign in to GetTutorly</span>
      </Button>
    </Link>
  );
};

export default LoginButton;
