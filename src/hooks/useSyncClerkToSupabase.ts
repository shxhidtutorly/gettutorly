import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

export default function useSyncClerkToSupabase() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const syncSession = async () => {
      if (isSignedIn) {
        const token = await getToken({ template: "supabase" });
        console.log("Supabase JWT from Clerk:", token); // Add this line
        if (token) {
          const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: "" });
          if (error) {
            console.error("Error setting Supabase session:", error.message);
          }
        } else {
          console.error("No JWT returned from Clerk for Supabase session!");
        }
      } else {
        await supabase.auth.signOut();
      }
    };
    syncSession();
  }, [getToken, isSignedIn]);
}
