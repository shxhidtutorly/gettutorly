import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/clerk-react";

// Note: It's generally recommended to call useAuth outside of this hook,
// or to pass getToken to a Supabase client instance creator.
// However, to match the issue's request, we define a hook that creates a client.
// This means a new client is potentially created on each hook usage, which might not be optimal.
// Consider refactoring to a singleton Supabase client that gets updated with the token.

export const useSupabase = () => {
  const { getToken } = useAuth();

  // Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL is not defined. Please check your .env file.");
  }
  if (!supabaseAnonKey) {
    throw new Error("VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.");
  }

  // Create a new Supabase client with the Clerk token
  const client = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        fetch: async (url, options = {}) => {
          const token = await getToken({ template: "supabase" });

          const headers = new Headers(options.headers);
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );

  return client;
};

// Optional: If you want a way to get a Supabase client outside of a React component/hook,
// you might need a different setup, as useAuth() can only be called inside components.
// For instance, a singleton client that is initialized once and updated with the token
// when the auth state changes. The issue's current request implies a hook-based client.
