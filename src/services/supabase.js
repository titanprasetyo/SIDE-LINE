import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase configuration missing! Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY/VITE_SUPABASE_ANON_KEY terisi di .env"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");