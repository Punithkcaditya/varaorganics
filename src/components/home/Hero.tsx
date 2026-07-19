import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

const diffPills = [
  "A2 Gir cow — own farm",
  "70-param NABL tested",
  "Wooden ghani pressed",
  "QR batch traceability",
];

const proofStats = [
  { num: "70+", label: "Lab parameters per batch" },
  { num: "A2", label: "Gir cow certified" },
  { num: "0", label: "Middlemen in the chain" },
  { num: "48h", label: "Bengaluru delivery" },
];

/**
 * Pain-point-led hero (design). `headline`/`headlineEm` are settings-driven to
 * support future A/B testing of the headline variant (Dev Kit §05).
 */
export function Hero({
  product,
  variant,
  headline,
  headlineEm,
}: {
  product: Product;
  variant: ProductVariant;
  headline: string;
  headlineEm: string;
}) {
  const batch = product.currentBatch;
  return (
    <section className="bg-ivory" aria-label="Introduction">
      <div className="mx-auto grid max-w-[1200px] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-14 md:px-[8%] md:py-20">
          <div className="text-amber mb-3 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] uppercase">
            <span className="h-px w-6 bg-current" aria-hidden="true" />
            Farm to kitchen · Rajasthan
          </div>

          <h1 className="text-navy mb-5 font-serif text-[clamp(2.75rem,5vw,4.375rem)] leading-[1.06] font-semibold">
            {headline} <em className="text-amber italic">{headlineEm}</em>
          </h1>

          <p className="text-navy/70 mb-6 max-w-[460px] text-base leading-relaxed font-light">
            Most ghee on your shelf was made by machine, never tested beyond a handful of
            parameters, and sourced through middlemen. Vara is{" "}
            <strong className="text-navy font-medium">bilona hand-churned</strong>,{" "}
            <strong className="text-navy font-medium">NABL-tested</strong>, and traced back to a
            single farm.
          </p>

          <ul className="mb-9 flex flex-wrap gap-2">
            {diffPills.map((pill) => (
              <li
                key={pill}
                className="border-navy/10 text-navy flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 text-xs"
              >
                <span className="bg-success flex h-4 w-4 items-center justify-center rounded-full text-white">
                  <CheckIcon width={10} height={10} />
                </span>
                {pill}
              </li>
            ))}
          </ul>

          <div className="mb-12 flex flex-col gap-3">
            <ButtonLink
              href={`/${product.routePrefix}/${variant.routeSlug}`}
              className="self-start"
            >
              Shop Vara Ghee — {formatPrice(variant.price)}
            </ButtonLink>
            <span className="text-navy/45 text-xs font-light">
              Free delivery in Bengaluru · Ships in 48 hours
            </span>
          </div>

          <dl className="border-navy/10 flex border-t pt-7">
            {proofStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex-1 ${i > 0 ? "border-navy/10 border-l pl-5" : ""} ${i < proofStats.length - 1 ? "pr-5" : ""}`}
              >
                <dd className="text-navy font-serif text-3xl leading-none font-semibold">
                  {stat.num}
                </dd>
                <dt className="text-navy/45 mt-1 text-[11px] font-light">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: product + live lab preview */}
        <div className="from-navy-mid to-navy-deep relative flex items-center justify-center overflow-hidden bg-gradient-to-b px-6 py-12 md:px-[5%]">
          <div className="border-gold-lt/20 w-full max-w-[340px] rounded-lg border bg-white/[0.06] p-6">
            <p className="text-gold-lt/70 mb-3 text-[9.5px] font-semibold tracking-[0.28em] uppercase">
              Featured product
            </p>
            <h2 className="text-ivory mb-1.5 font-serif text-[22px] font-semibold">
              {product.productName}
            </h2>
            <p className="text-ivory/50 mb-5 flex items-center gap-1.5 text-xs font-light">
              <span className="bg-gold inline-block h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Rajasthan sourced
            </p>

            {batch && (
              <div className="mb-4 rounded-md bg-black/20 p-4">
                <p className="text-gold-lt/70 mb-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Live batch report · {batch.batchNumber}
                </p>
                {batch.labParameters.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-white/5 py-1.5 text-xs last:border-0"
                  >
                    <span className="text-ivory/45 font-light">{p.name}</span>
                    <span className="text-gold-lt font-medium">{p.result}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-ivory font-serif text-2xl font-semibold">
                {formatPrice(variant.price)}{" "}
                <span className="text-ivory/40 text-[13px] font-light">/ {variant.unitLabel}</span>
              </p>
              <ButtonLink
                href={`/${product.routePrefix}/${variant.routeSlug}`}
                variant="gold"
                className="px-5 py-2.5"
              >
                View
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
