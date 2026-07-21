import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protects /admin with Supabase Auth (Tech Stack doc). Refreshes the session
 * cookie on every request and redirects unauthenticated visitors to the login
 * page. /admin/login itself stays public.
 *
 * Fail-closed policy:
 *  - Explicit mock mode (NEXT_PUBLIC_USE_MOCK_DATA="true") — local development
 *    only — leaves /admin open so it can be built offline.
 *  - Any other case where Supabase is not configured (e.g. a production deploy
 *    that is missing its env vars) BLOCKS /admin rather than exposing it. This
 *    prevents a misconfigured deploy from serving an unauthenticated admin
 *    panel on a public domain.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const isLogin = req.nextUrl.pathname.startsWith("/admin/login");

  // Local mock development: admin is intentionally open.
  if (isMock) return res;

  // Not mock, but Supabase isn't configured → we cannot verify a session, so we
  // must NOT let anyone in. Send them to the login page, which explains that
  // authentication is unavailable until Supabase is configured.
  if (!url || !anon) {
    return isLogin ? res : NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const redirect = new URL("/admin/login", req.url);
    redirect.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(redirect);
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return res;
}

export const config = { matcher: ["/admin/:path*"] };
