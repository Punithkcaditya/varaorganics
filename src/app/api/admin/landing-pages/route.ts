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

/**
 * Create/update an ad landing page. Section toggles let the marketer compose a
 * campaign page from the database with no deploy.
 */
const schema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"),
  headline: z.string().trim().min(5).max(200),
  headlineEm: z.string().trim().max(120).optional().or(z.literal("")),
  subheadline: z.string().trim().max(400),
  eyebrow: z.string().trim().max(160).optional().or(z.literal("")),
  announcement: z.string().trim().max(300).optional().or(z.literal("")),
  openingCopy: z.string().trim().max(2000).optional().or(z.literal("")),
  productSlug: z.string().trim().min(3),
  variantSize: z.string().trim().min(1),
  ctaLabel: z.string().trim().min(3).max(120),
  ctaButtonColor: z.enum(["navy", "gold"]),
  secondaryCtaLabel: z.string().trim().max(120).optional().or(z.literal("")),
  variantNote: z.string().trim().max(200).optional().or(z.literal("")),
  campaignId: z.string().trim().max(120).optional().or(z.literal("")),
  active: z.boolean(),
  showLabCard: z.boolean(),
  showComparison: z.boolean(),
  showPainPoints: z.boolean(),
  showStory: z.boolean(),
  showProcess: z.boolean(),
  showHonest: z.boolean(),
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
  const lp = parsed.data;

  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return fail(
      503,
      "not_configured",
      "Saving needs a Supabase connection. Set NEXT_PUBLIC_USE_MOCK_DATA=false and add your Supabase keys.",
    );
  }

  try {
    const { error } = await sb.from("landing_pages").upsert(
      {
        slug: lp.slug,
        headline: lp.headline,
        headline_em: lp.headlineEm || null,
        subheadline: lp.subheadline,
        eyebrow_text: lp.eyebrow || null,
        announcement: lp.announcement || null,
        opening_copy: lp.openingCopy || null,
        product_slug: lp.productSlug,
        variant_size: lp.variantSize,
        cta_label: lp.ctaLabel,
        cta_button_color: lp.ctaButtonColor,
        secondary_cta_label: lp.secondaryCtaLabel || null,
        variant_note: lp.variantNote || null,
        campaign_id: lp.campaignId || null,
        active: lp.active,
        noindex: true, // landing pages are always noindex (§14)
        show_lab_card: lp.showLabCard,
        show_comparison: lp.showComparison,
        show_pain_points: lp.showPainPoints,
        show_story: lp.showStory,
        show_process: lp.showProcess,
        show_honest: lp.showHonest,
      },
      { onConflict: "slug" },
    );
    if (error) throw error;

    revalidatePath(`/lp/${lp.slug}`);
    safeLog("admin/landing-pages", "saved", { slug: lp.slug, active: lp.active });
    return ok({ saved: true, slug: lp.slug });
  } catch (err) {
    return serverError("admin/landing-pages", err);
  }
}
