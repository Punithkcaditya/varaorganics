import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError, safeLog } from "@/lib/security/redact";
import { combos as mockCombos } from "@/data/combos";
import type { Combo, ComboContentItem, Language } from "@/types";

/**
 * Extract a useful message from a Supabase/Postgres error (String(err) gives a
 * useless "[object Object]") and flag the expected "combos table not created
 * yet" case — Postgres 42P01 / PostgREST PGRST205 — so we can log it quietly
 * instead of surfacing a scary error before migration 0006 has been run.
 */
function describeDbError(err: unknown): { message: string; missingTable: boolean } {
  const e = err as { message?: string; code?: string; details?: string } | null;
  const message = e?.message ?? (typeof err === "string" ? err : JSON.stringify(err));
  const code = e?.code ?? "";
  const missingTable =
    code === "42P01" ||
    code === "PGRST205" ||
    /schema cache|does not exist|could not find the table/i.test(message ?? "");
  return { message: message ?? "unknown error", missingTable };
}

/** Log a combos DB error: quiet for "table not set up yet", loud otherwise. */
function logComboDbError(scope: string, err: unknown, extra: Record<string, unknown> = {}) {
  const { message, missingTable } = describeDbError(err);
  if (missingTable) {
    safeLog("combos", "combos table not found — run migration 0006 to enable combos", { scope });
  } else {
    safeError("combos", `${scope} — serving no combos`, { err: message, ...extra });
  }
}

/**
 * Combo data access. Mirrors the strict product policy: mock/unconfigured →
 * seeded combos; Supabase configured but the query FAILS → empty + loud log
 * (never serve demo prices for a live page).
 *
 * Each combo's purchasable variant is resolved from its `checkout_sku` against
 * product_variants, so the existing server-verified checkout charges the combo
 * price.
 */

interface ComboRow {
  id: string;
  slug: string;
  name_english: string;
  name_kannada: string | null;
  name_hindi: string | null;
  name_telugu: string | null;
  name_tamil: string | null;
  name_malayalam: string | null;
  tagline: string | null;
  contents: unknown;
  mrp_individual: number;
  combo_price: number;
  saving: number;
  badge_text: string | null;
  badge_color: string | null;
  cta_text: string | null;
  is_gift_wrapped: boolean;
  is_export: boolean;
  sort_order: number;
  checkout_sku: string | null;
  published: boolean;
}

export interface AdminCombo extends Combo {
  nameMalayalam: string;
  published: boolean;
}

function mapContents(raw: unknown): ComboContentItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      productSlug: String(o.product_slug ?? o.productSlug ?? ""),
      productName: String(o.product_name ?? o.productName ?? ""),
      variant: String(o.variant ?? ""),
      qty: Number(o.qty ?? 1),
    };
  });
}

const BADGE_COLORS = new Set(["amber", "green", "gold", "blue"]);

export const getPublishedCombos = cache(async (): Promise<Combo[]> => {
  if (USE_MOCK_DATA) return sortedMock();
  const sb = getServerSupabase();
  if (!sb) return sortedMock();

  try {
    const { data, error } = await sb
      .from("combos")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data as ComboRow[]) ?? [];
    if (rows.length === 0) return [];

    // Resolve each combo's backing bundle variant by SKU.
    const skus = rows.map((r) => r.checkout_sku).filter((s): s is string => Boolean(s));
    const variantBySku = new Map<string, { id: string; productId: string }>();
    if (skus.length > 0) {
      const { data: variants, error: vErr } = await sb
        .from("product_variants")
        .select("id, product_id, sku")
        .in("sku", skus);
      if (vErr) throw vErr;
      for (const v of (variants as { id: string; product_id: string; sku: string }[]) ?? []) {
        variantBySku.set(v.sku, { id: v.id, productId: v.product_id });
      }
    }

    return rows.map((r) => mapCombo(r, variantBySku)).filter((c): c is Combo => c !== null);
  } catch (err) {
    logComboDbError("published read failed", err);
    return [];
  }
});

