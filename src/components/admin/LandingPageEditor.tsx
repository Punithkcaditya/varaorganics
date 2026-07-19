"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/forms/Field";
import type { LandingPage } from "@/types";

const TOGGLES = [
  { key: "showLabCard", label: "Lab report card" },
  { key: "showComparison", label: "Price comparison table" },
  { key: "showPainPoints", label: "Problem vs Vara columns" },
  { key: "showProcess", label: "4-step how it works" },
  { key: "showStory", label: "Founder story" },
  { key: "showHonest", label: "Honest 'we're new' note" },
] as const;

type ToggleKey = (typeof TOGGLES)[number]["key"];

/**
 * Compose an ad landing page from toggleable sections — no deploy needed.
 * Rich content (comparison rows, pain points, FAQs) is edited in Supabase;
 * this covers the fields changed most often per campaign.
 */
export function LandingPageEditor({ existing }: { existing: LandingPage[] }) {
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [headlineEm, setHeadlineEm] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [productSlug, setProductSlug] = useState("a2-gir-cow-bilona-ghee-500ml");
  const [variantSize, setVariantSize] = useState("500ml");
  const [ctaLabel, setCtaLabel] = useState("Add to Cart");
  const [ctaButtonColor, setCtaButtonColor] = useState<"navy" | "gold">("navy");
  const [campaignId, setCampaignId] = useState("");
  const [active, setActive] = useState(true);
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    showLabCard: true,
    showComparison: false,
    showPainPoints: false,
    showProcess: false,
    showStory: false,
    showHonest: false,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function load(lp: LandingPage) {
    setSlug(lp.slug);
    setHeadline(lp.headline);
    setHeadlineEm(lp.headlineEm ?? "");
    setSubheadline(lp.subheadline);
    setEyebrow(lp.eyebrow ?? "");
    setAnnouncement(lp.announcement ?? "");
    setProductSlug(lp.productSlug);
    setVariantSize(lp.variantSize);
    setCtaLabel(lp.ctaLabel);
    setCtaButtonColor(lp.ctaButtonColor);
    setCampaignId(lp.campaignId ?? "");
    setActive(lp.active);
    setToggles({
      showLabCard: lp.showLabCard,
      showComparison: lp.showComparison,
      showPainPoints: lp.showPainPoints,
      showProcess: lp.showProcess,
      showStory: lp.showStory,
      showHonest: lp.showHonest,
    });
  }

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          headline,
          headlineEm,
          subheadline,
          eyebrow,
          announcement,
          productSlug,
          variantSize,
          ctaLabel,
          ctaButtonColor,
          campaignId,
          active,
          ...toggles,
        }),
      });
      const data = await res.json();
      setStatus(data.ok ? "done" : "error");
      setMessage(data.ok ? `Saved /lp/${slug}.` : (data.message ?? "Could not save."));
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      {existing.length > 0 && (
        <div className="rounded border border-navy/10 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-navy/50">
            Load an existing page
          </p>
          <div className="flex flex-wrap gap-2">
            {existing.map((lp) => (
              <button
                key={lp.slug}
                type="button"
                onClick={() => load(lp)}
                className="rounded-full border border-navy/15 px-3.5 py-1.5 text-xs text-navy/70 hover:border-navy hover:text-navy"
              >
                /lp/{lp.slug}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug (URL)" htmlFor="slug" required>
          <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ghee-bangalore" className={inputClass(false)} />
        </Field>
        <Field label="Campaign ID" htmlFor="campaignId">
          <input id="campaignId" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Headline" htmlFor="headline" required className="sm:col-span-2">
          <input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Headline — gold italic part" htmlFor="headlineEm">
          <input id="headlineEm" value={headlineEm} onChange={(e) => setHeadlineEm(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Eyebrow" htmlFor="eyebrow">
          <input id="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Sub-headline" htmlFor="subheadline" className="sm:col-span-2">
          <textarea id="subheadline" rows={2} value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Announcement bar" htmlFor="announcement" className="sm:col-span-2">
          <input id="announcement" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Product slug" htmlFor="productSlug" required>
          <input id="productSlug" value={productSlug} onChange={(e) => setProductSlug(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Variant size" htmlFor="variantSize" required>
          <input id="variantSize" value={variantSize} onChange={(e) => setVariantSize(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="CTA label" htmlFor="ctaLabel" required>
          <input id="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="CTA colour" htmlFor="ctaButtonColor">
          <select
            id="ctaButtonColor"
            value={ctaButtonColor}
            onChange={(e) => setCtaButtonColor(e.target.value as "navy" | "gold")}
            className={inputClass(false)}
          >
            <option value="navy">Navy</option>
            <option value="gold">Gold</option>
          </select>
        </Field>
      </div>

      <section aria-label="Sections">
        <h2 className="mb-2 font-serif text-xl font-semibold text-navy">Sections to show</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 rounded border border-navy/10 bg-white px-3 py-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={toggles[t.key]}
                onChange={(e) => setToggles((s) => ({ ...s, [t.key]: e.target.checked }))}
                className="accent-navy"
              />
              {t.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-navy/45">
          Comparison rows, pain points, story copy and FAQs are edited in the Supabase
          <code className="mx-1">landing_pages</code> row.
        </p>
      </section>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-navy" />
        Active (page is reachable)
      </label>

      {message && (
        <p
          role="status"
          className={`rounded p-3 text-sm ${status === "error" ? "bg-danger/5 text-danger" : "bg-success/5 text-success"}`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={status === "saving" || !slug || !headline}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save landing page"}
      </button>
    </div>
  );
}
