import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação de segurança
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Faltam variáveis de ambiente do Supabase no Vercel!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Mudamos o nome da chave para limpar o cache de quem já acessou
    storageKey: 'dev-start-academy-v2', 
  }
});