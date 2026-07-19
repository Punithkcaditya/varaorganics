import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "@/components/ui/Icons";
import { LandingCTA } from "@/components/lp/LandingCTA";
import { LpStickyBar } from "@/components/lp/LpStickyBar";
import {
  ComparisonTable,
  HonestSection,
  LabCard,
  LpFaq,
  LpHeroImage,
  LpTrustStrip,
  PainPointColumns,
  ProcessSteps,
  StorySection,
} from "@/components/lp/sections";
import { Logo } from "@/components/layout/Logo";
import { getLandingPage } from "@/features/articles/landing";
import { findByRouteSlug } from "@/features/products/queries";
import { site } from "@/config/site";

// SSR, personalised per campaign (Dev Kit §07). noindex/nofollow — paid traffic
// only. Lives outside the (store) group so there is NO site navigation.
export const dynamic = "force-dynamic";

const HERO_ID = "lp-hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  return {
    title: lp?.metaTitle ?? lp?.headline ?? "Vara Organics",
    description: lp?.subheadline,
    robots: lp?.noindex === false ? undefined : { index: false, follow: false },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) notFound();

  const resolved = await findByRouteSlug(lp.productSlug);
  if (!resolved) notFound();
  const { product } = resolved;
  const variant =
    product.variants.find((v) => v.active && v.size === lp.variantSize) ??
    product.variants.find((v) => v.active)!;

  const cartItem = {
    variantId: variant.id,
    productId: product.id,
    slug: product.slug,
    routePrefix: product.routePrefix,
    productName: product.productName,
    size: variant.size,
    price: variant.price,
    unitLabel: variant.unitLabel,
    image: product.images[0]?.url ?? null,
  };

  return (
    <main id="main" className="bg-ivory">
      {/* Announcement bar */}
      {lp.announcement && (
        <div className="bg-navy px-4 py-2.5 text-center text-xs font-light tracking-[0.1em] text-gold-lt">
          {lp.announcement}
        </div>
      )}

      {/* Logo only — no navigation on landing pages */}
      <div className="px-6 py-6 md:px-[8%]">
        <Logo />
      </div>

      {/* Hero */}
      <section
        id={HERO_ID}
        className="bg-gradient-to-b from-navy-mid to-navy-deep px-6 py-12 md:px-[8%] md:py-16"
      >
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-2">
          <div>
            {lp.eyebrow && (
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
                {lp.eyebrow}
              </p>
            )}
            <h1 className="mb-4 font-serif text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.08] text-ivory">
              {lp.headline}
              {lp.headlineEm && (
                <>
                  {" "}
                  <em className="italic text-gold">{lp.headlineEm}</em>
                </>
              )}
            </h1>

            {lp.openingCopy
              ? lp.openingCopy.split("\n\n").map((para, i, arr) => (
                  <p
                    key={para.slice(0, 32)}
                    className={
                      i === arr.length - 1 && arr.length > 1
                        ? "mb-6 font-medium text-ivory"
                        : "mb-4 max-w-md text-[15px] font-light leading-relaxed text-ivory/70"
                    }
                  >
                    {para}
                  </p>
                ))
              : (
                  <p className="mb-6 max-w-md text-[15px] font-light leading-relaxed text-ivory/70">
                    {lp.subheadline}
                  </p>
                )}

            {lp.trustBullets.length > 0 && (
              <ul className="mb-8 space-y-2.5">
                {lp.trustBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-[14px] text-ivory/85">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-lt/20 text-gold-lt">
                      <CheckIcon width={12} height={12} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            <LandingCTA label={lp.ctaLabel} sku={variant.sku} item={cartItem} tone={lp.ctaButtonColor} />
            <p className="mt-4 text-sm font-light text-ivory/45">
              Free Bangalore delivery · Ships within 48 hours · 7-day return guarantee
            </p>
          </div>

          <div>
            {lp.showLabCard && product.currentBatch ? (
              <LabCard batch={product.currentBatch} productName={product.productName} />
            ) : (
              <LpHeroImage src={lp.heroImage} alt={product.productName} />
            )}
          </div>
        </div>
      </section>

      {/* Composable sections — toggled from the database */}
      {lp.showComparison && <ComparisonTable rows={lp.comparisonRows} />}
      <LpTrustStrip
        items={[
          "NABL tested — every batch",
          "Own farm · Gir cows · Rajasthan",
          "Scan QR · see your batch report",
        ]}
      />
      {lp.showPainPoints && <PainPointColumns pairs={lp.painPoints} />}
      {lp.showProcess && <ProcessSteps steps={lp.processSteps} />}
      {lp.showStory && lp.storyCopy && (
        <StorySection
          heading={lp.storyHeading ?? "Why we started"}
          copy={lp.storyCopy}
          attribution={lp.storyAttribution}
        />
      )}
      {lp.showHonest && lp.honestCopy && <HonestSection copy={lp.honestCopy} />}
      <LpFaq faqs={lp.faqs} />

      {/* Closing CTA */}
      <section className="bg-navy px-6 py-16 text-center md:px-[8%]">
        <div className="mx-auto max-w-[520px]">
          <LandingCTA
            label={lp.secondaryCtaLabel ?? lp.ctaLabel}
            sku={variant.sku}
            item={cartItem}
            tone="navy-on-dark"
          />
          {lp.variantNote && (
            <p className="mt-4 text-sm font-light text-ivory/55">{lp.variantNote}</p>
          )}
          <p className="mt-2 text-xs font-light text-ivory/40">
            Free Bangalore delivery on orders ₹999+ · Ships within 48 hours
          </p>
        </div>
      </section>

      {/* Minimal footer — no nav links */}
      <footer className="bg-navy-deep px-6 py-8 text-center md:px-[8%]">
        <p className="text-xs font-light text-ivory/45">
          © {new Date().getFullYear()} {site.name} · By {site.legalName}
          {site.fssaiLicence ? ` · FSSAI ${site.fssaiLicence}` : " · FSSAI applied"}
        </p>
        <p className="mt-2 text-xs font-light text-ivory/35">
          Looking for our full website?{" "}
          <Link href="/" className="text-gold-lt underline">
            Visit {site.url.replace(/^https?:\/\//, "")}
          </Link>
        </p>
      </footer>

      <LpStickyBar item={cartItem} ctaLabel="Add to Cart" sku={variant.sku} heroId={HERO_ID} />
    </main>
  );
}