/** Full combo catalogue for the authenticated admin and checkout fulfilment. */
export async function getAdminCombos(): Promise<AdminCombo[]> {
  if (USE_MOCK_DATA) {
    return sortedMock().map((combo) => ({
      ...combo,
      nameMalayalam: combo.names.english,
      published: true,
    }));
  }
  const sb = getAdminSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("combos")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data as ComboRow[]) ?? [];
    const mapped = await mapRowsWithVariants(sb, rows);
    return mapped.map(({ combo, row }) => ({
      ...combo,
      nameMalayalam: row.name_malayalam ?? row.name_english,
      published: row.published,
    }));
  } catch (err) {
    logComboDbError("admin read failed", err);
    return [];
  }
}

/** Resolve a purchased combo even if it was unpublished after checkout began. */
export async function getComboByCheckoutSku(sku: string): Promise<Combo | null> {
  if (USE_MOCK_DATA) return mockCombos.find((combo) => combo.checkout.sku === sku) ?? null;
  const sb = getAdminSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("combos")
      .select("*")
      .eq("checkout_sku", sku)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const mapped = await mapRowsWithVariants(sb, [data as ComboRow]);
    return mapped[0]?.combo ?? null;
  } catch (err) {
    logComboDbError("checkout lookup failed", err, { sku });
    return null;
  }
}

async function mapRowsWithVariants(
  sb: NonNullable<ReturnType<typeof getAdminSupabase>>,
  rows: ComboRow[],
): Promise<{ combo: Combo; row: ComboRow }[]> {
  const skus = rows
    .map((row) => row.checkout_sku)
    .filter((value): value is string => Boolean(value));
  const variantBySku = new Map<string, { id: string; productId: string }>();
  if (skus.length > 0) {
    const { data, error } = await sb
      .from("product_variants")
      .select("id, product_id, sku")
      .in("sku", skus);
    if (error) throw error;
    for (const variant of (data as { id: string; product_id: string; sku: string }[]) ?? []) {
      variantBySku.set(variant.sku, { id: variant.id, productId: variant.product_id });
    }
  }
  return rows.flatMap((row) => {
    const combo = mapCombo(row, variantBySku);
    return combo ? [{ combo, row }] : [];
  });
}

function mapCombo(
  r: ComboRow,
  variantBySku: Map<string, { id: string; productId: string }>,
): Combo | null {
  const backing = r.checkout_sku ? variantBySku.get(r.checkout_sku) : undefined;
  // A combo with no purchasable variant can't be added to cart — skip it.
  if (!backing || !r.checkout_sku) return null;
  const badgeColor = (r.badge_color ?? "amber").toLowerCase();
  return {
    id: r.id,
    slug: r.slug,
    names: {
      english: r.name_english,
      kannada: r.name_kannada ?? r.name_english,
      hindi: r.name_hindi ?? r.name_english,
      telugu: r.name_telugu ?? r.name_english,
      tamil: r.name_tamil ?? r.name_english,
    } as Record<Language, string>,
    tagline: r.tagline ?? "",
    contents: mapContents(r.contents),
    mrpIndividual: r.mrp_individual,
    comboPrice: r.combo_price,
    saving: r.saving,
    badgeText: r.badge_text && r.badge_text.trim() ? r.badge_text : null,
    badgeColor: (BADGE_COLORS.has(badgeColor) ? badgeColor : "amber") as Combo["badgeColor"],
    ctaText: r.cta_text && r.cta_text.trim() ? r.cta_text : "ADD TO CART",
    isGiftWrapped: r.is_gift_wrapped,
    isExport: r.is_export,
    sortOrder: r.sort_order,
    checkout: { variantId: backing.id, productId: backing.productId, sku: r.checkout_sku },
  };
}

function sortedMock(): Combo[] {
  return [...mockCombos].sort((a, b) => a.sortOrder - b.sortOrder);
}
