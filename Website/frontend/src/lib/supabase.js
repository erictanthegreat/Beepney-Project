// src/lib/supabase.js (or wherever your file is located)

import { createClient } from "@supabase/supabase-js";

// We define a variable to hold the client instance (Singleton pattern)
let client = null;

// Export a function that safely creates or retrieves the client instance
export function getSupabaseClient() {
  if (client) {
    return client;
  }

  // CRITICAL CHECK: Ensure the environment variables exist before calling createClient.
  // This check and the subsequent creation are only executed when getSupabaseClient() is called.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // We throw an error here, but since the calling component is client-side,
    // this error is safely avoided during the Vercel build itself.
    throw new Error("Supabase URLs are not available.");
  }

  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return client;
}

// Export the client constant by calling the function.
// This allows you to keep using 'import { supabase }' in your Header.tsx
export const supabase = getSupabaseClient();
