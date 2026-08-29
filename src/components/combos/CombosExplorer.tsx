"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/features/cart/store";
import { formatPrice, cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/Icons";
import type { Combo, Language } from "@/types";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "kannada", label: "ಕನ್ನಡ" },
  { id: "hindi", label: "हिंदी" },
  { id: "telugu", label: "తెలుగు" },
  { id: "tamil", label: "தமிழ்" },
  { id: "english", label: "English" },
];

const STORAGE_KEY = "vara_lang";
const DEFAULT_LANG: Language = "kannada"; // Bangalore launch default

const BADGE_CLASS: Record<Combo["badgeColor"], string> = {
  amber: "bg-amber text-ivory",
  green: "bg-success text-ivory",
  gold: "bg-gold text-navy",
  blue: "bg-navy-mid text-ivory",
};

/** Temporary catalogue photography until dedicated combo shoots are supplied. */
const TEMP_PRODUCT_IMAGES: Record<string, string> = {
  "a2-gir-cow-bilona-ghee": "/products/ghee.jpg",
  "raw-wild-forest-honey": "/products/honey.jpg",
  "wood-pressed-sesame-oil": "/products/sesame.jpg",
  "wood-pressed-groundnut-oil": "/products/groundnut.jpg",
};

/**
 * Combos page interactive layer: a 5-language toggle (persisted to localStorage)
 * that switches every combo's regional name without a reload, plus the grid of
 * combo cards. Each card adds the combo as one discounted line to the cart.
 */
export function CombosExplorer({ combos }: { combos: Combo[] }) {
  const [lang, setLang] = useState<Language>(DEFAULT_LANG);

  // Read the saved language after mount. We intentionally render the Kannada
  // default on the server and update post-hydration from localStorage — this
  // avoids a hydration mismatch, so the one-time setState here is deliberate.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && saved !== DEFAULT_LANG && LANGUAGES.some((l) => l.id === saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration preference read
        setLang(saved);
      }
    } catch {
      /* private mode / storage blocked — keep default */
    }
  }, []);

  function choose(next: Language) {
    setLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Choose language"
        className="mb-10 flex flex-wrap justify-center gap-2"
      >
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={lang === l.id}
            onClick={() => choose(l.id)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
              lang === l.id
                ? "border-navy bg-navy text-ivory"
                : "border-navy/20 text-navy/70 hover:border-navy",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {combos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} lang={lang} />
        ))}
      </div>
    </div>
  );
}

export function ComboCard({
  combo,
  lang,
  compact = false,
}: {
  combo: Combo;
  lang: Language;
  compact?: boolean;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const temporaryImages = combo.contents.reduce<{ src: string; alt: string }[]>((images, item) => {
    const src = TEMP_PRODUCT_IMAGES[item.productSlug];
    if (src && !images.some((image) => image.src === src)) {
      images.push({
        src,
        alt: `${item.productName} included in ${combo.names.english}`,
      });
    }
    return images;
  }, []);

  function add() {
    addItem({
      variantId: combo.checkout.variantId,
      productId: combo.checkout.productId,
      slug: combo.slug,
      routePrefix: "combos",
      productName: combo.names.english,
      size: "Combo",
      price: combo.comboPrice,
      unitLabel: "combo",
      image: temporaryImages[0]?.src ?? null,
      quantity: 1,
      comboContents: combo.contents,
    });
    setAdded(true);
  }

  return (
    <article
      id={combo.slug}
      className={cn(
        "border-paper relative flex scroll-mt-28 flex-col rounded-2xl border bg-white p-5 shadow-[0_12px_40px_rgba(13,35,70,0.05)] md:p-8",
        compact && "md:h-[700px]",
      )}
    >
      {combo.badgeText && (
        <span
          className={cn(
            "absolute top-5 right-5 rounded-full px-3.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase",
            BADGE_CLASS[combo.badgeColor],
          )}
        >
          {combo.badgeText}
        </span>
      )}

      {/* Regional name switches with the toggle; English stays as the sub-name. */}
      <h2
        lang={lang === "english" ? "en" : undefined}
        className="text-navy font-serif text-[28px] leading-tight font-semibold"
      >
        {combo.names[lang]}
      </h2>
      <p className="text-navy/45 mt-1 text-[13px] font-light">{combo.names.english}</p>

      <hr className="border-paper my-4" />
      <p className={cn("text-amber font-serif text-[15px] italic", compact && "md:min-h-11")}>
        {combo.tagline}
      </p>
      <hr className="border-paper my-4" />

      <p className="text-navy mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
        What is inside
      </p>
      <ul className={cn("space-y-1.5", compact && "md:min-h-[86px]")}>
        {combo.contents.map((item, i) => (
          <li key={i} className="text-navy/70 flex items-center gap-2 text-[13px] font-light">
            <span className="text-success">
              <CheckIcon width={14} height={14} strokeWidth={2.5} />
            </span>
            {item.productName}
            {item.variant && item.variant !== "1" ? ` · ${item.variant}` : ""}
            {item.qty > 1 ? ` × ${item.qty}` : ""}
          </li>
        ))}
      </ul>
      {!compact && (
        <p className="text-success mt-3 flex items-center gap-1.5 text-[11px] font-light">
          <span className="bg-success inline-block h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          Independently tested · Jagdamba Laboratories, Jaipur
        </p>
      )}

      {temporaryImages.length > 0 ? (
        <div
          className={cn(
            "bg-paper mt-5 grid shrink-0 overflow-hidden rounded-xl",
            compact ? "h-44" : "aspect-[16/9]",
            temporaryImages.length > 1 && "grid-cols-2",
          )}
          aria-label={`Products included in ${combo.names.english}`}
        >
          {temporaryImages.slice(0, 4).map((image) => (
            <div key={image.src} className="relative min-h-0 min-w-0 overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 767px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      ) : (
        /* Coloured fallback used on the full combos page until dedicated combo photography is ready. */
        <div className="from-navy-mid to-navy-deep mt-5 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br p-6 text-center">
          <span className="text-ivory/90 font-serif text-lg font-semibold">
            Vara<span className="text-gold">.</span> {combo.names.english}
          </span>
        </div>
      )}

      <hr className="border-paper my-5" />

      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="text-navy font-serif text-2xl font-semibold">
          {formatPrice(combo.comboPrice)}
        </span>
        <span className="text-navy/40 text-sm font-light line-through">
          {formatPrice(combo.mrpIndividual)}
        </span>
        <span className="bg-success/15 text-success rounded-[2px] px-2 py-0.5 text-[11px] font-semibold">
          Save {formatPrice(combo.saving)}
        </span>
      </div>

      <div className="mt-auto">
        {compact && added ? (
          <Link
            href="/cart"
            className="bg-gold text-navy hover:bg-gold-lt block w-full rounded-[2px] py-3.5 text-center text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
          >
            Proceed to Cart →
          </Link>
        ) : (
          <button
            type="button"
            onClick={add}
            className="bg-navy text-ivory hover:bg-amber w-full rounded-[2px] py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
          >
            {added ? "✓ Added to Cart" : combo.ctaText}
          </button>
        )}
        {!compact && added && (
          <Link
            href="/cart"
            className="border-amber text-amber hover:bg-amber hover:text-ivory mt-2 block w-full rounded-[2px] border py-3 text-center text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
          >
            Proceed to Cart →
          </Link>
        )}
        {!compact && (
          <p className="text-navy/45 mt-2.5 text-center text-[11px] font-light">
            Free Bengaluru delivery above ₹999 · Ships within 48 hours
          </p>
        )}
      </div>
    </article>
  );
}
