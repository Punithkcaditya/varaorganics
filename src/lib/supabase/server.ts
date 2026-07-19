import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/validation/env";
import type { Database } from "@/types/database";

/**
 * Anon-key Supabase client for server components / route handlers.
 * RLS applies, so this only ever reads public (active/published) rows.
 * Returns null when credentials are absent (mock mode) — callers fall back to
 * seeded mock data instead of crashing.
 */
export function getServerSupabase(): SupabaseClient<Database> | null {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anon = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
