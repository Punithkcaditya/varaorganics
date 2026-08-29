import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/layout-primitives";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { CombosExplorer } from "@/components/combos/CombosExplorer";
import { getPublishedCombos } from "@/features/combos/queries";
import { canonical } from "@/config/site";
import { ComboStickyBar } from "@/components/combos/ComboStickyBar";
import type { FaqItem } from "@/types";

// ISR — combos change rarely; revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Vara Organics Combo Offers — Traditional Kitchen Combos, NABL Tested",
  description:
    "A2 Bilona Ghee, Raw Honey and Wood Pressed Oil combos. Named from Indian kitchen traditions. All NABL tested. Free Bengaluru delivery.",
  path: "combos",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Combos", path: "/combos" },
];

const faqs: FaqItem[] = [
  {
    question: "What is included in each Vara combo?",
    answer:
      "Every card lists its exact products, sizes and quantities. Gift-ready combos also show the wrapping and handwritten-card inclusions.",
  },
  {
    question: "Are the products in the combos independently tested?",
    answer:
      "Yes. The food products are independently tested at Jagdamba Laboratories, Jaipur, and their batch reports remain available through Vara's lab-report pages.",
  },
  {
    question: "How is the combo saving calculated?",
    answer:
      "The crossed-out amount is the individual MRP total supplied in the combo sheet. The difference between that amount and the combo price is shown as your saving.",
  },
  {
    question: "Can I change a product or size inside a combo?",
    answer:
      "The listed combinations are fixed so the price, packing and stock can be verified correctly. You can purchase different sizes separately from the Shop page.",
  },
  {
    question: "Where do you deliver these combos?",
    answer:
      "Bengaluru orders above ₹999 qualify for free delivery. Other destinations and the Export Special are confirmed during checkout according to available serviceability.",
  },
];

export default async function CombosPage() {
  const combos = await getPublishedCombos();

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(faqs)} />
      {combos.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: combos.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: c.names.english,
                description: c.tagline,
                url: canonical(`combos#${c.slug}`),
                offers: {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  price: c.comboPrice,
                  availability: "https://schema.org/InStock",
                },
              },
            })),
          }}
        />
      )}

      {/* Hero */}
      <main className="pb-20 md:pb-0">
        <section
          id="combo-hero"
          className="bg-navy flex min-h-[60svh] items-center px-6 py-14 text-center md:min-h-[calc(100svh-72px)] md:px-[8%] md:py-24"
        >
          <div className="mx-auto max-w-[720px]">
            <p className="text-amber mb-4 text-[12px] font-light tracking-[0.12em] uppercase">
              Pure combinations · Traditional methods · Lab verified
            </p>
            <h1 className="text-ivory mb-5 font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-tight font-semibold">
              Combos made for the Indian kitchen. Not marketing bundles.
            </h1>
            <p className="text-ivory/70 mx-auto mb-7 max-w-[600px] text-base leading-relaxed font-light">
              Every product in every combo is independently NABL lab tested. Every combo saves you
              money. Every name comes from your grandmother&apos;s kitchen.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="border-ivory/30 text-ivory rounded-full border px-4 py-1.5 text-[13px] font-medium">
                ✓ Save up to ₹647
              </span>
              <span className="border-ivory/30 text-ivory rounded-full border px-4 py-1.5 text-[13px] font-medium">
                ✓ All NABL verified
              </span>
            </div>
          </div>
        </section>

        <Container className="py-12 md:py-16">
          <Breadcrumb crumbs={crumbs} />
          <div className="mt-8">
            {combos.length === 0 ? (
              <p className="text-navy/60 py-12 text-center">
                Our combos are being prepared. Please check back shortly.
              </p>
            ) : (
              <CombosExplorer combos={combos} />
            )}
          </div>
        </Container>
        <Section tone="dark" ariaLabel="Why Vara combos are different">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow light>Why these combos are different</Eyebrow>
            <h2 className="text-ivory font-serif text-[clamp(2rem,4vw,3rem)] font-semibold">
              Chosen for kitchens, not for clearing shelves.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [
                "Built around real routines",
                "Morning rituals, family cooking, gifting and a complete pantry — each combination has a clear purpose.",
              ],
              [
                "Every food product tested",
                "The products inside carry their own independent lab verification instead of borrowing one claim for the whole box.",
              ],
              [
                "Savings shown honestly",
                "You see the individual MRP total, the final combo price and the exact rupee saving before you add anything.",
              ],
            ].map(([title, body]) => (
              <article key={title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-gold-lt font-serif text-xl font-semibold">{title}</h3>
                <p className="text-ivory/65 mt-3 text-sm leading-relaxed font-light">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section tone="white" ariaLabel="Combo questions">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Questions, answered</Eyebrow>
            <h2 className="text-navy mb-7 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold">
              Before you choose a combo
            </h2>
            <Accordion items={faqs} />
          </div>
        </Section>

        {combos[0] && (
          <section className="bg-paper px-6 py-14 text-center md:px-[8%] md:py-20">
            <p className="text-amber text-[11px] font-semibold tracking-[0.2em] uppercase">
              A good place to start
            </p>
            <h2 className="text-navy mx-auto mt-3 max-w-2xl font-serif text-[clamp(2rem,4vw,3rem)] font-semibold">
              Begin with Mane Ruchi — two everyday essentials, proved pure.
            </h2>
            <Link
              href={`#${combos[0].slug}`}
              className="bg-navy text-ivory hover:bg-amber mt-7 inline-flex rounded-[2px] px-8 py-4 text-xs font-semibold tracking-[0.15em] uppercase transition-colors"
            >
              Choose this combo →
            </Link>
          </section>
        )}
      </main>
      {combos[0] && <ComboStickyBar combo={combos[0]} />}
    </>
  );
}
