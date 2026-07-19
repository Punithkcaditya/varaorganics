"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/layout-primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { heroSlides, promoTiles, type HeroSlide, type PromoTile } from "@/data/promos";
import { cn } from "@/lib/utils";

// Fallback background when a slide has no image yet.
const slideTones: Record<HeroSlide["tone"], string> = {
  paper: "bg-paper",
  ivory: "bg-ivory",
  gold: "bg-gradient-to-br from-gold-lt/30 to-gold/20",
};

// Left→right scrim over the full-bleed image so the navy text stays readable
// on the left while the photo shows through on the right.
const slideScrim: Record<HeroSlide["tone"], string> = {
  paper: "from-paper via-paper/85 to-paper/10 md:to-transparent",
  ivory: "from-ivory via-ivory/85 to-ivory/10 md:to-transparent",
  gold: "from-gold-lt/90 via-gold-lt/55 to-gold-lt/10 md:to-transparent",
};

// Each tile: fallback bg (no image), text colours, and a scrim over the
// full-bleed background image so the text stays readable.
const tileTones: Record<
  PromoTile["tone"],
  { bg: string; scrim: string; text: string; sub: string; cta: string }
> = {
  navy: {
    bg: "bg-gradient-to-br from-navy-mid to-navy-deep",
    scrim: "from-navy-deep/95 via-navy-deep/80 to-navy-deep/40",
    text: "text-ivory",
    sub: "text-gold-lt",
    cta: "text-gold-lt",
  },
  gold: {
    bg: "bg-gradient-to-br from-gold-lt/30 to-gold/20",
    scrim: "from-gold-lt/95 via-gold-lt/70 to-gold-lt/25",
    text: "text-navy",
    sub: "text-amber",
    cta: "text-amber",
  },
  paper: {
    bg: "bg-paper",
    scrim: "from-paper via-paper/80 to-paper/25",
    text: "text-navy",
    sub: "text-amber",
    cta: "text-amber",
  },
};

/**
 * WoodMart-style promo banner: a slider (left) + two promo tiles (right), in
 * Vara's palette/typography. Accessible carousel — arrows, dots, keyboard, and
 * autoplay that respects prefers-reduced-motion. Images are left as empty slots
 * to be filled in later (see src/data/promos.ts).
 */
export function PromoBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <section aria-label="Promotions" className="bg-ivory pt-4 md:pt-6">
      <Container>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Slider */}
          <div
            className="relative overflow-hidden rounded-lg bg-paper lg:col-span-2"
            role="group"
            aria-roledescription="carousel"
            aria-label="Featured promotions"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Sliding track — one slide width each, translated by the index. */}
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {heroSlides.map((s, i) => (
                <div
                  key={s.title}
                  className={cn(
                    "relative w-full shrink-0 overflow-hidden",
                    slideTones[s.tone],
                  )}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={i !== index}
                  inert={i !== index ? true : undefined}
                >
                  {/* Full-bleed background image */}
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-[2px] border border-dashed border-navy/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-navy/35">
                        Image
                      </span>
                    </div>
                  )}

                  {/* Readability scrim over the image */}
                  <div className={cn("absolute inset-0 bg-gradient-to-r", slideScrim[s.tone])} />

                  {/* Text, overlaid on the left */}
                  <div className="relative z-10 flex min-h-[380px] max-w-xl flex-col justify-center p-8 md:min-h-[440px] md:p-14">
                    <span className="mb-4 inline-block w-fit rounded-full bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
                      {s.eyebrow}
                    </span>
                    <h2 className="mb-3 font-serif text-[clamp(1.875rem,3.5vw,3rem)] font-semibold leading-[1.08] text-navy">
                      {s.title}
                    </h2>
                    {s.subtitle && (
                      <p className="mb-6 max-w-sm text-[15px] font-light leading-relaxed text-navy/70">
                        {s.subtitle}
                      </p>
                    )}
                    <ButtonLink href={s.ctaHref} className="w-fit">
                      {s.ctaLabel}
                    </ButtonLink>
                  </div>
                </div>
              ))}
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm transition-colors hover:bg-white"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm transition-colors hover:bg-white"
                >
                  <ChevronRightIcon />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {heroSlides.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === index}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        i === index ? "w-6 bg-navy" : "w-2 bg-navy/25 hover:bg-navy/40",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Two promo tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {promoTiles.map((tile) => {
              const tone = tileTones[tile.tone];
              return (
                <Link
                  key={tile.title}
                  href={tile.ctaHref}
                  className={cn(
                    "group relative flex min-h-[190px] flex-col justify-center overflow-hidden rounded-lg p-6 transition-shadow hover:shadow-[0_16px_44px_rgba(21,40,76,0.11)]",
                    tone.bg,
                  )}
                >
                  {/* Full-bleed background image */}
                  {tile.image && (
                    <Image
                      src={tile.image}
                      alt={tile.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  {/* Readability scrim */}
                  <div className={cn("absolute inset-0 bg-gradient-to-r", tone.scrim)} />

                  <div className="relative z-10 max-w-[70%]">
                    <p className={cn("mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]", tone.sub)}>
                      {tile.eyebrow}
                    </p>
                    <h3 className={cn("mb-3 font-serif text-xl font-semibold leading-tight", tone.text)}>
                      {tile.title}
                    </h3>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4",
                        tone.cta,
                      )}
                    >
                      {tile.ctaLabel} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
