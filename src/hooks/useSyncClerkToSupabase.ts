import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase"; // Adjust path if needed

export function useSyncClerkToSupabase() {
  const { getToken } = useAuth();

  useEffect(() => {
    (async () => {
      const token = await getToken({ template: "supabase" });
      if (token) {
        // For supabase-js v2.x:
        await supabase.auth.setSession({ access_token: token, refresh_token: "" });
      }
    })();
  }, [getToken]);
}
