"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/validation/env";
import { Field, inputClass } from "@/components/forms/Field";

/**
 * Supabase Auth email + password sign-in for /admin.
 *
 * The password is submitted directly to Supabase Auth from the browser over
 * HTTPS and is never stored, logged, or sent anywhere else.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anon = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = Boolean(url && anon);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserClient(url!, anon!);
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Those credentials didn't work. Please try again.");
        setBusy(false);
        return;
      }
      router.replace(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch {
      setError("Could not sign in right now. Please try again.");
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p className="rounded border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
        Supabase is not configured, so authentication is disabled. Set
        NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable admin sign-in.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email" required>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass(false)}
        />
      </Field>
      <Field label="Password" htmlFor="password" required>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass(false)}
        />
      </Field>

      {error && (
        <p role="alert" className="rounded bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
