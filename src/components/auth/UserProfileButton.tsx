
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const UserProfileButton = () => {
  const { user } = useUser();
  const { signOut } = useFirebaseAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const userInitials = user.fullName 
    ? user.fullName.split(" ").map((name: string) => name[0]).join("").toUpperCase()
    : (user.email ? user.email[0].toUpperCase() : "U");

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            ) : (
              <AvatarFallback>{userInitials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileButton;
