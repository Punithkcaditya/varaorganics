import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv, USE_MOCK_DATA } from "@/lib/validation/env";

/**
 * Cookie-backed Supabase client for admin authentication (Supabase Auth,
 * email + password). Used by server components and the /admin middleware.
 * Returns null when Supabase isn't configured (mock mode).
 */
export async function getAuthSupabase() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anon = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  });
}

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * The signed-in admin, or null. In mock mode there is no real auth provider, so
 * a stub admin is returned and the dashboard runs read-only against mock data —
 * this lets the UI be developed offline. Production always requires a real
 * Supabase session.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (USE_MOCK_DATA) return { id: "mock-admin", email: "admin@varaorganics.com" };
  const sb = await getAuthSupabase();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}
