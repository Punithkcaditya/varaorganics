import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, requireServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";

/**
 * Service-role Supabase client. Bypasses RLS — for order writes, stock
 * decrements, and webhook processing ONLY. Must never be imported into client
 * code (guarded by "server-only"). Returns null in mock mode.
 *
 * Intentionally untyped (no Database generic): it performs inserts/updates/RPC
 * where the generated Insert types add friction; payloads are validated by Zod
 * upstream and mapped explicitly here.
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (USE_MOCK_DATA) return null;
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  const serviceKey = requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
