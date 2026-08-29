import type { Product, ProductImage } from "@/types";
import { comboBundleProducts } from "./combos";

/**
 * Canonical launch catalog. Single source of truth for mock mode AND the
 * derivation of supabase/seed.sql. Prices/batches flagged in ASSUMPTIONS.md as
 * CONFIRM are placeholders. Design-only extras (coconut oil, mustard honey,
 * extra sizes) are seeded active:false so they never route at launch.
 */

// Website Changes §02: the uploaded stock photos were wrong (honey jar for ghee,
// seeds/peanuts for oils). Reverting to the on-brand coloured placeholders until
// real product photography is supplied. Add a key here once a real /product-images
// photo exists for it.
const realProductImageKeys = new Set<string>([]);

function images(key: string, name: string): ProductImage[] {
  const hasRealImage = realProductImageKeys.has(key);
  const url = hasRealImage ? `/product-images/${key}.jpg` : `/placeholders/${key}.svg`;
  const suffix = hasRealImage ? "" : " (placeholder pending photography)";

  // Four images per product (Dev Kit section 08: min 4 images).
  return [1, 2, 3, 4].map((n, i) => ({
    id: `${key}-img-${n}`,
    url,
    alt: `${name} - product photo ${n}${suffix}`,
    position: i,
  }));
}

