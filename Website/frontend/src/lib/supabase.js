import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client using the environment variables from .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export { supabase };
