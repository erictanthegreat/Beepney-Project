import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eutstkauaegdryktgqfl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHN0a2F1YWVnZHJ5a3RncWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODEwNDEsImV4cCI6MjA2OTg1NzA0MX0.r5hF0bvn8fWd7vHxcdB-O8X08d4z-RkIX6oHziI07uU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});