import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase"; // Adjust path if needed

export default function useSyncClerkToSupabase() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const syncSession = async () => {
      if (isSignedIn) {
        const token = await getToken({ template: "supabase" });
        if (token) {
          const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: "" });
          if (error) {
            console.error("Error setting Supabase session:", error.message);
          }
        }
      } else {
        await supabase.auth.signOut();
      }
    };
    syncSession();
  }, [getToken, isSignedIn]);
}
