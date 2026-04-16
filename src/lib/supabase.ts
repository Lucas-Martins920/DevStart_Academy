import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const FALLBACK_SUPABASE_URL = "https://invalid-project.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "invalid-anon-key";

export const SUPABASE_STORAGE_KEY = "dev-start-academy-auth";

export const supabaseConfigError =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? null
    : new Error(
        "Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel e no .env.",
      );

if (supabaseConfigError) {
  console.error(supabaseConfigError.message);
}

export const supabase = createClient<Database>(
  SUPABASE_URL || FALLBACK_SUPABASE_URL,
  SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: SUPABASE_STORAGE_KEY,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
    global: {
      headers: {
        "X-Client-Info": "devstart-academy-web",
      },
    },
  },
);
