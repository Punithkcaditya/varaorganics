import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protects /admin with Supabase Auth (Tech Stack doc). Refreshes the session
 * cookie on every request and redirects unauthenticated visitors to the login
 * page. /admin/login itself stays public.
 *
 * In mock mode (no Supabase configured) the admin UI is reachable so it can be
 * developed offline — production always requires a real session.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const isLogin = req.nextUrl.pathname.startsWith("/admin/login");

  if (isMock || !url || !anon) return res;

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
