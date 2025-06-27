import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

export default function useSyncClerkToSupabase() {
  const { getToken, isSignedIn } = useUser();

  useEffect(() => {
    const syncSession = async () => {
      if (isSignedIn) {
        const token = await getToken({ template: "supabase" });
        if (token) {
          await supabase.auth.setSession({ access_token: token, refresh_token: "" });
        }
      } else {
        await supabase.auth.signOut();
      }
    };
    syncSession();
  }, [getToken, isSignedIn]);
}