export const catalog: Product[] = [
  {
    id: "prod-ghee",
    productName: "A2 Gir Cow Bilona Ghee",
    slug: "a2-gir-cow-bilona-ghee",
    category: "ghee",
    routePrefix: "ghee",
    shortDescription:
      "Slow-churned by the traditional bilona method from A2 Gir cow milk. NABL lab-tested, batch-traced, nothing added.",
    longDescription: `## Made the way it always should be

Vara's A2 Gir Cow Bilona Ghee is hand-churned from cultured curd into butter, then slow-cooked on a wood fire into golden ghee. No centrifuge, no shortcuts — the bilona method your grandmother would recognise.

## Why bilona matters

Industrial ghee is separated by machine from cream. Bilona ghee begins with curd, is hand-churned, and slow-simmered. The result is a grainy texture, a nutty aroma, and a flavour that machine ghee cannot replicate.

### Sourcing

Made from the milk of A2 Gir cows raised on known farms in Rajasthan. Traceable to a single source — not aggregated from unknown suppliers.

### Testing

Every batch is independently NABL lab-tested before it ships. Scan the QR on your jar to see the exact report for the batch in your hand.`,
    ingredients: "100% A2 Gir cow milk ghee. Nothing else. No preservatives, no colour, no additives.",
    nutritionalInfo: {
      servingSize: "per 100 g (approx. — CONFIRM with Label Spec)",
      rows: [
        { label: "Energy", value: "900 kcal" },
        { label: "Total Fat", value: "100 g" },
        { label: "Saturated Fat", value: "62 g" },
        { label: "Trans Fat", value: "0 g" },
        { label: "Cholesterol", value: "256 mg" },
      ],
    },
    metaTitle: null,
    metaDescription: null,
    faqs: [
      {
        question: "What is bilona ghee?",
        answer:
          "Bilona is a traditional method where cultured curd is hand-churned into butter, which is then slow-cooked into ghee. It differs from industrial ghee made by machine-separating cream.",
      },
      {
        question: "Is this A2 ghee?",
        answer:
          "Yes. It is made from the milk of A2 Gir cows, which produce the A2 beta-casein protein.",
      },
      {
        question: "How do I verify the lab report?",
        answer:
          "Every jar carries a batch-specific QR code. Scan it, or visit the verify page with your batch number, to see the NABL lab report for that exact batch.",
      },
      {
        question: "How should I store it?",
        answer:
          "Store in a cool, dry place away from direct sunlight. Ghee does not require refrigeration. Always use a dry spoon.",
      },
      {
        question: "What is the shelf life?",
        answer:
          "Best before is printed on each jar and shown on the batch verification page. Typically 9–12 months from manufacture.",
      },
    ],
    learnLinks: ["what-is-bilona-ghee", "a2-vs-a1-ghee-difference"],
    active: true,
    featured: true,
    isBundle: false,
    variants: [
      {
        id: "var-ghee-250",
        productId: "prod-ghee",
        size: "250ml",
        sku: "VARA-GHEE-250",
        price: 799,
        compareAtPrice: null,
        stock: 40,
        unitLabel: "250ml",
        unitBase: 250,
        unitType: "ml",
        active: false, // design-only extra size
        routeSlug: null,
      },
      {
        id: "var-ghee-500",
        productId: "prod-ghee",
        size: "500ml",
        sku: "VARA-GHEE-500",
        price: 1399,
        compareAtPrice: null,
        stock: 50,
        unitLabel: "500ml",
        unitBase: 500,
        unitType: "ml",
        active: true,
        routeSlug: "a2-gir-cow-bilona-ghee-500ml",
      },
      {
        id: "var-ghee-1l",
        productId: "prod-ghee",
        size: "1L",
        sku: "VARA-GHEE-1000",
        price: 2599, // Fix #9 — confirmed price
        compareAtPrice: 2798,
        stock: 30,
        unitLabel: "1L",
        unitBase: 1000,
        unitType: "ml",
        active: true,
        routeSlug: "a2-gir-cow-bilona-ghee-1l",
      },
    ],
    images: images("ghee", "A2 Gir Cow Bilona Ghee"),
    currentBatch: {
      id: "batch-ghee",
      productId: "prod-ghee",
      batchNumber: "GHE-2024-047",
      mfgDate: "2026-05-10",
      bestBefore: "2027-05-09",
      labReportUrl: null, // REQUIRES FINAL CONTENT — real NABL PDF URL
      active: true,
      labParameters: [
        { id: "lp-g1", name: "Moisture content", result: "0.12%", status: "Pass", position: 0 },
        { id: "lp-g2", name: "Butyric acid (C4:0)", result: "3.82%", status: "Premium", position: 1 },
        { id: "lp-g3", name: "Antibiotics", result: "Not detected", status: "Pass", position: 2 },
        { id: "lp-g4", name: "Heavy metals", result: "Not detected", status: "Pass", position: 3 },
      ],
    },
  },
  {
    id: "prod-honey",
    productName: "Raw Wild Forest Honey",
    slug: "raw-wild-forest-honey",
    category: "honey",
    routePrefix: "honey",
    shortDescription:
      "Wild-harvested, unheated and pollen-rich. Raw honey the way bees make it — never processed, never blended.",
    longDescription: `## Raw, unheated, unblended

Vara's Raw Wild Forest Honey is collected from wild colonies and bottled without heating or filtering out the pollen. Raw honey crystallises naturally over time — a sign it has not been processed.

## What "raw" really means

Commercial honey is often heated and micro-filtered, stripping pollen and enzymes for a permanently clear jar. Raw honey keeps them, which is why it may set or crystallise.

### Testing

Batch-tested for purity markers. Scan the QR on your jar to see the report.`,
    ingredients: "100% raw wild forest honey. Nothing added.",
    nutritionalInfo: {
      servingSize: "per 100 g (approx. — CONFIRM with Label Spec)",
      rows: [
        { label: "Energy", value: "304 kcal" },
        { label: "Carbohydrate", value: "82 g" },
        { label: "of which Sugars", value: "82 g" },
        { label: "Protein", value: "0.3 g" },
        { label: "Fat", value: "0 g" },
      ],
    },
    metaTitle: null,
    metaDescription: null,
    faqs: [
      {
        question: "Why has my honey crystallised?",
        answer:
          "Crystallisation is natural for raw, unheated honey and is a sign of purity. Warm the jar gently in warm water to re-liquefy — never microwave.",
      },
      {
        question: "Is this honey pasteurised?",
        answer: "No. It is raw and unheated, so it retains natural pollen and enzymes.",
      },
      {
        question: "How do I check it is pure?",
        answer:
          "Every jar is batch-traced with a QR code linking to its purity report. See our Learn Hub guide on checking honey purity.",
      },
      {
        question: "Is it safe for children under one year?",
        answer:
          "Raw honey is not recommended for infants under 12 months, in line with standard health guidance.",
      },
      {
        question: "How should I store it?",
        answer: "Store at room temperature with the lid closed. Do not refrigerate.",
      },
    ],
    learnLinks: ["how-to-check-honey-is-pure", "what-is-raw-honey"],
    active: true,
    featured: false,
    isBundle: false,
    variants: [
      {
        id: "var-honey-250",
        productId: "prod-honey",
        size: "250g",
        sku: "VARA-HONEY-250",
        price: 399,
        compareAtPrice: null,
        stock: 60,
        unitLabel: "250g",
        unitBase: 250,
        unitType: "g",
        active: true, // Fix #24 — 250g now sold alongside 500g
        routeSlug: "raw-wild-forest-honey-250g",
      },
      {
        id: "var-honey-500",
        productId: "prod-honey",
        size: "500g",
        sku: "VARA-HONEY-500",
        price: 749, // CONFIRM
        compareAtPrice: null,
        stock: 45,
        unitLabel: "500g",
        unitBase: 500,
        unitType: "g",
        active: true,
        routeSlug: "raw-wild-forest-honey-500g",
      },
      {
        id: "var-honey-1kg",
        productId: "prod-honey",
        size: "1kg",
        sku: "VARA-HONEY-1000",
        price: 1399,
        compareAtPrice: null,
        stock: 20,
        unitLabel: "1kg",
        unitBase: 1000,
        unitType: "g",
        active: false,
        routeSlug: null,
      },
    ],
    images: images("honey", "Raw Wild Forest Honey"),
    currentBatch: {
      id: "batch-honey",
      productId: "prod-honey",
      batchNumber: "HON-2024-013",
      mfgDate: "2026-04-22",
      bestBefore: "2028-04-21",
      labReportUrl: null,
      active: true,
      labParameters: [
        { id: "lp-h1", name: "Moisture", result: "17.8%", status: "Pass", position: 0 },
        { id: "lp-h2", name: "HMF", result: "12 mg/kg", status: "Pass", position: 1 },
        { id: "lp-h3", name: "Added sugar (C4)", result: "Not detected", status: "Pass", position: 2 },
        { id: "lp-h4", name: "Antibiotics", result: "Not detected", status: "Pass", position: 3 },
      ],
    },
  },
  {
    id: "prod-sesame",
    productName: "Wood Pressed Sesame Oil",
    slug: "wood-pressed-sesame-oil",
    category: "oils",
    routePrefix: "oils",
    shortDescription:
      "Extracted on a traditional wooden ghani — not steel cold-press. Unrefined, full-flavoured sesame oil.",
    longDescription: `## Wooden ghani, not steel press

Our sesame oil is extracted on a wooden ghani (kolhu), the traditional slow-pressing method. It is unrefined and retains the aroma and character that high-heat machine extraction strips away.

## Ghani vs cold-pressed

"Cold-pressed" usually means a steel expeller. A wooden ghani turns slowly, and the wood interacts with the seed differently. See our Learn Hub guide on the difference.`,
    ingredients: "100% wood-pressed (ghani) sesame oil. Unrefined. No additives.",
    nutritionalInfo: {
      servingSize: "per 100 ml (approx. — CONFIRM with Label Spec)",
      rows: [
        { label: "Energy", value: "884 kcal" },
        { label: "Total Fat", value: "100 g" },
        { label: "Saturated Fat", value: "15 g" },
        { label: "Monounsaturated Fat", value: "41 g" },
        { label: "Polyunsaturated Fat", value: "44 g" },
      ],
    },
    metaTitle: null,
    metaDescription: null,
    faqs: [
      {
        question: "What is wood-pressed oil?",
        answer:
          "Oil extracted on a traditional wooden ghani that presses seeds slowly, keeping temperatures lower than industrial extraction and retaining natural flavour.",
      },
      {
        question: "Is wood-pressed the same as cold-pressed?",
        answer:
          "Not exactly. See our Learn Hub article comparing wood-pressed and cold-pressed oils.",
      },
      {
        question: "Can I use it for high-heat cooking?",
        answer:
          "Sesame oil is well suited to Indian tempering and sautéing. For deep frying, use in moderation.",
      },
      {
        question: "Why does it taste stronger than refined oil?",
        answer: "Because it is unrefined — the natural aroma and nutrients are intact.",
      },
      {
        question: "How should I store it?",
        answer: "Keep in a cool, dark place away from sunlight and tightly closed.",
      },
    ],
    learnLinks: ["wood-pressed-vs-cold-pressed", "what-is-ghani-pressing"],
    active: true,
    featured: false,
    isBundle: false,
    variants: [
      {
        id: "var-sesame-500",
        productId: "prod-sesame",
        size: "500ml",
        sku: "VARA-SESAME-500",
        price: 599,
        compareAtPrice: null,
        stock: 35,
        unitLabel: "500ml",
        unitBase: 500,
        unitType: "ml",
        active: false,
        routeSlug: null,
      },
      {
        id: "var-sesame-1l",
        productId: "prod-sesame",
        size: "1L",
        sku: "VARA-SESAME-1000",
        price: 899, // Fix #8 — corrected price
        compareAtPrice: null,
        stock: 30,
        unitLabel: "1L",
        unitBase: 1000,
        unitType: "ml",
        active: true,
        routeSlug: "wood-pressed-sesame-oil-1l",
      },
    ],
    images: images("sesame", "Wood Pressed Sesame Oil"),
    currentBatch: {
      id: "batch-sesame",
      productId: "prod-sesame",
      batchNumber: "SES-2024-008",
      mfgDate: "2026-05-02",
      bestBefore: "2027-02-01",
      labReportUrl: null,
      active: true,
      labParameters: [
        { id: "lp-s1", name: "Free fatty acids", result: "0.9%", status: "Pass", position: 0 },
        { id: "lp-s2", name: "Peroxide value", result: "1.8 meq/kg", status: "Pass", position: 1 },
        { id: "lp-s3", name: "Argemone oil", result: "Not detected", status: "Pass", position: 2 },
        { id: "lp-s4", name: "Mineral oil", result: "Not detected", status: "Pass", position: 3 },
      ],
    },
  },
  {
    id: "prod-groundnut",
    productName: "Wood Pressed Groundnut Oil",
    slug: "wood-pressed-groundnut-oil",
    category: "oils",
    routePrefix: "oils",
    shortDescription:
      "Ghani-pressed groundnut (peanut) oil. No chemical refining, no deodorising — just pressed and filtered.",
    longDescription: `## Traditional groundnut oil

Pressed on a wooden ghani and simply filtered — never chemically refined or deodorised. A staple oil for everyday Indian cooking with its natural nutty flavour intact.

## Unrefined by choice

Refined oils are stripped and deodorised for a neutral taste and long shelf life. We keep ours unrefined so you get the real thing.`,
    ingredients: "100% wood-pressed (ghani) groundnut oil. Unrefined. No additives.",
    nutritionalInfo: {
      servingSize: "per 100 ml (approx. — CONFIRM with Label Spec)",
      rows: [
        { label: "Energy", value: "884 kcal" },
        { label: "Total Fat", value: "100 g" },
        { label: "Saturated Fat", value: "17 g" },
        { label: "Monounsaturated Fat", value: "46 g" },
        { label: "Polyunsaturated Fat", value: "32 g" },
      ],
    },
    metaTitle: null,
    metaDescription: null,
    faqs: [
      {
        question: "Is this oil refined?",
        answer: "No. It is wood-pressed and filtered only — never chemically refined or deodorised.",
      },
      {
        question: "Is it suitable for deep frying?",
        answer: "Groundnut oil has a relatively high smoke point and is commonly used for frying.",
      },
      {
        question: "Does it contain allergens?",
        answer: "Yes — this is peanut (groundnut) oil. Avoid if you have a peanut allergy.",
      },
      {
        question: "Why is it cloudy sometimes?",
        answer: "Unrefined oils can appear slightly cloudy, especially when cool. This is normal.",
      },
      {
        question: "How should I store it?",
        answer: "Store in a cool, dark place, tightly closed.",
      },
    ],
    learnLinks: ["wood-pressed-vs-cold-pressed", "what-is-ghani-pressing"],
    active: true,
    featured: false,
    isBundle: false,
    variants: [
      {
        id: "var-groundnut-1l",
        productId: "prod-groundnut",
        size: "1L",
        sku: "VARA-GNUT-1000",
        price: 849,
        compareAtPrice: null,
        stock: 40,
        unitLabel: "1L",
        unitBase: 1000,
        unitType: "ml",
        active: true,
        routeSlug: "wood-pressed-groundnut-oil-1l",
      },
    ],
    images: images("groundnut", "Wood Pressed Groundnut Oil"),
    currentBatch: {
      id: "batch-groundnut",
      productId: "prod-groundnut",
      batchNumber: "GNT-2024-005",
      mfgDate: "2026-05-06",
      bestBefore: "2027-02-05",
      labReportUrl: null,
      active: true,
      labParameters: [
        { id: "lp-n1", name: "Free fatty acids", result: "1.1%", status: "Pass", position: 0 },
        { id: "lp-n2", name: "Peroxide value", result: "2.0 meq/kg", status: "Pass", position: 1 },
        { id: "lp-n3", name: "Aflatoxin", result: "Not detected", status: "Pass", position: 2 },
        { id: "lp-n4", name: "Argemone oil", result: "Not detected", status: "Pass", position: 3 },
      ],
    },
  },

  // ── Design-only extras — seeded active:false (see ASSUMPTIONS §C7). ──
  {
    id: "prod-coconut",
    productName: "Extra Virgin Coconut Oil",
    slug: "extra-virgin-coconut-oil",
    category: "oils",
    routePrefix: "oils",
    shortDescription: "Cold-pressed, unrefined coconut oil from Kerala. (Not part of the launch catalog.)",
    longDescription: "## Extra Virgin Coconut Oil\n\nDesign-only placeholder pending confirmation.",
    ingredients: "100% cold-pressed virgin coconut oil.",
    nutritionalInfo: null,
    metaTitle: null,
    metaDescription: null,
    faqs: [],
    learnLinks: [],
    active: false,
    featured: false,
    isBundle: false,
    variants: [
      {
        id: "var-coconut-500",
        productId: "prod-coconut",
        size: "500ml",
        sku: "VARA-COCO-500",
        price: 799,
        compareAtPrice: null,
        stock: 0,
        unitLabel: "500ml",
        unitBase: 500,
        unitType: "ml",
        active: false,
        routeSlug: null,
      },
    ],
    images: images("coconut", "Extra Virgin Coconut Oil"),
    currentBatch: null,
  },
  {
    id: "prod-mustard-honey",
    productName: "Mustard Flower Honey",
    slug: "mustard-flower-honey",
    category: "honey",
    routePrefix: "honey",
    shortDescription: "Single-origin mustard flower honey that crystallises naturally. (Not part of the launch catalog.)",
    longDescription: "## Mustard Flower Honey\n\nDesign-only placeholder pending confirmation.",
    ingredients: "100% raw mustard flower honey.",
    nutritionalInfo: null,
    metaTitle: null,
    metaDescription: null,
    faqs: [],
    learnLinks: [],
    active: false,
    featured: false,
    isBundle: false,
    variants: [
      {
        id: "var-mustard-honey-500",
        productId: "prod-mustard-honey",
        size: "500g",
        sku: "VARA-MHONEY-500",
        price: 649,
        compareAtPrice: null,
        stock: 0,
        unitLabel: "500g",
        unitBase: 500,
        unitType: "g",
        active: false,
        routeSlug: null,
      },
    ],
    images: images("mustard-honey", "Mustard Flower Honey"),
    currentBatch: null,
  },
];

