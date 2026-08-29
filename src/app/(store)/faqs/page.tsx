import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { faqGroups, siteFaqs } from "@/data/siteFaqs";

export const metadata: Metadata = buildMetadata({
  title: "Vara Organics FAQs — Products, Lab Reports, Delivery & Returns",
  description:
    "Find answers about Vara Organics A2 bilona ghee, raw forest honey, wood pressed oils, lab reports, QR verification, delivery, payments and returns.",
  path: "faqs",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "FAQs", path: "/faqs" },
];

export default function FaqsPage() {
  return (
    <Section tone="ivory" ariaLabel="Frequently asked questions">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(siteFaqs)} />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4 max-w-[860px]">
        <Eyebrow>Help</Eyebrow>
        <h1 className="text-navy font-serif text-[clamp(2rem,4vw,3rem)] font-semibold">
          Frequently asked questions
        </h1>
        <p className="text-navy/65 mt-3 max-w-[720px] text-sm leading-relaxed font-light md:text-base">
          Clear answers about our products, sourcing, laboratory reports, QR verification, ordering,
          delivery, payments and replacements.
        </p>

        <nav aria-label="FAQ categories" className="mt-8 flex flex-wrap gap-2">
          {faqGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="border-navy/15 text-navy hover:border-amber hover:text-amber rounded-full border bg-white px-3 py-1.5 text-xs font-medium transition-colors"
            >
              {group.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-14">
          {faqGroups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className="scroll-mt-36"
              aria-labelledby={`${group.id}-title`}
            >
              <Eyebrow>{group.items.length} questions</Eyebrow>
              <h2
                id={`${group.id}-title`}
                className="text-navy mb-5 font-serif text-[clamp(1.55rem,3vw,2.15rem)] font-semibold"
              >
                {group.title}
              </h2>
              <Accordion items={group.items} />
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
