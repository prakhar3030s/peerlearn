import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Ensure environment variables are loaded for any entrypoint (server, seed, scripts)
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Supabase client will operate in disabled mode."
  );
}

export const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
        },
      })
    : null;

export function ensureSupabase() {
  if (!supabase) {
    const error = new Error(
      "Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
    error.status = 500;
    throw error;
  }
  return supabase;
}

