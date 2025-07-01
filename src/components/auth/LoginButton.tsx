
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoginButton = ({ variant = "default", size = "default" }: LoginButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => navigate('/signin')}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200"
    >
      <LogIn size={16} className="stroke-white" />
      <span>Sign in to GetTutorly</span>
    </Button>
  );
};

export default LoginButton;
