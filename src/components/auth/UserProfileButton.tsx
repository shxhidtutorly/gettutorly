
import { useUser, UserButton } from "@clerk/clerk-react";

const UserProfileButton = () => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return null;

  return (
    <UserButton 
      appearance={{
        elements: {
          avatarBox: "h-9 w-9"
        }
      }}
    />
  );
};

export default UserProfileButton;
