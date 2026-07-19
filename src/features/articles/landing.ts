import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import { landingPages as fallbackLandingPages } from "@/data/landing-pages";
import type {
  ComparisonRow,
  FaqItem,
  LandingPage,
  PainPointPair,
  ProcessStep,
} from "@/types";

/**
 * Landing pages come from the `landing_pages` table so the marketer can add or
 * edit a campaign page without a deploy. Falls back to the typed data file when
 * the DB has no row (or in mock mode).
 */
function mapLanding(row: Record<string, unknown>): LandingPage {
  return {
    slug: row.slug as string,
    announcement: (row.announcement as string) ?? null,
    eyebrow: (row.eyebrow_text as string) ?? null,
    headline: row.headline as string,
    headlineEm: (row.headline_em as string) ?? null,
    subheadline: (row.subheadline as string) ?? (row.sub_headline as string) ?? "",
    openingCopy: (row.opening_copy as string) ?? null,
    heroImage: (row.hero_image as string) ?? null,
    trustBullets: (row.trust_bullets as string[]) ?? [],
    productSlug: row.product_slug as string,
    variantSize: row.variant_size as string,
    ctaLabel: (row.cta_label as string) ?? (row.cta_text as string) ?? "Add to Cart",
    ctaButtonColor: ((row.cta_button_color as string) === "gold" ? "gold" : "navy"),
    secondaryCtaLabel: (row.secondary_cta_label as string) ?? null,
    variantNote: (row.variant_note as string) ?? null,
    campaignId: (row.campaign_id as string) ?? null,
    active: (row.active as boolean) ?? true,
    noindex: (row.noindex as boolean) ?? true,
    metaTitle: (row.meta_title as string) ?? null,
    showLabCard: (row.show_lab_card as boolean) ?? true,
    showComparison: (row.show_comparison as boolean) ?? false,
    comparisonRows: (row.comparison_rows as ComparisonRow[]) ?? [],
    showPainPoints: (row.show_pain_points as boolean) ?? false,
    painPoints: (row.pain_points as PainPointPair[]) ?? [],
    showStory: (row.show_story as boolean) ?? false,
    storyHeading: (row.story_heading as string) ?? null,
    storyCopy: (row.story_copy as string) ?? null,
    storyAttribution: (row.story_attribution as string) ?? null,
    showProcess: (row.show_process as boolean) ?? false,
    processSteps: (row.process_steps as ProcessStep[]) ?? [],
    showHonest: (row.show_honest as boolean) ?? false,
    honestCopy: (row.honest_copy as string) ?? null,
    faqs: (row.faqs as FaqItem[]) ?? [],
  };
}

function fallback(slug: string): LandingPage | null {
  return fallbackLandingPages.find((l) => l.slug === slug && l.active) ?? null;
}

export const getLandingPage = cache(async (slug: string): Promise<LandingPage | null> => {
  if (USE_MOCK_DATA) return fallback(slug);
  const sb = getServerSupabase();
  if (!sb) return fallback(slug);
  try {
    const { data, error } = await sb
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (data) return mapLanding(data as Record<string, unknown>);
    return fallback(slug);
  } catch (err) {
    safeError("landing", "DATABASE READ FAILED — using typed fallback copy", { err: String(err) });
    return fallback(slug);
  }
});
