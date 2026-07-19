import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import type { FaqItem } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "FAQs",
  description: "Answers to common questions about Vara Organics products, delivery, returns and lab testing.",
  path: "faqs",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "FAQs", path: "/faqs" },
];

// Marketing-owned FAQ copy (Dev Kit §06). Configurable/editable; placeholder
// answers below are honest and non-fabricated.
const faqs: FaqItem[] = [
  {
    question: "Where do you deliver?",
    answer:
      "We deliver across India, with free delivery in Bengaluru on orders above ₹999. Delivery timelines are shown at checkout.",
  },
  {
    question: "How long does delivery take?",
    answer: "Bengaluru orders typically ship within 48 hours. Other locations depend on the courier partner.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes. COD is available at checkout alongside UPI, cards, net banking and wallets.",
  },
  {
    question: "How do I verify my product is genuine?",
    answer:
      "Every jar carries a batch-specific QR code. Scan it, or enter your batch number on the verify page, to see the lab report for that exact batch.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return window. See our Returns page for details and eligibility.",
  },
  {
    question: "Are your products lab-tested?",
    answer:
      "Yes. Every batch is independently NABL lab-tested before it ships, and the report is available via the QR on the jar.",
  },
];

export default function FaqsPage() {
  return (
    <Section tone="ivory" ariaLabel="Frequently asked questions">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4 max-w-[760px]">
        <Eyebrow>Help</Eyebrow>
        <h1 className="mb-8 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold text-navy">
          Frequently asked questions
        </h1>
        <Accordion items={faqs} />
      </div>
    </Section>
  );
}
