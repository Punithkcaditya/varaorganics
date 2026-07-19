import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/auth";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { ok, fail, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Homepage / site settings the marketer owns (announcement bar, hero copy). */
const schema = z.object({
  announcement: z.string().trim().min(3).max(300),
  freeShippingThreshold: z.number().int().min(0).max(100000),
  heroHeadline: z.string().trim().min(3).max(200),
  heroHeadlineEm: z.string().trim().max(200),
});

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return fail(401, "unauthorized", "Sign in to continue");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed request body.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "validation_error", parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return fail(
      503,
      "not_configured",
      "Saving needs a Supabase connection. Set NEXT_PUBLIC_USE_MOCK_DATA=false and add your Supabase keys.",
    );
  }

  try {
    const rows = Object.entries(parsed.data).map(([key, value]) => ({ key, value }));
    const { error } = await sb.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;

    revalidatePath("/", "layout");
    safeLog("admin/settings", "updated", { keys: rows.map((r) => r.key) });
    return ok({ saved: true });
  } catch (err) {
    return serverError("admin/settings", err);
  }
}
