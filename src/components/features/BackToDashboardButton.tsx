
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface BackToDashboardButtonProps {
  variant?: "outline" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: ReactNode;
}

export const BackToDashboardButton = ({ 
  variant = "outline", 
  size = "default",
  className = "",
  children
}: BackToDashboardButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate('/dashboard')}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <Home className="h-4 w-4" />
      {children || "Back to Dashboard"}
    </Button>
  );
};
