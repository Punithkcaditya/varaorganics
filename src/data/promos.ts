import { LAB_REPORTS_PATH } from "@/config/routes";

/**
 * Homepage promo banner content (slider + two promo tiles). Editable marketing
 * copy. `image` is left null — drop a file in /public and set the path (e.g.
 * "/promos/ghee.jpg"), or wire these to a DB table later. No fabricated
 * discounts: change the copy to match real, approved offers before launch.
 */

export interface HeroSlide {
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  image: string | null;
  tone: "paper" | "ivory" | "gold";
}

export interface PromoTile {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  image: string | null;
  tone: "paper" | "gold" | "navy";
}

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Featured",
    title: "The ghee your grandmother knew",
    subtitle: "Hand-churned A2 Gir Cow Bilona Ghee — NABL lab-tested, batch-traced.",
    ctaLabel: "Shop Ghee — ₹1,399",
    ctaHref: "/ghee/a2-gir-cow-bilona-ghee-500ml",
    image: "/product-images/vg-slider-1.jpg.webp",
    tone: "paper",
  },
  {
    eyebrow: "New Harvest",
    title: "Raw Wild Forest Honey",
    subtitle: "Unheated and pollen-rich — the way bees make it.",
    ctaLabel: "Shop Honey",
    ctaHref: "/honey/raw-wild-forest-honey-500g",
    image: "/product-images/vg-slider-2.jpg.webp",
    tone: "gold",
  },
  {
    eyebrow: "Traditional Method",
    title: "Wood-Pressed Oils",
    subtitle: "Extracted on a wooden ghani. Unrefined, full-flavoured.",
    ctaLabel: "Shop Oils",
    ctaHref: "/shop/oils",
    image: "/product-images/vg-slider-3.jpg.webp",
    tone: "ivory",
  },
  {
    eyebrow: "Shop All",
    title: "The full Vara range",
    subtitle: "Ghee, wood-pressed oils and raw honey — all lab-tested, all traceable.",
    ctaLabel: "Shop All Products",
    ctaHref: "/shop",
    image: "/product-images/vg-slider-4.jpg.webp",
    tone: "paper",
  },
];

export const promoTiles: PromoTile[] = [
  {
    eyebrow: "The Complete Set",
    title: "Wellness Starter Bundle",
    ctaLabel: "Shop Now",
    ctaHref: "/bundles/wellness-starter",
    image: "/products/farm-butter-unsalted-1-430x491.jpg",
    tone: "navy",
  },
  {
    eyebrow: "Verify Every Jar",
    title: "See Your Batch Lab Report",
    ctaLabel: "Learn How",
    ctaHref: LAB_REPORTS_PATH,
    image: "/products/farm-cheese-1-1-430x491.jpg",
    tone: "gold",
  },
];
