import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

export default function useSyncClerkToSupabase() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const syncSession = async () => {
      if (!isLoaded) return; // Wait for Clerk to load
      if (isSignedIn) {
        const token = await getToken({ template: "supabase" });
        console.log("Clerk Supabase JWT:", token); // Debug log
        if (token) {
          const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: "" });
          if (error) {
            console.error("Error setting Supabase session:", error.message);
          }
        } else {
          console.error("No JWT from Clerk; cannot set Supabase session.");
        }
      } else {
        await supabase.auth.signOut();
      }
    };
    syncSession();
  }, [getToken, isSignedIn, isLoaded]);
}
