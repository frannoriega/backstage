import { createClient } from "@supabase/supabase-js";

export const supabase = (() => {
  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );
})();
