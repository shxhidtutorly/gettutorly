import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface BackToDashboardButtonProps {
  // You can still pass additional classes if needed for specific layout adjustments.
  className?: string;
  children?: ReactNode;
}

/**
 * A reusable button component with a "Neon Brutalist" theme that navigates
 * the user back to the /dashboard route.
 */
export const BackToDashboardButton = ({
  className = "",
  children
}: BackToDashboardButtonProps) => {
  const navigate = useNavigate();

  // Brutalist styles are now the default for this component.
  // It features a dark background, a thick border, a hard shadow, and no rounded corners.
  const brutalistStyles = `
    bg-gray-800 
    text-white 
    border-2 
    border-gray-600 
    hover:bg-gray-700 
    hover:border-gray-500 
    rounded-none 
    font-bold 
    transition-all 
    duration-200 
    shadow-[4px_4px_0px_#4b5563] 
    hover:shadow-[6px_6px_0px_#6b7280] 
    active:shadow-[2px_2px_0px_#4b5563] 
    active:translate-x-[2px] 
    active:translate-y-[2px]
  `;

  return (
    <Button
      onClick={() => navigate('/dashboard')}
      // The base styles are applied first, then any custom classes are added.
      className={`${brutalistStyles} flex items-center gap-2 ${className}`}
    >
      <Home className="h-4 w-4" />
      {children || "Back to Dashboard"}
    </Button>
  );
};
