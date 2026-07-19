import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

const perks = [
  "7-day no-questions return",
  "Full refund if not satisfied",
  "Lab report on every order",
  "Free Bengaluru delivery",
];

/** Honest launch CTA — no fake reviews (design/Dev Kit). */
export function FirstOrderCTA({ product, variant }: { product: Product; variant: ProductVariant }) {
  return (
    <section className="bg-navy px-6 py-20 text-center md:px-[8%]" aria-label="Be among the first">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
          Be among the first
        </p>
        <h2 className="mb-3.5 font-serif text-[clamp(1.625rem,3vw,2.5rem)] font-semibold leading-tight text-ivory">
          Vara is launching in Bengaluru. <em className="italic text-gold-lt">Your kitchen, our first test.</em>
        </h2>
        <p className="mx-auto mb-8 max-w-[480px] text-[15px] font-light leading-relaxed text-ivory/60">
          We&apos;re a new brand. We don&apos;t have hundreds of reviews yet — and we won&apos;t
          pretend otherwise. What we do have is verified supply, NABL lab reports, and a promise: if
          the ghee doesn&apos;t taste like the best you&apos;ve had, we&apos;ll refund you.
        </p>
        <ul className="mb-9 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-[12.5px] text-ivory/65">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gold-lt/40 bg-gold-lt/20 text-gold-lt">
                <CheckIcon width={10} height={10} />
              </span>
              {perk}
            </li>
          ))}
        </ul>
        <ButtonLink href={`/${product.routePrefix}/${variant.routeSlug}`} variant="gold">
          Try Vara — {formatPrice(variant.price)}
        </ButtonLink>
        <p className="mt-3.5 text-[11.5px] font-light text-ivory/35">
          {product.productName} · {variant.size} · Ships in 48 hours
        </p>
      </div>
    </section>
  );
}