/** The Wellness Starter bundle (Dev Kit §Bundle). Priced from the design. */
export const bundleProduct: Product = {
  id: "prod-bundle-wellness",
  productName: "The Wellness Starter Bundle",
  slug: "wellness-starter",
  category: "ghee",
  routePrefix: "ghee", // nominal; bundle lives at /bundles/wellness-starter
  shortDescription:
    "A2 Gir Cow Bilona Ghee 500ml + Raw Wild Forest Honey — the perfect start. NABL lab reports for both.",
  longDescription: `## The Wellness Starter

Everything you need to begin: our hand-churned A2 Gir Cow Bilona Ghee and Raw Wild Forest Honey, both batch-traced with NABL lab reports. Perfect for daily cooking and your morning routine.`,
  ingredients: null,
  nutritionalInfo: null,
  metaTitle: null,
  metaDescription: null,
  faqs: [
    {
      question: "What is included in the bundle?",
      answer:
        "A2 Gir Cow Bilona Ghee (500ml) and Raw Wild Forest Honey. Both carry batch-specific NABL lab reports.",
    },
    {
      question: "Do the products carry lab reports?",
      answer: "Yes — each product in the bundle is batch-traced and QR-verifiable.",
    },
  ],
  learnLinks: ["what-is-bilona-ghee", "what-is-raw-honey"],
  active: true,
  featured: true,
  isBundle: true,
  variants: [
    {
      id: "var-bundle-wellness",
      productId: "prod-bundle-wellness",
      size: "Bundle",
      sku: "VARA-BUNDLE-WELLNESS",
      price: 1799,
      compareAtPrice: 1948,
      stock: 25,
      unitLabel: "bundle",
      unitBase: 0,
      unitType: "g",
      active: true,
      routeSlug: "wellness-starter",
    },
  ],
  images: images("bundle", "The Wellness Starter Bundle"),
  currentBatch: null,
};

// Combo bundle products make combos purchasable through the existing checkout
// (getVariantById resolves them). They are is_bundle, so /shop never lists them.
export const allProducts: Product[] = [...catalog, bundleProduct, ...comboBundleProducts];
