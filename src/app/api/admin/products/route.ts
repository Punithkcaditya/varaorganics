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
 * Update product marketing copy and a variant's price/stock/availability.
 * Deliberately narrow: slugs and SKUs are NOT editable here because they are
 * fixed by the SEO URL structure and referenced by past orders.
 */
const schema = z.object({
  productId: z.string().min(1),
  shortDescription: z.string().trim().min(10).max(500).optional(),
  longDescription: z.string().trim().min(20).optional(),
  metaTitle: z.string().trim().max(200).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(320).optional().or(z.literal("")),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().min(1),
        price: z.number().int().min(1).max(1_000_000),
        stock: z.number().int().min(0).max(100_000),
        active: z.boolean(),
      }),
    )
    .optional(),
});

const createSchema = z.object({
  productName: z.string().trim().min(2).max(120),
  category: z.enum(["ghee", "honey", "oils"]),
  size: z.string().trim().min(1).max(40),
  sku: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  price: z.number().int().min(1).max(1_000_000),
  stock: z.number().int().min(0).max(100_000),
  imageUrl: z.string().trim().max(500).optional(),
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return fail(401, "unauthorized", "Sign in to continue");
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, "validation_error", parsed.error.issues[0]?.message ?? "Invalid input");
  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) return fail(503, "not_configured", "Adding products needs a live Supabase connection.");
  const input = parsed.data;
  const slug = slugify(input.productName);
  if (!slug) return fail(422, "validation_error", "Enter a valid product name.");

  try {
    const { data: product, error: productError } = await sb.from("products").insert({
      product_name: input.productName, slug, category: input.category, route_prefix: input.category,
      short_description: `${input.productName}, made with care by Vara Organics.`,
      long_description: `${input.productName}\n\nEdit this description before publishing.`,
      active: false, featured: false,
    }).select("id").single();
    if (productError) throw productError;
    const { error: variantError } = await sb.from("product_variants").insert({
      product_id: product.id, size: input.size, sku: input.sku, price: input.price, stock: input.stock,
      unit_label: input.size, unit_base: Number.parseInt(input.size, 10) || 1,
      unit_type: input.size.toLowerCase().includes("g") ? "g" : "ml",
      route_slug: `${slug}-${slugify(input.size)}`, active: true,
    });
    if (variantError) {
      await sb.from("products").delete().eq("id", product.id);
      throw variantError;
    }
    if (input.imageUrl) {
      const { error: imageError } = await sb.from("product_images").insert({ product_id: product.id, url: input.imageUrl, alt: input.productName });
      if (imageError) throw imageError;
    }
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/admin/products");
    safeLog("admin/products", "created", { productId: product.id });
    return ok({ slug });
  } catch (err) {
    return serverError("admin/products/create", err);
  }
}
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
  const input = parsed.data;

  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return fail(
      503,
      "not_configured",
      "Saving needs a Supabase connection. Set NEXT_PUBLIC_USE_MOCK_DATA=false and add your Supabase keys.",
    );
  }

  try {
    const productPatch: Record<string, unknown> = {};
    if (input.shortDescription !== undefined) productPatch.short_description = input.shortDescription;
    if (input.longDescription !== undefined) productPatch.long_description = input.longDescription;
    if (input.metaTitle !== undefined) productPatch.meta_title = input.metaTitle || null;
    if (input.metaDescription !== undefined)
      productPatch.meta_description = input.metaDescription || null;
    if (input.active !== undefined) productPatch.active = input.active;
    if (input.featured !== undefined) productPatch.featured = input.featured;

    if (Object.keys(productPatch).length > 0) {
      const { error } = await sb.from("products").update(productPatch).eq("id", input.productId);
      if (error) throw error;
    }

    for (const v of input.variants ?? []) {
      const { error } = await sb
        .from("product_variants")
        .update({ price: v.price, stock: v.stock, active: v.active })
        .eq("id", v.id)
        .eq("product_id", input.productId);
      if (error) throw error;
    }

    // Refresh everything the change can affect.
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/shop/ghee");
    revalidatePath("/shop/honey");
    revalidatePath("/shop/oils");

    safeLog("admin/products", "updated", { productId: input.productId });
    return ok({ saved: true });
  } catch (err) {
    return serverError("admin/products", err);
  }
}
