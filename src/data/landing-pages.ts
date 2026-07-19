import type { LandingPage } from "@/types";

/**
 * Ad landing pages — typed fallback used when the DB has no matching
 * `landing_pages` row (Dev Kit §07 / Landing Page Copy doc).
 *
 * Copy is supplied by the brand owner and pasted verbatim.
 *
 * ⚠️ CONFIRM BEFORE LAUNCH (see ASSUMPTIONS.md):
 *  - Variant prices here (250ml ₹749, 1L ₹2,599) differ from the catalog
 *    (₹799 / ₹2,699). The catalog is authoritative for anything charged; these
 *    strings are display copy only and must be reconciled.
 *  - The comparison table names competitors with prices and "Not published"
 *    claims. Comparative advertising needs dated evidence on file.
 *  - Lab/accreditation names (Jagdamba Laboratories, ISO 9001:2015, GLP) and
 *    farm details are owner-supplied and must be substantiated.
 */
export const landingPages: LandingPage[] = [
  // ── LP 1 — Google Search traffic ───────────────────────────────────────────
  {
    slug: "ghee-bangalore",
    announcement: "Free delivery in Bangalore on orders above ₹999 · Lab report on every batch",
    eyebrow: "Farm to kitchen · Gau Organics, Kota, Rajasthan",
    headline: "A2 Gir Cow Bilona Ghee. Delivered to Bangalore in 48 hours.",
    headlineEm: null,
    subheadline:
      "NABL tested across 70 parameters. Batch-traced to a single farm. No middlemen. No shortcuts.",
    openingCopy: null,
    heroImage: null,
    trustBullets: [
      "A2 Gir cow — own farm, Rajasthan",
      "70-parameter NABL tested",
      "Bilona hand-churned — not machine made",
      "QR batch traceability on every jar",
    ],
    productSlug: "a2-gir-cow-bilona-ghee-500ml",
    variantSize: "500ml",
    ctaLabel: "Add to Cart — ₹1,399 / 500ml",
    ctaButtonColor: "navy",
    secondaryCtaLabel: "Add to Cart — ₹1,399 / 500ml",
    variantNote: "Also available: 250ml (₹749) · 1L (₹2,599)",
    campaignId: "google-search-ghee-bangalore",
    active: true,
    noindex: true,
    metaTitle: "A2 Gir Cow Bilona Ghee — Bangalore Delivery",
    showLabCard: true,
    showComparison: true,
    comparisonRows: [
      { brand: "Vara Organics", price: "₹1,999", labTested: "70 parameters — NABL verified", isUs: true },
      { brand: "Two Brothers", price: "₹3,999", labTested: "Not published" },
      { brand: "Anveshan", price: "₹3,699", labTested: "Not published" },
      { brand: "Farmse (actual selling price)", price: "₹1,540", labTested: "Not published" },
    ],
    showPainPoints: false,
    painPoints: [],
    showStory: false,
    storyHeading: null,
    storyCopy: null,
    storyAttribution: null,
    showProcess: false,
    processSteps: [],
    showHonest: false,
    honestCopy: null,
    faqs: [
      {
        question: "Is this really from a single farm?",
        answer:
          "Yes. A family-owned farm in Kota, Rajasthan — FSSAI licensed since 2017. 29 Gir cows, 10 hectares, Bilona method only. No brokers, no aggregators.",
      },
      {
        question: "How do I know the lab report is real?",
        answer:
          "Scan the QR code on your jar. It links to the actual Jagdamba Laboratories report for your exact batch — not a generic certificate. You see the numbers, not just a claim.",
      },
      {
        question: "What if I don't like it?",
        answer:
          "7-day no-questions return. Full refund if the ghee doesn't taste like the best you've had. We mean this.",
      },
      {
        question: "How quickly does it arrive?",
        answer:
          "Orders placed before 2pm are dispatched same day. Bangalore delivery in 24–48 hours via Delhivery or Xpressbees.",
      },
    ],
  },

  // ── LP 2 — Meta / Instagram traffic ───────────────────────────────────────
  {
    slug: "pure-ghee-truth",
    announcement:
      "Lab report on every batch · Free Bangalore delivery ₹999+ · 7-day return guarantee",
    eyebrow: "What we found when we looked closely",
    headline: "The ghee your grandmother knew.",
    headlineEm: "Proved, not claimed.",
    subheadline:
      "NABL tested across 70 parameters. Batch-traced to a single farm. No middlemen. No shortcuts.",
    openingCopy:
      "When we looked for genuinely pure A2 ghee — the kind made the right way, from cows you can trace, tested by a real laboratory — we couldn't find it. Every label said pure. Nobody showed the proof.\n\nSo we built Vara.",
    heroImage: null,
    trustBullets: [
      "Bilona hand-churned — curd to butter to ghee",
      "NABL lab tested across 70+ parameters",
      "Direct from the farm — Kota, Rajasthan",
    ],
    productSlug: "a2-gir-cow-bilona-ghee-500ml",
    variantSize: "500ml",
    ctaLabel: "Try Vara — ₹1,399 / 500ml",
    ctaButtonColor: "gold",
    secondaryCtaLabel: "Add to Cart — ₹1,399 / 500ml",
    variantNote: "250ml (₹749) also available · 1L (₹2,599)",
    campaignId: "meta-pure-ghee-truth",
    active: true,
    noindex: true,
    metaTitle: "The ghee your grandmother knew. Proved, not claimed.",
    showLabCard: true,
    showComparison: false,
    comparisonRows: [],
    showPainPoints: true,
    painPoints: [
      {
        problem: "Machine-separated cream — not bilona churned",
        answer: "Bilona hand-churned — curd to butter to ghee, slowly",
      },
      {
        problem: "Never independently tested — or tested on 5 parameters only",
        answer: "NABL lab tested across 70+ parameters every single batch",
      },
      {
        problem: "Sourced through multiple middlemen",
        answer: "Direct from Gau Organics own farm, Kota, Rajasthan",
      },
      {
        problem: "No way to verify any claim on the label",
        answer: "Scan QR on any jar — see your exact test results",
      },
    ],
    showStory: true,
    storyHeading: "Why we started",
    storyCopy:
      "When our daughter was born, we started looking for ghee we could completely trust. Not marketing-trust — proof-trust. A lab report. A named farm. A batch number we could check.\n\nWe found the farm in Rajasthan. We found the laboratory in Jaipur. We asked one question to every supplier: will you let us publish the test results on the jar?\n\nThe ones who said yes became Vara.",
    storyAttribution: "— Founder, Vara Organics",
    showProcess: true,
    processSteps: [
      { title: "Farm, Kota, Rajasthan", body: "Gir cows. Own herd. A2 milk collected at dawn." },
      {
        title: "Bilona method",
        body: "Curd churned into butter by hand. Slow-cooked on wood fire. No machines.",
      },
      {
        title: "NABL lab tested",
        body: "70+ parameters. Every batch. Released only on full clearance.",
      },
      {
        title: "Delivered to you",
        body: "QR on every jar. 48-hour Bangalore delivery. Your batch report, scannable.",
      },
    ],
    showHonest: true,
    honestCopy:
      "We are a new brand.\n\nWe won't pretend to have hundreds of reviews yet. What we do have is a lab report for every batch — accessible by scanning the QR on your jar. If the ghee does not taste like the best you have had, we will refund you. No questions.\n\nThat is the only promise we need to make.",
    faqs: [],
  },
];
