import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { ok, fail } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On-demand ISR revalidation (Learn Brief §07, modernized to App Router).
 * The secret is read from the `x-revalidate-secret` HEADER — never the query
 * string (§12). Supabase DB webhooks support custom headers. Supports
 * revalidating /learn, /learn/[slug], product and collection pages.
 */
export async function POST(req: NextRequest) {
  const secret = optionalServerEnv("REVALIDATE_SECRET");
  const provided = req.headers.get("x-revalidate-secret");

  if (!USE_MOCK_DATA) {
    if (!secret) return fail(500, "not_configured", "Revalidation secret not configured");
    if (provided !== secret) return fail(401, "unauthorized", "Invalid revalidation secret");
  }

  let body: { table?: string; record?: { slug?: string; route_prefix?: string } } = {};
  try {
    body = await req.json();
  } catch {
    // Body optional — default to revalidating the learn hub.
  }

  const paths = new Set<string>();
  const slug = body.record?.slug;

  if (body.table === "learn_content") {
    paths.add("/learn");
    if (slug) paths.add(`/learn/${slug}`);
  } else if (body.table === "products" || body.table === "product_variants") {
    paths.add("/shop");
    if (body.record?.route_prefix) paths.add(`/shop/${body.record.route_prefix}`);
    if (slug && body.record?.route_prefix) paths.add(`/${body.record.route_prefix}/${slug}`);
    paths.add("/");
  } else {
    // Explicit path in body, or default learn hub.
    paths.add("/learn");
    if (slug) paths.add(`/learn/${slug}`);
  }

  for (const path of paths) revalidatePath(path);
  safeLog("revalidate", "revalidated", { paths: Array.from(paths) });
  return ok({ revalidated: true, paths: Array.from(paths) });
}
