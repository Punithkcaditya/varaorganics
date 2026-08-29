"use client";

import Link from "next/link";
import { ComboCard } from "@/components/combos/CombosExplorer";
import { Eyebrow, Section } from "@/components/ui/layout-primitives";
import type { Combo } from "@/types";

const FEATURED_SLUGS = ["mane-ruchi", "ajji-kai-ruchi"];

export function CombosPreview({ combos }: { combos: Combo[] }) {
  const featured = FEATURED_SLUGS.map((slug) => combos.find((combo) => combo.slug === slug)).filter(
    (combo): combo is Combo => Boolean(combo),
  );

  if (featured.length === 0) return null;

  return (
    <Section tone="paper" ariaLabel="Curated kitchen combos">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          <Eyebrow>Better together</Eyebrow>
          <h2 className="text-navy font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] leading-tight font-semibold">
            Curated for real Indian kitchens
          </h2>
          <p className="text-navy/60 mt-3 max-w-2xl text-sm leading-relaxed font-light">
            Traditional pantry essentials grouped for daily cooking, gifting and family wellness.
          </p>
        </div>
        <Link
          href="/combos"
          className="border-amber text-amber border-b pb-0.5 text-xs font-medium tracking-[0.16em] whitespace-nowrap uppercase"
        >
          View all combos →
        </Link>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
        {featured.map((combo) => (
          <ComboCard key={combo.id} combo={combo} lang="kannada" compact />
        ))}
      </div>
    </Section>
  );
}
