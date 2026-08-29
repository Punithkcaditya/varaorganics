import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/auth";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { fail, ok, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentSchema = z.object({
  productSlug: z.string().trim().min(1).max(160),
  productName: z.string().trim().min(1).max(160),
  variant: z.string().trim().min(1).max(40),
  qty: z.number().int().min(1).max(20),
});

const schema = z
  .object({
    id: z.string().min(1),
    checkoutSku: z.string().trim().min(2).max(80),
    nameEnglish: z.string().trim().min(2).max(160),
    nameKannada: z.string().trim().max(160),
    nameHindi: z.string().trim().max(160),
    nameTelugu: z.string().trim().max(160),
    nameTamil: z.string().trim().max(160),
    nameMalayalam: z.string().trim().max(160),
    tagline: z.string().trim().min(5).max(500),
    contents: z.array(contentSchema).min(1).max(12),
    mrpIndividual: z.number().int().min(1).max(1_000_000),
    comboPrice: z.number().int().min(1).max(1_000_000),
    badgeText: z.string().trim().max(80),
    badgeColor: z.enum(["amber", "green", "gold", "blue"]),
    ctaText: z.string().trim().min(2).max(60),
    isGiftWrapped: z.boolean(),
    isExport: z.boolean(),
    sortOrder: z.number().int().min(0).max(100),
    published: z.boolean(),
  })
  .refine((value) => value.comboPrice <= value.mrpIndividual, {
    message: "Combo price must not be higher than the individual MRP total.",
    path: ["comboPrice"],
  });

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return fail(401, "unauthorized", "Sign in to continue");

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(
      422,
      "validation_error",
      parsed.error.issues[0]?.message ?? "Invalid combo details",
    );
  }

  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return fail(503, "not_configured", "Saving combos needs a live Supabase connection.");
  }

  const input = parsed.data;
  try {
    const contents = input.contents.map((item) => ({
      product_slug: item.productSlug,
      product_name: item.productName,
      variant: item.variant,
      qty: item.qty,
    }));
    const { error } = await sb
      .from("combos")
      .update({
        name_english: input.nameEnglish,
        name_kannada: input.nameKannada || null,
        name_hindi: input.nameHindi || null,
        name_telugu: input.nameTelugu || null,
        name_tamil: input.nameTamil || null,
        name_malayalam: input.nameMalayalam || null,
        tagline: input.tagline,
        contents,
        mrp_individual: input.mrpIndividual,
        combo_price: input.comboPrice,
        badge_text: input.badgeText || null,
        badge_color: input.badgeColor,
        cta_text: input.ctaText,
        is_gift_wrapped: input.isGiftWrapped,
        is_export: input.isExport,
        sort_order: input.sortOrder,
        published: input.published,
      })
      .eq("id", input.id);
    if (error) throw error;

    // Keep checkout's server-authoritative price in sync with the combo editor.
    const { error: variantError } = await sb
      .from("product_variants")
      .update({
        price: input.comboPrice,
        compare_at_price: input.mrpIndividual,
        active: input.published,
      })
      .eq("sku", input.checkoutSku);
    if (variantError) throw variantError;

    revalidatePath("/");
    revalidatePath("/combos");
    revalidatePath("/admin/combos");
    safeLog("admin/combos", "updated", { comboId: input.id });
    return ok({ saved: true });
  } catch (err) {
    return serverError("admin/combos", err);
  }
}
