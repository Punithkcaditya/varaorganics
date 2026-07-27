"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv, USE_MOCK_DATA } from "@/lib/validation/env";

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    if (!USE_MOCK_DATA) {
      const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon } = publicEnv;
      if (url && anon) await createBrowserClient(url, anon).auth.signOut();
    }
    router.replace("/admin/login");
    router.refresh();
  }
  return <button type="button" onClick={logout} disabled={busy} className="text-gold-lt hover:underline disabled:opacity-50">{busy ? "Signing out…" : "Log out"}</button>;
}